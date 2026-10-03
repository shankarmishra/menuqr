
export default function DashboardDemoSection() {
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-[1200px] mx-auto text-center mb-16">
        <h2 className="text-[2rem] md:text-[3rem] font-semibold text-white">Powerful Dashboard</h2>
        <p className="text-[#aab7b2] text-lg">Managing your menu is as easy as typing.</p>
      </div>
      <div className="max-w-5xl mx-auto aspect-video bg-[#1d2723] rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
         <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-[#34b56a]"></div>
         </div>
         <div className="flex-1 flex items-center justify-center text-[#aab7b2]">
            Self-playing dashboard demo showing item creation
         </div>
      </div>
    </section>
  );
}