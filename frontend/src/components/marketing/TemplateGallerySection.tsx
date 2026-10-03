
export default function TemplateGallerySection() {
  return (
    <section className="py-20 md:py-32 px-6 bg-[#1d2723] overflow-hidden">
      <div className="max-w-[1200px] mx-auto mb-12">
        <h2 className="text-[2rem] md:text-[3rem] font-semibold text-white">Template Gallery</h2>
        <p className="text-[#aab7b2] text-lg">10 distinct layouts. Not just color swaps.</p>
      </div>
      <div className="flex gap-6 px-6 md:px-12 overflow-x-auto pb-8 snap-x">
        {[1,2,3,4,5,6,7,8,9,10].map(i => (
          <div key={i} className="min-w-[280px] md:min-w-[320px] aspect-[9/16] bg-[#151c19] border border-white/10 rounded-2xl snap-center flex flex-col p-4 shadow-xl">
            <div className="w-full h-32 bg-white/5 rounded-lg mb-4"></div>
            <div className="flex-1 space-y-3">
              <div className="w-3/4 h-4 bg-white/10 rounded"></div>
              <div className="w-1/2 h-4 bg-white/10 rounded"></div>
            </div>
            <div className="text-[#aab7b2] text-sm text-center">Template {i}</div>
          </div>
        ))}
      </div>
    </section>
  );
}