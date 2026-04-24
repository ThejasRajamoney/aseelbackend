import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aseel | AI Academic Integrity Coach',
  description:
    'Aseel helps UAE students develop genuine academic integrity through Socratic questioning. Built for Safe AI Cup 2026.',
  keywords: ['academic integrity', 'UAE education', 'AI tools', 'student learning', 'Safe AI Cup'],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body overflow-x-hidden text-[color:var(--text-primary)] antialiased">{children}</body>
    </html>
  );
}
