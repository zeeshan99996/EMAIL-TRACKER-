import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mailify — Send, Verify, Warmup, Track',
  description: 'One powerful platform to send emails, track engagement, verify addresses, and warm up your inbox.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-sky-100 selection:text-sky-900">{children}</body>
    </html>
  );
}
