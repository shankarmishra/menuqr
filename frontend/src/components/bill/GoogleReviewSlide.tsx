/**
 * GoogleReviewSlide.tsx
 * Post-Settlement Interactive Google Review Nudge
 *
 * Features:
 *  - Triggered 1.5s post-settlement to maximize review conversion
 *  - Interactive 5-star rating selection with hover previews
 *  - Adaptive reaction copy tailored to positive and constructive ratings
 *  - Smart fallback to Google Maps search query URL if custom place link is missing
 *  - Accessible dialog sheet with smooth slide-up animation and dismiss controls
 */

import { useEffect, useState } from 'react';

interface Props {
  googleReviewUrl?: string | null;
  restaurantName: string;
  restaurantCity?: string | null;
  onDismiss: () => void;
}

export default function GoogleReviewSlide({
  googleReviewUrl,
  restaurantName,
  restaurantCity,
  onDismiss,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Fallback to Google Maps search review URL if custom review URL is unconfigured
  const targetReviewUrl =
    googleReviewUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      restaurantName + (restaurantCity ? ' ' + restaurantCity : '')
    )}`;

  function handleDismiss() {
    setVisible(false);
    setTimeout(() => onDismiss(), 350);
  }

  const activeStars = hoverRating !== null ? hoverRating : rating;

  const reactionText = {
    5: "Outstanding! We're thrilled you loved it! 🌟",
    4: 'Great to hear! Thank you for dining with us! 😊',
    3: 'Thank you for dining with us. We strive to improve! 🙏',
    2: 'We are sorry your experience was not ideal. 😔',
    1: 'We apologize. Please let our management know! ⚠️',
  }[activeStars] || 'Rate your dining experience:';

  return (
    <div className="google-review-sheet">
      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 9998,
          transition: 'opacity 0.35s ease',
          opacity: visible ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Slide-Up Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Leave a Review"
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
            background: '#ffffff',
            borderRadius: '24px 24px 0 0',
            padding: '12px 24px 28px',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.3)',
            maxWidth: 460,
            margin: '0 auto',
            position: 'relative',
          }}
        >
          {/* Close X Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 14,
              right: 16,
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            ✕
          </button>

          {/* Top Handle bar */}
          <div
            style={{
              width: 44,
              height: 4,
              background: '#e5e7eb',
              borderRadius: 9999,
              margin: '0 auto 16px',
            }}
            aria-hidden="true"
          />

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
              Enjoyed dining at {restaurantName}?
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
              {reactionText}
            </p>

            {/* Interactive 5-Star Rating */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 20,
              }}
              role="radiogroup"
              aria-label="Star Rating"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 32,
                    cursor: 'pointer',
                    transform: activeStars >= star ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.15s ease',
                    filter:
                      activeStars >= star
                        ? 'drop-shadow(0 2px 6px rgba(251, 191, 36, 0.5))'
                        : 'grayscale(100%) opacity(40%)',
                    padding: 4,
                  }}
                  aria-label={`${star} star`}
                >
                  ⭐
                </button>
              ))}
            </div>

            {/* Direct CTA Button */}
            <a
              href={targetReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDismiss}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                background: 'linear-gradient(135deg, #2563eb 0%, #16a34a 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 14,
                padding: '14px 20px',
                borderRadius: 14,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                transition: 'transform 0.15s ease',
              }}
            >
              <span>🌟 Share Review on Google</span>
            </a>

            {/* Dismiss Option */}
            <button
              type="button"
              onClick={handleDismiss}
              style={{
                marginTop: 12,
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 12px',
              }}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
