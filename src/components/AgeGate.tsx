import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert } from "lucide-react";

export default function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-100"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-orange-100 p-4 rounded-full">
              <ShieldAlert className="w-12 h-12 text-orange-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Age Verification Required</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            You must be at least 18 years old to use QuickMeet. By entering, you agree to our Terms of Service and Privacy Policy.
          </p>
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-200 active:scale-95"
            >
              I am 18 or older - Enter
            </button>
            <button
              onClick={() => window.location.href = "https://google.com"}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-4 rounded-xl transition-all active:scale-95"
            >
              I am under 18 - Exit
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
