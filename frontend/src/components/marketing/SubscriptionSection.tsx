
export default function SubscriptionSection() {
  return (
    <section className="py-20 md:py-32 px-6 bg-[#1d2723]">
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="order-2 md:order-1 relative">
           <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10"></div>
           <div className="space-y-12 relative z-10 pl-12">
             <div className="relative">
               <div className="absolute -left-[54px] top-1 w-6 h-6 rounded-full bg-[#34b56a] border-4 border-[#1d2723]"></div>
               <h3 className="text-white font-medium text-xl mb-1">Active</h3>
               <p className="text-[#aab7b2]">Menu is live and fully functional.</p>
             </div>
             <div className="relative opacity-50">
               <div className="absolute -left-[54px] top-1 w-6 h-6 rounded-full bg-[#ffc928] border-4 border-[#1d2723]"></div>
               <h3 className="text-white font-medium text-xl mb-1">Warning</h3>
               <p className="text-[#aab7b2]">Subscription expiring soon.</p>
             </div>
             <div className="relative opacity-50">
               <div className="absolute -left-[54px] top-1 w-6 h-6 rounded-full bg-gray-500 border-4 border-[#1d2723]"></div>
               <h3 className="text-white font-medium text-xl mb-1">Expired</h3>
               <p className="text-[#aab7b2]">QR disabled. Safe from hijacking.</p>
             </div>
             <div className="relative opacity-50">
               <div className="absolute -left-[54px] top-1 w-6 h-6 rounded-full bg-[#34b56a] border-4 border-[#1d2723]"></div>
               <h3 className="text-white font-medium text-xl mb-1">Renewed</h3>
               <p className="text-[#aab7b2]">Instantly restored. Same physical QR.</p>
             </div>
           </div>
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-[2rem] md:text-[3rem] font-semibold text-white leading-tight mb-6">Subscription & QR Protection</h2>
          <p className="text-[1.125rem] text-[#aab7b2]">Even if your subscription lapses, we protect your physical QR codes. They remain safely inactive until you return, preventing malicious redirects.</p>
        </div>
      </div>
    </section>
  );
}