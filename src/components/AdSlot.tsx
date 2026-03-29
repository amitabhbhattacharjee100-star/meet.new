import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSlot({ slotId }: { slotId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations for the same component instance
    if (initialized.current) return;

    const tryPushAd = () => {
      if (initialized.current) return;
      
      // Ensure the container has width to avoid "No slot size" error
      if (containerRef.current && containerRef.current.offsetWidth > 0) {
        try {
          const adsbygoogle = window.adsbygoogle || [];
          adsbygoogle.push({});
          initialized.current = true;
        } catch (e: any) {
          // Silently handle "already have ads" error which is common in SPAs/React
          if (e && e.message && e.message.includes("already have ads")) {
            initialized.current = true;
            return;
          }
          console.error("AdSense error:", e);
        }
      }
    };

    // Use ResizeObserver for a robust way to detect when the element has a width
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          tryPushAd();
          // Once initialized, we can stop observing
          if (initialized.current && containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Fallback: Small initial delay to ensure DOM is fully ready
    const timer = setTimeout(tryPushAd, 500);
    
    return () => {
      clearTimeout(timer);
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      observer.disconnect();
    };
  }, [slotId]);

  return (
    <div 
      ref={containerRef}
      className="w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-3 flex flex-col items-center justify-center min-h-[100px] my-4 overflow-hidden transition-all hover:border-orange-300 hover:bg-orange-50/30 group"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-orange-600 transition-colors">Advertisement</span>
        <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="w-full flex justify-center min-w-[250px] relative">
        {/* AdSense Element */}
        <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%', minWidth: '250px', minHeight: '50px' }}
             data-ad-client="ca-pub-2186632548756301"
             data-ad-slot={slotId}
             data-ad-format="auto"
             data-full-width-responsive="true"
             data-adtest="on"></ins>
             
        {/* Dev Placeholder - Only visible if AdSense doesn't fill it */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center bg-gray-200/50 rounded-lg border border-gray-300">
          <p className="text-[9px] font-mono text-gray-400">Ad Slot: {slotId}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-2">
        <p className="text-[8px] text-gray-400 font-mono opacity-40 uppercase tracking-tighter">Secure Ad Provider</p>
        <div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
        <button 
          onClick={() => window.open("/premium", "_blank")}
          className="text-[8px] text-orange-600 font-bold hover:underline uppercase tracking-tighter"
        >
          Remove Ads
        </button>
      </div>
    </div>
  );
}
