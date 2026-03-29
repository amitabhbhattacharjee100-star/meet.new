import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Send, X, SkipForward, Flag, Star, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AdSlot from "../components/AdSlot";
import AdOverlay from "../components/AdOverlay";
import { getCountryInfo } from "../services/geminiService";

interface Message {
  id: string;
  text: string;
  sender: "me" | "stranger" | "system";
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"waiting" | "connected" | "disconnected">("waiting");
  const [partnerCountry, setPartnerCountry] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [countryInfo, setCountryInfo] = useState<string | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [skipCount, setSkipCount] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [nextThreshold, setNextThreshold] = useState(Math.floor(Math.random() * 4) + 2); // 2-5
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    // Reset timer on match
    if (status === "connected") {
      startTimeRef.current = Date.now();
    }
  }, [status]);

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on("waiting", () => {
      setStatus("waiting");
      setMessages([{ id: "sys-1", text: "Looking for a stranger...", sender: "system" }]);
    });

    socketRef.current.on("matched", ({ partnerCountry }: { partnerCountry: string }) => {
      setStatus("connected");
      setPartnerCountry(partnerCountry);
      setMessages([{ id: "sys-2", text: `You're now chatting with a stranger from ${partnerCountry}. Say hi!`, sender: "system" }]);
    });

    socketRef.current.on("receive-message", (text: string) => {
      setMessages(prev => [...prev, { id: Date.now().toString(), text, sender: "stranger" }]);
    });

    socketRef.current.on("partner-typing", (typing: boolean) => {
      setPartnerTyping(typing);
    });

    socketRef.current.on("partner-disconnected", () => {
      setStatus("disconnected");
      setMessages(prev => [...prev, { id: "sys-3", text: "Stranger has disconnected.", sender: "system" }]);
    });

    const interests = JSON.parse(localStorage.getItem("interests") || "[]");
    const preferredCountry = localStorage.getItem("preferredCountry") || "All";
    socketRef.current.emit("join-text", { interests, preferredCountry });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || status !== "connected") return;

    socketRef.current?.emit("send-message", input);
    setMessages(prev => [...prev, { id: Date.now().toString(), text: input, sender: "me" }]);
    setInput("");
    socketRef.current?.emit("typing", false);
  };

  const handleNext = () => {
    const newSkipCount = skipCount + 1;
    setSkipCount(newSkipCount);

    const duration = (Date.now() - startTimeRef.current) / 1000;
    const isLongChat = duration > 60; // 1 minute

    if (newSkipCount >= nextThreshold || isLongChat) {
      setShowAd(true);
      setSkipCount(0);
      setNextThreshold(Math.floor(Math.random() * 4) + 2);
    } else {
      performNext();
    }
  };

  const performNext = () => {
    socketRef.current?.emit("next");
    setMessages([]);
    setPartnerCountry(null);
    setCountryInfo(null);
    const interests = JSON.parse(localStorage.getItem("interests") || "[]");
    const preferredCountry = localStorage.getItem("preferredCountry") || "All";
    socketRef.current?.emit("join-text", { interests, preferredCountry });
  };

  const fetchCountryInfo = async () => {
    if (!partnerCountry || loadingInfo) return;
    setLoadingInfo(true);
    const info = await getCountryInfo(partnerCountry);
    setCountryInfo(info || "No info available.");
    setLoadingInfo(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current?.emit("typing", true);
    }
    
    // Simple debounce for typing indicator
    const timeout = setTimeout(() => {
      setIsTyping(false);
      socketRef.current?.emit("typing", false);
    }, 2000);
    
    return () => clearTimeout(timeout);
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black tracking-tighter text-orange-600">QUICKMEET</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
            <div className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-green-500 animate-pulse" : "bg-orange-500"}`}></div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{status}</span>
          </div>
          <button onClick={() => navigate("/premium")} className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 transition-colors">
            <Star className="w-5 h-5 fill-white" />
          </button>
        </div>
      </header>

      <AdOverlay 
        isOpen={showAd} 
        onClose={() => {
          setShowAd(false);
          performNext();
        }} 
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Ad Sidebar */}
        <aside className="hidden lg:flex w-64 border-r border-gray-100 p-4 flex-col gap-4 bg-gray-50/50">
          <AdSlot slotId="CHAT_SIDEBAR_1" />
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Safety Tips</h3>
            <ul className="text-xs text-gray-500 space-y-2">
              <li>• Don't share personal info</li>
              <li>• Report abusive users</li>
              <li>• Be respectful</li>
            </ul>
          </div>
          {partnerCountry && (
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm">
              <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">Stranger's Country</h3>
              <p className="text-sm font-bold mb-3">{partnerCountry}</p>
              <button 
                onClick={fetchCountryInfo}
                disabled={loadingInfo}
                className="w-full bg-white border border-orange-200 text-orange-600 text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors disabled:opacity-50"
              >
                <Info className="w-3 h-3" />
                {loadingInfo ? "Loading..." : "Fun Facts"}
              </button>
              {countryInfo && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 text-[10px] text-gray-600 leading-relaxed bg-white p-2 rounded-lg border border-orange-50"
                >
                  {countryInfo}
                </motion.div>
              )}
            </div>
          )}
          <AdSlot slotId="CHAT_SIDEBAR_2" />
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col relative bg-white">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "me" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start"}`}
                >
                  {msg.sender === "system" ? (
                    <div className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                      {msg.text}
                    </div>
                  ) : (
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                      msg.sender === "me" 
                        ? "bg-orange-600 text-white rounded-tr-none" 
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {partnerTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-full flex gap-1 items-center">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ad Banner inside Chat */}
          <div className="px-4">
            <AdSlot slotId="CHAT_INNER_BANNER" />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <form onSubmit={handleSend} className="flex gap-3 items-center max-w-4xl mx-auto">
              <button
                type="button"
                onClick={handleNext}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-xl transition-all active:scale-95 flex items-center gap-2 font-bold text-sm"
              >
                <SkipForward className="w-5 h-5" />
                <span className="hidden sm:inline">Next</span>
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-orange-600 outline-none transition-all"
                  value={input}
                  onChange={handleInputChange}
                  disabled={status !== "connected"}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || status !== "connected"}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 text-white p-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-orange-200"
              >
                <Send className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                title="Report Stranger"
              >
                <Flag className="w-5 h-5" />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
