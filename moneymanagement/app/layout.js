import { Inter, Noto_Serif } from 'next/font/google';
import './globals.css';
import { TransactionProvider } from './context/TransactionContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-noto-serif',
  display: 'swap',
});

export const metadata = {
  title: 'FinTraces - Dashboard Keuangan',
  description: 'Every chat. Every transaction. One clear picture.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${notoSerif.variable}`}>
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
      </head>
      <body className="font-sans bg-gray-50 text-gray-900 antialiased">
        <TransactionProvider>
          {children}
        </TransactionProvider>
      </body>
    </html>
  );
}