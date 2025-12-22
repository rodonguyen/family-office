import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plaid Dashboard",
  description: "Personal finance dashboard powered by Plaid",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="flex items-center">
                  <span className="text-xl font-bold text-gray-900">
                    💰 Plaid Dashboard
                  </span>
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </a>
                <a
                  href="/accounts"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Accounts
                </a>
                <a
                  href="/transactions"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Transactions
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
