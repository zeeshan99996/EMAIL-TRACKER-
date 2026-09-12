import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mizu — Automate Anything. Effortlessly.',
  description: 'Mizu is the AI that turns your ideas into automations, without a single line of code.',
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
