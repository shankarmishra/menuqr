
export default function FinalCtaSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
         <div className="text-[30rem] leading-none font-bold">QR</div>
      </div>
      <div className="max-w-[800px] mx-auto text-center relative z-10">
        <h2 className="text-[3rem] md:text-[4rem] font-bold text-white mb-8">Print it once.<br/>Update it anytime.</h2>
        <a href="#/admin/login" className="inline-block bg-[#e8783c] hover:bg-[#ffc928] hover:text-[#151c19] text-white px-10 py-5 rounded-lg font-semibold text-xl transition-colors">
          Get Started Today
        </a>
      </div>
    </section>
  );
}