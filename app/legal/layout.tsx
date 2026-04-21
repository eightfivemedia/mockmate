import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to MockMate
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/legal/terms"
              target="_blank"
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/legal/privacy"
              target="_blank"
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 pb-24">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-10 md:px-14 md:py-14">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between text-sm text-gray-400">
          <span>&copy; {new Date().getFullYear()} MockMate. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/legal/terms" target="_blank" className="hover:text-gray-600 transition-colors">Terms</Link>
            <Link href="/legal/privacy" target="_blank" className="hover:text-gray-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
