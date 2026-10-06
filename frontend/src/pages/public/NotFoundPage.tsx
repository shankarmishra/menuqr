import { Link } from 'react-router-dom';
import { SEO } from '../../seo/SEO';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAF7] px-4 text-center">
      <SEO title="404 - Page Not Found | MenusQR" description="The page you are looking for doesn't exist." />
      <h1 className="text-6xl font-black text-[#151C19] mb-4">404</h1>
      <p className="text-lg text-[#626776] mb-8">Oops! We couldn't find the page you were looking for.</p>
      <Link to="/" className="bg-[#E8783C] text-white font-bold py-3 px-8 rounded-full hover:bg-[#d0672b] transition-colors">
        Go Back Home
      </Link>
    </div>
  );
}
