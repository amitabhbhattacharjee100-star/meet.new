import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let stripeClient: Stripe | null = null;
function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Stripe Checkout Endpoint
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const stripe = getStripe();
      const priceId = process.env.STRIPE_PRICE_ID;
      if (!priceId) throw new Error("STRIPE_PRICE_ID is not set");

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.APP_URL}/premium?success=true`,
        cancel_url: `${process.env.APP_URL}/premium?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Matching Logic
  let textQueue: { id: string, country: string, preferredCountry: string }[] = [];
  let videoQueue: { id: string, country: string, peerId: string, preferredCountry: string }[] = [];
  let pairs: { [socketId: string]: { partnerId: string, partnerCountry: string } } = {};

  const countries = ["USA", "India", "UK", "Canada", "Germany", "France", "Japan", "Brazil", "Australia", "Italy"];

  io.on("connection", (socket) => {
    const userCountry = countries[Math.floor(Math.random() * countries.length)];
    socket.data.country = userCountry;

    console.log("User connected:", socket.id, "from", userCountry);

    socket.on("join-text", ({ interests, preferredCountry }: { interests: string[], preferredCountry: string }) => {
      // Find a match
      const partnerIndex = textQueue.findIndex(p => 
        (preferredCountry === "All" || p.country === preferredCountry) &&
        (p.preferredCountry === "All" || userCountry === p.preferredCountry)
      );

      if (partnerIndex !== -1) {
        const partner = textQueue.splice(partnerIndex, 1)[0];
        pairs[socket.id] = { partnerId: partner.id, partnerCountry: partner.country };
        pairs[partner.id] = { partnerId: socket.id, partnerCountry: userCountry };
        
        socket.emit("matched", { partnerId: partner.id, partnerCountry: partner.country });
        io.to(partner.id).emit("matched", { partnerId: socket.id, partnerCountry: userCountry });
      } else {
        textQueue.push({ id: socket.id, country: userCountry, preferredCountry });
        socket.emit("waiting");
      }
    });

    socket.on("join-video", ({ peerId, preferredCountry }: { peerId: string, preferredCountry: string }) => {
      socket.data.peerId = peerId;

      const partnerIndex = videoQueue.findIndex(p => 
        (preferredCountry === "All" || p.country === preferredCountry) &&
        (p.preferredCountry === "All" || userCountry === p.preferredCountry)
      );

      if (partnerIndex !== -1) {
        const partner = videoQueue.splice(partnerIndex, 1)[0];
        pairs[socket.id] = { partnerId: partner.id, partnerCountry: partner.country };
        pairs[partner.id] = { partnerId: socket.id, partnerCountry: userCountry };

        const partnerSocket = io.sockets.sockets.get(partner.id);
        if (partnerSocket) {
          socket.emit("matched", { 
            partnerId: partner.id, 
            partnerPeerId: partner.peerId, 
            partnerCountry: partner.country 
          });
          partnerSocket.emit("matched", { 
            partnerId: socket.id, 
            partnerPeerId: peerId, 
            partnerCountry: userCountry 
          });
        }
      } else {
        videoQueue.push({ id: socket.id, country: userCountry, peerId, preferredCountry });
        socket.emit("waiting");
      }
    });

    socket.on("send-message", (message: string) => {
      const pair = pairs[socket.id];
      if (pair) {
        io.to(pair.partnerId).emit("receive-message", message);
      }
    });

    socket.on("typing", (isTyping: boolean) => {
      const pair = pairs[socket.id];
      if (pair) {
        io.to(pair.partnerId).emit("partner-typing", isTyping);
      }
    });

    socket.on("next", () => {
      disconnectPair(socket.id);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      disconnectPair(socket.id);
    });

    function disconnectPair(socketId: string) {
      const pair = pairs[socketId];
      if (pair) {
        const partnerId = pair.partnerId;
        io.to(partnerId).emit("partner-disconnected");
        delete pairs[partnerId];
        delete pairs[socketId];
      }
      // Remove from queues if present
      textQueue = textQueue.filter(user => user.id !== socketId);
      videoQueue = videoQueue.filter(user => user.id !== socketId);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
