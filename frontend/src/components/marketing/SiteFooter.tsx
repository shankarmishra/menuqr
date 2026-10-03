import { ChefHat } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="bg-[#151c19] border-t border-[#1d2723] pt-20 pb-10 px-6">
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-4 gap-12 text-[#aab7b2] mb-16">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-white font-bold text-2xl mb-4">
            <ChefHat className="text-[#e8783c]" />
            <span>MENUQR</span>
          </div>
          <p className="max-w-sm">The digital menu platform built for the physical table. Print it once. Update it anytime.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-3">
            <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
            <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-3">
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#1d2723] text-sm">
        <p>&copy; {new Date().getFullYear()} MENUQR. All rights reserved.</p>
      </div>
    </footer>
  );
}