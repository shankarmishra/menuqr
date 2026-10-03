
export default function OneQrSection() {
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-[2rem] md:text-[3rem] font-semibold text-white leading-tight mb-6">One QR,<br/>Countless Updates</h2>
          <p className="text-[1.125rem] text-[#aab7b2] mb-8">Update prices, hide out-of-stock items, or redesign your entire menu without ever reprinting your table codes.</p>
          <div className="bg-[#1d2723] p-6 rounded-xl border border-white/5 shadow-lg">
             <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <span className="text-white font-medium">Truffle Fries</span>
                <span className="text-[#aab7b2] line-through">$8.00</span>
             </div>
             <div className="flex justify-between items-center text-[#e8783c]">
                <span className="font-medium">New Price</span>
                <span className="font-bold text-xl">$10.00</span>
             </div>
          </div>
        </div>
        <div className="h-[500px] bg-[#1d2723] rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-tr from-[#151c19] to-transparent z-0"></div>
           <div className="w-[280px] h-[580px] bg-[#151c19] rounded-[40px] border-8 border-[#333] relative z-10 flex flex-col shadow-2xl transform rotate-2">
              <div className="flex-1 p-6">
                 <div className="w-full h-32 bg-[#1d2723] rounded-lg mb-4 animate-pulse"></div>
                 <div className="flex justify-between items-center bg-[#1d2723] p-4 rounded-lg border border-[#e8783c]/30">
                    <span className="text-white">Truffle Fries</span>
                    <span className="text-[#e8783c] font-bold">$10.00</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}