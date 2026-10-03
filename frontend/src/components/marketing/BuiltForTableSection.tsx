
export default function BuiltForTableSection() {
  const settings = ['Restaurant Table', 'Coffee Shop Counter', 'Hotel Reception'];
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-[2rem] md:text-[3rem] font-semibold text-white mb-12 text-center">Built for the Table</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {settings.map((setting, i) => (
            <div key={i} className="group aspect-square bg-[#1d2723] rounded-2xl border border-white/5 overflow-hidden relative cursor-pointer hover:border-[#ffc928]/50 transition-colors">
               <div className="absolute inset-0 flex items-center justify-center text-[#aab7b2] group-hover:scale-105 transition-transform duration-500">
                  [{setting} Render]
               </div>
               <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#151c19] to-transparent">
                  <h3 className="text-white text-xl font-medium">{setting}</h3>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}