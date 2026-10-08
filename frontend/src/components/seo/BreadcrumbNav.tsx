import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbItem } from '../../seo/structuredData';

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-xs text-[#53615a]">
      <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
        <li className="flex items-center">
          <Link to="/" className="flex items-center gap-1 hover:text-[#e8783c] transition-colors font-medium">
            <Home size={14} />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="text-[#aab7b2]" />
            {index === items.length - 1 ? (
              <span className="font-semibold text-[#151c19]" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link to={item.path} className="hover:text-[#e8783c] transition-colors font-medium">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
