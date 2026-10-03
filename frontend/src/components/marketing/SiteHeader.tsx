import {  useState  } from 'react';
import { Menu, X, ChefHat } from 'lucide-react';


export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#151c19]/80 backdrop-blur-[8px] border-b border-[#1d2723]">
      <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <ChefHat className="text-[#e8783c]" />
          <span>MENUQR</span>
        </div>
        <nav className="hidden md:flex gap-8 text-[#aab7b2]">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>
        <div className="hidden md:block">
          <a href="#/admin/login" className="bg-[#e8783c] hover:bg-[#ffc928] hover:text-[#151c19] text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
            Login
          </a>
        </div>
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-[#151c19] border-t border-[#1d2723] p-6 flex flex-col gap-4">
          <a href="#how-it-works" className="text-white text-lg">How it Works</a>
          <a href="#pricing" className="text-white text-lg">Pricing</a>
          <a href="#faq" className="text-white text-lg">FAQ</a>
          <a href="#/admin/login" className="bg-[#e8783c] text-white px-5 py-2.5 rounded-lg font-medium text-center mt-4">Login</a>
        </div>
      )}
    </header>
  );
}