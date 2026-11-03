/**
 * GoogleReviewSlide.tsx
 * Slides up from the bottom after payment is confirmed.
 * Prompts the customer to leave a Google Review.
 *
 * Returns null if no googleReviewUrl is provided.
 */

import { useEffect, useState } from 'react';

interface Props {
  googleReviewUrl: string | null | undefined;
  restaurantName: string;
  onDismiss: () => void;
}

export default function GoogleReviewSlide({ googleReviewUrl, restaurantName, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60); // slight delay for paint
    return () => clearTimeout(t);
  }, []);

  // Don't render if no URL
  if (!googleReviewUrl) return null;

  function handleDismiss() {
    setVisible(false);
    // Wait for slide-out animation to finish
    setTimeout(() => onDismiss(), 350);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 9998,
          transition: 'opacity 0.35s ease',
          opacity: visible ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Slide-up sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Leave a Google Review"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '20px 20px 0 0',
            padding: '8px 0 0',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          {/* Handle bar */}
          <div
            style={{
              width: 40,
              height: 4,
              background: '#e5e7eb',
              borderRadius: 9999,
              margin: '0 auto 20px',
            }}
            aria-hidden="true"
          />

          {/* Content */}
          <div style={{ padding: '0 28px 32px', textAlign: 'center' }}>
            {/* Stars */}
            <div
              style={{
                fontSize: 32,
                letterSpacing: 4,
                marginBottom: 12,
                lineHeight: 1,
              }}
              aria-hidden="true"
            >
              ⭐⭐⭐⭐⭐
            </div>

            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#111827',
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              Enjoying your meal?
            </h2>

            <p
              style={{
                fontSize: 14,
                color: '#6b7280',
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Help others discover{' '}
              <strong style={{ color: '#374151' }}>{restaurantName}</strong> — it takes
              just 10 seconds! 🙏
            </p>

            {/* CTA Button */}
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDismiss}
              style={{
                display: 'block',
                background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                padding: '14px 24px',
                borderRadius: 12,
                textDecoration: 'none',
                marginBottom: 12,
                boxShadow: '0 4px 14px rgba(66,133,244,0.35)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(0.97)';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
              }}
            >
              🌟 Write a Review on Google
            </a>

            {/* Dismiss */}
            <button
              type="button"
              onClick={handleDismiss}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: 13,
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: 8,
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#6b7280'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; }}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
