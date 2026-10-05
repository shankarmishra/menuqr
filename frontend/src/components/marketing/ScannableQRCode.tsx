import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface ScannableQRCodeProps {
  url: string;
  size?: number;
  className?: string;
}

export default function ScannableQRCode({ url, size = 110, className = '' }: ScannableQRCodeProps) {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    let isCurrent = true;
    void QRCode.toString(url, {
      type: 'svg',
      margin: 0,
      color: {
        dark: '#151C19',
        light: '#FFFFFF',
      },
    })
      .then((svg) => {
        if (isCurrent && svg) setSvgContent(svg);
      })
      .catch((err) => {
        console.error('Failed to generate QR code SVG:', err);
      });

    return () => {
      isCurrent = false;
    };
  }, [url]);

  if (!svgContent) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 rounded-lg animate-pulse flex items-center justify-center ${className}`}
      >
        <span className="text-[9px] font-mono text-slate-400">QR</span>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`[&>svg]:w-full [&>svg]:h-full [&>svg]:block ${className}`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
