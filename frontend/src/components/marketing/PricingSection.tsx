
export default function PricingSection() {
  return (
    <section className="py-20 md:py-32 px-6" id="pricing">
      <div className="max-w-[1200px] mx-auto text-center mb-16">
        <h2 className="text-[2rem] md:text-[3rem] font-semibold text-white mb-4">Simple, Transparent Pricing</h2>
        <p className="text-[1.125rem] text-[#aab7b2]">For Independent Restaurants</p>
      </div>
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-[#1d2723] p-8 rounded-2xl border border-white/5">
          <h3 className="text-2xl text-white font-medium mb-2">Starter</h3>
          <p className="text-[#aab7b2] mb-6">Perfect for small cafes.</p>
          <div className="text-4xl font-bold text-white mb-8">$19<span className="text-lg text-[#aab7b2] font-normal">/mo</span></div>
          <ul className="space-y-4 mb-8 text-[#aab7b2] text-left">
            <li>✓ Unlimited Scans</li>
            <li>✓ 1 Menu</li>
            <li>✓ Basic Templates</li>
          </ul>
          <button className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-medium transition-colors">Get Started</button>
        </div>
        <div className="bg-[#151c19] p-8 rounded-2xl border border-[#e8783c] relative shadow-lg shadow-[#e8783c]/10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#e8783c] text-white px-3 py-1 rounded-full text-sm font-medium">Recommended</div>
          <h3 className="text-2xl text-white font-medium mb-2">Pro</h3>
          <p className="text-[#aab7b2] mb-6">For growing restaurants.</p>
          <div className="text-4xl font-bold text-white mb-8">$39<span className="text-lg text-[#aab7b2] font-normal">/mo</span></div>
          <ul className="space-y-4 mb-8 text-[#aab7b2] text-left">
            <li>✓ Everything in Starter</li>
            <li>✓ Premium Templates</li>
            <li>✓ Multi-language Support</li>
            <li>✓ Analytics</li>
          </ul>
          <a href="#/admin/login" className="block text-center w-full bg-[#e8783c] hover:bg-[#ffc928] hover:text-[#151c19] text-white py-3 rounded-lg font-medium transition-colors">Start Free Trial</a>
        </div>
      </div>
    </section>
  );
}