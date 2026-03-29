import { Star, Check, Zap, Shield, Globe, MessageSquare, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import AdSlot from "../components/AdSlot";

export default function Premium() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const handleUpgrade = async () => {
    // Using the provided Stripe Payment Link directly
    window.location.href = "https://buy.stripe.com/test_bJe4gyfn65YTcOH1lO2Ji01";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {success && (
        <div className="mb-8 p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl text-center font-bold">
          🎉 Welcome to Premium! Your subscription is now active.
        </div>
      )}
      {canceled && (
        <div className="mb-8 p-4 bg-orange-50 border border-orange-100 text-orange-700 rounded-2xl text-center font-bold">
          Checkout canceled. No worries, you can upgrade anytime!
        </div>
      )}

      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-6">Upgrade to <span className="text-orange-600">Premium</span></h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Get the ultimate QuickMeet experience with exclusive features and no interruptions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-2xl font-bold mb-2">Free</h2>
          <p className="text-gray-400 mb-6 font-medium uppercase tracking-widest text-xs">Standard Experience</p>
          <div className="text-4xl font-black mb-8">$0<span className="text-lg text-gray-400 font-medium">/mo</span></div>
          
          <ul className="space-y-4 mb-12 flex-1">
            <li className="flex items-center gap-3 text-gray-600">
              <Check className="w-5 h-5 text-green-500" />
              Random Text Chat
            </li>
            <li className="flex items-center gap-3 text-gray-600">
              <Check className="w-5 h-5 text-green-500" />
              Random Video Chat
            </li>
            <li className="flex items-center gap-3 text-gray-400 line-through">
              Ad-free experience
            </li>
            <li className="flex items-center gap-3 text-gray-400 line-through">
              Gender & Country filters
            </li>
            <li className="flex items-center gap-3 text-gray-400 line-through">
              Premium Badge
            </li>
          </ul>

          <button
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-xl border-2 border-gray-100 font-bold text-gray-500 hover:bg-gray-50 transition-all"
          >
            Continue Free
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-orange-600 text-white px-6 py-2 rounded-bl-2xl font-bold text-xs uppercase tracking-widest">
            Recommended
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Premium</h2>
          <p className="text-gray-500 mb-6 font-medium uppercase tracking-widest text-xs">Elite Experience</p>
          <div className="text-4xl font-black mb-8 text-white">$9.99<span className="text-lg text-gray-500 font-medium">/mo</span></div>
          
          <ul className="space-y-4 mb-12 flex-1">
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-orange-500" />
              Everything in Free
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-orange-500" />
              <strong>No Ads</strong> forever
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-orange-500" />
              Gender & Country filters
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-orange-500" />
              Interest matching priority
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-orange-500" />
              Exclusive Premium Badge
            </li>
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/50 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upgrade Now"}
          </button>
        </div>
      </div>

      {/* Why Premium? */}
      <div className="mt-24 grid md:grid-cols-3 gap-12">
        <div className="text-center">
          <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="text-orange-600 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3">Priority Matching</h3>
          <p className="text-gray-500">Get matched with high-quality strangers faster than anyone else.</p>
        </div>
        <div className="text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe className="text-blue-600 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3">Location Filter</h3>
          <p className="text-gray-500">Choose which countries you want to connect with.</p>
        </div>
        <div className="text-center">
          <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="text-purple-600 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3">Enhanced Safety</h3>
          <p className="text-gray-500">Advanced moderation tools to ensure a clean experience.</p>
        </div>
      </div>

      <div className="mt-16">
        <AdSlot slotId="PREMIUM_PAGE_BOTTOM" />
      </div>
    </div>
  );
}
