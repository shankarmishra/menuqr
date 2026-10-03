
export default function HowItWorksSection() {
  return (
    <section className="py-20 md:py-32 px-6" id="how-it-works">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-[2rem] md:text-[3rem] font-semibold text-white text-center mb-16">How MENUQR Works</h2>
        <div className="grid md:grid-cols-3 gap-8 relative">
           {[
             { title: '1. Sign Up', desc: 'Create your account in seconds.' },
             { title: '2. Add Items', desc: 'Easily input your menu data.' },
             { title: '3. Customize', desc: 'Select a premium template.' },
             { title: '4. Generate QR', desc: 'Download your unique codes.' },
             { title: '5. Print & Place', desc: 'Put them on your tables.' },
             { title: '6. Update Anytime', desc: 'Changes go live instantly.' }
           ].map((step, i) => (
             <div key={i} className="bg-[#1d2723] p-8 rounded-2xl border border-white/5 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[#e8783c] font-bold">{i+1}</div>
                <h3 className="text-white text-xl font-medium mb-2">{step.title}</h3>
                <p className="text-[#aab7b2]">{step.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}