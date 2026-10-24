import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface IsolatedMobileFrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
}

/**
 * IsolatedMobileFrame
 * 
 * Renders an isolated true-mobile viewport inside an iframe using React Portal.
 * This guarantees that CSS viewport media queries (@media min-width: 640px / sm: / md:)
 * strictly evaluate against the mobile phone width rather than leaking desktop browser widths.
 * 
 * Synchronizes all stylesheets, Google fonts, and CSS variables from the parent document.
 */
export default function IsolatedMobileFrame({
  children,
  className = '',
  style,
  backgroundColor = 'transparent',
}: IsolatedMobileFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // Initialize document structure if needed
    if (!doc.getElementById('mobile-preview-root')) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html lang="en" class="h-full">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <style>
              /* Mobile scrollbar styling */
              ::-webkit-scrollbar {
                width: 4px;
                height: 4px;
              }
              ::-webkit-scrollbar-track {
                background: transparent;
              }
              ::-webkit-scrollbar-thumb {
                background: rgba(150, 150, 150, 0.35);
                border-radius: 4px;
              }
              ::-webkit-scrollbar-thumb:hover {
                background: rgba(150, 150, 150, 0.6);
              }
              html, body {
                height: 100%;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                overflow-x: hidden;
                overflow-y: auto;
              }
            </style>
          </head>
          <body class="h-full">
            <div id="mobile-preview-root" style="min-height: 100%; display: flex; flex-direction: column;"></div>
          </body>
        </html>
      `);
      doc.close();
    }

    // Clone parent document stylesheets & fonts into iframe head
    const syncStyles = () => {
      const parentHead = document.head;
      const iframeHead = doc.head;
      if (!parentHead || !iframeHead) return;

      // Copy class name from parent html if any
      doc.documentElement.className = document.documentElement.className;

      // Collect existing cloned tags
      const existingHrefs = new Set(
        Array.from(iframeHead.querySelectorAll('link[rel="stylesheet"]'))
          .map((el) => (el as HTMLLinkElement).href)
          .filter(Boolean)
      );

      // Clone links
      const linkElements = parentHead.querySelectorAll('link[rel="stylesheet"]');
      linkElements.forEach((el) => {
        const link = el as HTMLLinkElement;
        if (!existingHrefs.has(link.href)) {
          const clone = link.cloneNode(true) as HTMLLinkElement;
          iframeHead.appendChild(clone);
          existingHrefs.add(link.href);
        }
      });

      // Clone style tags
      const styleElements = parentHead.querySelectorAll('style');
      styleElements.forEach((el) => {
        const styleText = el.textContent || '';
        // Check if already in iframe head
        const alreadyExists = Array.from(iframeHead.querySelectorAll('style')).some(
          (s) => s.textContent === styleText
        );
        if (!alreadyExists && styleText.length > 0) {
          const clone = el.cloneNode(true);
          iframeHead.appendChild(clone);
        }
      });
    };

    syncStyles();

    // Observe changes to parent head (e.g. Vite HMR style updates or dynamic font injections)
    const observer = new MutationObserver(() => {
      syncStyles();
    });
    observer.observe(document.head, { childList: true, subtree: true });

    // Update background color
    doc.body.style.backgroundColor = backgroundColor;

    const root = doc.getElementById('mobile-preview-root');
    setMountNode(root);

    return () => {
      observer.disconnect();
    };
  }, [backgroundColor]);

  return (
    <iframe
      ref={iframeRef}
      title="Mobile Screen Preview"
      className={`w-full h-full border-0 select-none block ${className}`}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor,
        ...style,
      }}
    >
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
}
