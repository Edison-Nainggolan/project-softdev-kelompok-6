import './globals.css';
import { TransactionProvider } from './context/TransactionContext';

export const metadata = {
  title: 'Dashboard Keuangan',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <TransactionProvider>
          {children}
        </TransactionProvider>
      </body>
    </html>
  );
}