import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import VideoChat from "./pages/VideoChat";
import Premium from "./pages/Premium";
import Legal from "./pages/Legal";
import AgeGate from "./components/AgeGate";
import { useState, useEffect } from "react";

export default function App() {
  const [isAdult, setIsAdult] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("isAdult");
    if (saved === "true") setIsAdult(true);
  }, []);

  const handleConfirmAge = () => {
    localStorage.setItem("isAdult", "true");
    setIsAdult(true);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        {isAdult === null && <AgeGate onConfirm={handleConfirmAge} />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/video" element={<VideoChat />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/legal" element={<Legal />} />
        </Routes>
      </div>
    </Router>
  );
}
