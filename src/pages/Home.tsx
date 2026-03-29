import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Video, Shield, Zap, Users, Star } from "lucide-react";
import { motion } from "motion/react";
import AdSlot from "../components/AdSlot";

export default function Home() {
  const [interests, setInterests] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const navigate = useNavigate();

  const countries = ["All", "USA", "India", "UK", "Canada", "Germany", "France", "Japan", "Brazil", "Australia", "Italy"];

  const handleStart = (type: "text" | "video") => {
    const interestList = interests.split(",").map(i => i.trim()).filter(i => i !== "");
    localStorage.setItem("interests", JSON.stringify(interestList));
    localStorage.setItem("preferredCountry", selectedCountry);
    navigate(type === "text" ? "/chat" : "/video");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 p-2 rounded-lg">
            <MessageSquare className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-orange-600">QUICKMEET</h1>
        </div>
        <nav className="flex items-center gap-6">
          <button onClick={() => navigate("/premium")} className="text-sm font-bold text-orange-600 flex items-center gap-1 hover:underline">
            <Star className="w-4 h-4 fill-orange-600" />
            Go Premium
          </button>
          <button onClick={() => navigate("/legal")} className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Terms & Privacy
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="grid lg:grid-cols-2 gap-12 items-center mb-16">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h2 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
            Talk to <span className="text-orange-600 underline decoration-orange-200 underline-offset-8">Strangers</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            QuickMeet is the best way to meet new people instantly. No registration required. Just pick a mode and start chatting!
          </p>
          
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Interests</label>
                <input
                  type="text"
                  placeholder="e.g. music, gaming, coding..."
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-orange-600 outline-none transition-all"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Country Filter</label>
                <select
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-orange-600 outline-none transition-all appearance-none cursor-pointer"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  {countries.map(c => (
                    <option key={c} value={c}>{c === "All" ? "🌍 All Countries" : c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleStart("text")}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-200"
              >
                <MessageSquare className="w-5 h-5" />
                Text Chat
              </button>
              <button
                onClick={() => handleStart("video")}
                className="bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-gray-200"
              >
                <Video className="w-5 h-5" />
                Video Chat
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://picsum.photos/seed/${i}/40/40`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
              ))}
            </div>
            <p><strong>12,402+</strong> users online right now</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="relative"
        >
          <div className="bg-orange-100 absolute inset-0 rounded-3xl rotate-3 -z-10"></div>
          <img
            src="https://picsum.photos/seed/chat/800/600"
            alt="Chatting"
            className="rounded-3xl shadow-2xl w-full object-cover aspect-square lg:aspect-video"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 max-w-[200px]">
            <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">New Connection</p>
            <p className="text-sm font-medium">"Hey! Anyone here like coding in React?"</p>
          </div>
        </motion.div>
      </section>

      {/* Ad Section */}
      <AdSlot slotId="HOMEPAGE_BANNER" />

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-blue-100 p-3 rounded-2xl w-fit mb-6">
            <Shield className="text-blue-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">Safe & Secure</h3>
          <p className="text-gray-500 leading-relaxed">We don't store your chat data. Our reporting system keeps the community clean.</p>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-purple-100 p-3 rounded-2xl w-fit mb-6">
            <Zap className="text-purple-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">Instant Match</h3>
          <p className="text-gray-500 leading-relaxed">No waiting in long queues. Our advanced algorithm matches you in seconds.</p>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-green-100 p-3 rounded-2xl w-fit mb-6">
            <Users className="text-green-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">Global Community</h3>
          <p className="text-gray-500 leading-relaxed">Meet people from all over the world and learn about different cultures.</p>
        </div>
      </section>

      {/* Footer Ad */}
      <div className="mb-16">
        <AdSlot slotId="HOMEPAGE_BOTTOM_BANNER" />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
        <p>&copy; 2026 QuickMeet. All rights reserved. You must be 18+ to use this site.</p>
      </footer>
    </div>
  );
}
