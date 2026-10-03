
export default function CustomerExperienceSection() {
  return (
    <section className="py-20 md:py-32 px-6 bg-[#1d2723] relative">
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-12">
        <div className="space-y-32 py-32">
           <div>
              <h3 className="text-3xl font-semibold text-white mb-4">Fast Loading</h3>
              <p className="text-lg text-[#aab7b2]">Optimized to load instantly on any connection.</p>
           </div>
           <div>
              <h3 className="text-3xl font-semibold text-white mb-4">Dietary Filters</h3>
              <p className="text-lg text-[#aab7b2]">Clear Veg/Non-Veg indicators and allergen tags.</p>
           </div>
           <div>
              <h3 className="text-3xl font-semibold text-white mb-4">Beautiful UI</h3>
              <p className="text-lg text-[#aab7b2]">A menu your customers will love using.</p>
           </div>
        </div>
        <div className="hidden md:block relative">
           <div className="sticky top-32 w-[300px] h-[600px] bg-[#151c19] border-8 border-[#333] rounded-[40px] shadow-2xl mx-auto overflow-hidden">
              <div className="p-4 space-y-4">
                 <div className="w-full h-40 bg-[#1d2723] rounded-xl"></div>
                 <div className="w-full h-24 bg-[#1d2723] rounded-xl flex items-center p-4 gap-4">
                   <div className="w-4 h-4 rounded-sm border-2 border-[#34b56a] flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#34b56a]"></div></div>
                   <div className="flex-1 h-4 bg-white/10 rounded"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}