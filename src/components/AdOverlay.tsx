import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import AdSlot from "./AdSlot";
import { motion, AnimatePresence } from "motion/react";

interface AdOverlayProps {
  onClose: () => void;
  isOpen: boolean;
}

export default function AdOverlay({ onClose, isOpen }: AdOverlayProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Sponsored Break</span>
              </div>
              
              <button
                onClick={onClose}
                disabled={countdown > 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  countdown > 0 
                    ? "text-gray-300 cursor-not-allowed" 
                    : "text-orange-600 hover:bg-orange-50 active:scale-95"
                }`}
              >
                {countdown > 0 ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Skip in {countdown}s
                  </>
                ) : (
                  <>
                    Continue to Chat
                    <X className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
              <AdSlot slotId="INTERSTITIAL_AD" />
              
              <div className="mt-8 text-center">
                <h3 className="text-xl font-bold mb-2">Support QuickMeet</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Ads help us keep this service free for everyone. Want to remove ads forever? 
                  <button 
                    onClick={() => window.open("/premium", "_blank")}
                    className="text-orange-600 font-bold ml-1 hover:underline"
                  >
                    Upgrade to Premium
                  </button>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
