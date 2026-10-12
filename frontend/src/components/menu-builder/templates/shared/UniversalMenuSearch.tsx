import React from 'react';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';

export interface UniversalMenuSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  accentColor?: string;
  placeholder?: string;
  isDarkTheme?: boolean;
  className?: string;
}

export const UniversalMenuSearch: React.FC<UniversalMenuSearchProps> = ({
  searchQuery,
  onSearchChange,
  accentColor,
  placeholder = 'Search dishes...',
  isDarkTheme = false,
  className = '',
}) => {
  return (
    <div
      role="search"
      aria-label="Menu dish search"
      className={clsx('w-full max-w-xl mx-auto px-1 sm:px-0 my-3 sm:my-4 transition-all', className)}
    >
      <div
        className={clsx(
          'relative flex items-center min-h-[42px] sm:min-h-[46px] rounded-xl sm:rounded-2xl border transition-all duration-200 shadow-sm backdrop-blur-md',
          isDarkTheme
            ? 'bg-black/35 border-white/15 focus-within:border-white/35 focus-within:ring-2 focus-within:ring-white/15'
            : 'bg-white/85 border-black/10 focus-within:border-black/25 focus-within:ring-2 focus-within:ring-black/10'
        )}
      >
        <span
          className={clsx(
            'pl-3.5 pr-2 flex items-center pointer-events-none shrink-0',
            isDarkTheme ? 'text-white/60' : 'text-stone-500'
          )}
          style={accentColor ? { color: accentColor } : undefined}
        >
          <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" aria-hidden="true" />
        </span>

        <input
          type="search"
          aria-label="Search dishes"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className={clsx(
            'w-full min-h-[42px] sm:min-h-[46px] py-2.5 sm:py-3 pr-9 bg-transparent text-xs sm:text-sm font-sans focus:outline-none tracking-wide',
            isDarkTheme ? 'text-white placeholder:text-white/40' : 'text-stone-900 placeholder:text-stone-400'
          )}
        />

        {searchQuery ? (
          <button
            type="button"
            aria-label="Clear search query"
            onClick={() => onSearchChange('')}
            className={clsx(
              'absolute right-2.5 p-1 rounded-full transition-colors cursor-pointer shrink-0',
              isDarkTheme
                ? 'text-white/60 hover:text-white hover:bg-white/10'
                : 'text-stone-500 hover:text-stone-900 hover:bg-black/5'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default UniversalMenuSearch;
