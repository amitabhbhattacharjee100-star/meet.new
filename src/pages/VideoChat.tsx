import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Peer from "peerjs";
import { X, SkipForward, Flag, Star, Mic, MicOff, Video, VideoOff, Send, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AdSlot from "../components/AdSlot";
import AdOverlay from "../components/AdOverlay";
import { getCountryInfo } from "../services/geminiService";

export default function VideoChat() {
  const [status, setStatus] = useState<"waiting" | "connected" | "disconnected" | "error">("waiting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [partnerCountry, setPartnerCountry] = useState<string | null>(null);
  const [countryInfo, setCountryInfo] = useState<string | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
  const [input, setInput] = useState("");
  const [skipCount, setSkipCount] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [nextThreshold, setNextThreshold] = useState(Math.floor(Math.random() * 4) + 2); // 2-5
  
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "connected") {
      startTimeRef.current = Date.now();
    }
  }, [status]);

  useEffect(() => {
    const initMedia = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Your browser does not support video chat.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        
        initPeer(stream);
      } catch (err: any) {
        console.error("Failed to get media", err);
        setStatus("error");
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMessage("Camera and microphone access was denied. Please check your browser settings and allow access to use video chat.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setErrorMessage("No camera or microphone found. Please connect your devices and try again.");
        } else {
          setErrorMessage(err.message || "An error occurred while accessing your camera and microphone.");
        }
      }
    };

    const initPeer = (stream: MediaStream) => {
      peerRef.current = new Peer();
      
      peerRef.current.on("open", (id) => {
        socketRef.current = io();
        const preferredCountry = localStorage.getItem("preferredCountry") || "All";
        socketRef.current.emit("join-video", { peerId: id, preferredCountry });
        
        socketRef.current.on("waiting", () => setStatus("waiting"));
        
        socketRef.current.on("matched", ({ partnerPeerId, partnerCountry }: { partnerPeerId: string, partnerCountry: string }) => {
          setStatus("connected");
          setPartnerCountry(partnerCountry);
          const call = peerRef.current!.call(partnerPeerId, stream);
          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          });
        });

        socketRef.current.on("receive-message", (text: string) => {
          setMessages(prev => [...prev, { sender: "Stranger", text }]);
        });

        socketRef.current.on("partner-disconnected", () => {
          setStatus("disconnected");
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        });
      });

      peerRef.current.on("call", (call) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          setStatus("connected");
        });
      });
    };

    initMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      socketRef.current?.disconnect();
      peerRef.current?.destroy();
    };
  }, []);

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
    setStatus("waiting");
    setPartnerCountry(null);
    setCountryInfo(null);
    setMessages([]);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    const preferredCountry = localStorage.getItem("preferredCountry") || "All";
    socketRef.current?.emit("join-video", { peerId: peerRef.current?.id, preferredCountry });
  };

  const fetchCountryInfo = async () => {
    if (!partnerCountry || loadingInfo) return;
    setLoadingInfo(true);
    const info = await getCountryInfo(partnerCountry);
    setCountryInfo(info || "No info available.");
    setLoadingInfo(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "connected") return;
    socketRef.current?.emit("send-message", input);
    setMessages(prev => [...prev, { sender: "You", text: input }]);
    setInput("");
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoOn(videoTrack.enabled);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black tracking-tighter text-orange-600">QUICKMEET</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">
            <div className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-green-500 animate-pulse" : "bg-orange-500"}`}></div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">{status}</span>
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
        {/* Video Grid */}
        <main className="flex-1 flex flex-col p-4 gap-4 relative">
          {/* Top Ad Banner */}
          <div className="pb-2">
            <AdSlot slotId="VIDEO_CHAT_TOP_BANNER" />
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Remote Video */}
            <div className="relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl aspect-video md:aspect-auto">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {status === "waiting" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-4">
                  <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bold uppercase tracking-widest text-sm">Finding Stranger...</p>
                </div>
              )}
              {status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-zinc-950/90 backdrop-blur-md z-50">
                  <div className="bg-red-500/20 p-4 rounded-full mb-6">
                    <VideoOff className="w-12 h-12 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Media Access Error</h3>
                  <p className="text-zinc-400 mb-8 max-w-md leading-relaxed">
                    {errorMessage}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                    <button 
                      onClick={() => window.location.reload()}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
                    >
                      Try Again
                    </button>
                    <button 
                      onClick={() => navigate("/")}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
                    >
                      Go Home
                    </button>
                  </div>
                </div>
              )}
              {status === "disconnected" && (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                  <p className="font-bold uppercase tracking-widest text-sm">Stranger Disconnected</p>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                Stranger {partnerCountry ? `from ${partnerCountry}` : ""}
              </div>
            </div>

            {/* Local Video */}
            <div className="relative bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl aspect-video md:aspect-auto">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                You
              </div>
              
              {/* Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
                <button onClick={toggleMic} className={`p-4 rounded-xl transition-all ${micOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500 text-white"}`}>
                  {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>
                <button onClick={toggleVideo} className={`p-4 rounded-xl transition-all ${videoOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500 text-white"}`}>
                  {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
                <div className="w-px h-8 bg-white/10 mx-2"></div>
                <button onClick={handleNext} className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl transition-all active:scale-95 flex items-center gap-2 font-bold shadow-lg shadow-orange-900/50">
                  <SkipForward className="w-6 h-6" />
                  <span>Next</span>
                </button>
                <button className="p-4 text-zinc-500 hover:text-red-500 transition-colors">
                  <Flag className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Ad Banner inside Video Chat */}
          <div className="px-4 pb-4">
            <AdSlot slotId="VIDEO_CHAT_INNER_BANNER" />
          </div>
        </main>

        {/* Side Chat (Desktop) */}
        <aside className="hidden lg:flex w-80 bg-zinc-900 border-l border-zinc-800 flex-col">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Chat</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className="text-sm">
                <span className={`font-bold mr-2 ${msg.sender === "You" ? "text-orange-500" : "text-blue-400"}`}>{msg.sender}:</span>
                <span className="text-zinc-300">{msg.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 flex gap-2">
            <input
              type="text"
              placeholder="Type to chat..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-600 outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700">
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="p-4 border-t border-zinc-800">
            {partnerCountry && (
              <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 shadow-sm mb-4">
                <h3 className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2">Stranger's Country</h3>
                <p className="text-sm font-bold text-white mb-3">{partnerCountry}</p>
                <button 
                  onClick={fetchCountryInfo}
                  disabled={loadingInfo}
                  className="w-full bg-zinc-700 border border-zinc-600 text-orange-500 text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-600 transition-colors disabled:opacity-50"
                >
                  <Info className="w-3 h-3" />
                  {loadingInfo ? "Loading..." : "Fun Facts"}
                </button>
                {countryInfo && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 text-[10px] text-zinc-400 leading-relaxed bg-black/30 p-2 rounded-lg border border-zinc-800"
                  >
                    {countryInfo}
                  </motion.div>
                )}
              </div>
            )}
            <AdSlot slotId="VIDEO_CHAT_SIDEBAR" />
          </div>
        </aside>
      </div>
    </div>
  );
}
