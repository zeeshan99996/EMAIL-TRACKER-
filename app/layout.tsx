import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Tracker & Analytics Platform',
  description: 'Track email sending, opens, link clicks, timestamps, and analytics with Google Apps Script.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
