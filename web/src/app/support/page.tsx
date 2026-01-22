import Link from 'next/link';

export const metadata = {
  title: 'Support | AquaXone',
  description: 'Get help with AquaXone - Contact support, FAQs, and troubleshooting guides.',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      {/* Header */}
      <header className="border-b border-cyan-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🐠</span>
            <span className="font-bold text-xl text-cyan-700">AquaXone</span>
          </Link>
          <Link 
            href="/login" 
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Support</h1>
        <p className="text-xl text-slate-600 mb-12">
          We're here to help you get the most out of AquaXone.
        </p>

        {/* Contact Section */}
        <section className="bg-white rounded-2xl border border-cyan-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Contact Us</h2>
          <p className="text-slate-600 mb-6">
            Have a question, feedback, or need help? Reach out and we'll get back to you as soon as possible.
          </p>
          <a 
            href="mailto:support@aquaxone.app"
            className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            support@aquaxone.app
          </a>
        </section>

        {/* FAQ Section */}
        <section className="bg-white rounded-2xl border border-cyan-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">How do I add a new tank?</h3>
              <p className="text-slate-600">
                Go to the Dashboard and tap the tank selector at the top. Then tap "Add New Tank" to create a new aquarium profile.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">How do I log water parameters?</h3>
              <p className="text-slate-600">
                Navigate to the "Log" tab and enter your water test results. Tap "Save" to record them. You can view your history in the "History" tab.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Can I switch between reef and freshwater modes?</h3>
              <p className="text-slate-600">
                Yes! Each tank has its own type (reef or freshwater). When you select a tank, the app automatically shows the relevant parameters for that tank type.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">How do I cancel my subscription?</h3>
              <p className="text-slate-600">
                <strong>iOS:</strong> Go to Settings → Your Name → Subscriptions → AquaXone → Cancel<br />
                <strong>Web:</strong> Go to Settings → Subscription → Manage Subscription
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">How do I restore my purchases on a new device?</h3>
              <p className="text-slate-600">
                On iOS, go to the Subscription screen and tap "Restore Purchases". Make sure you're signed in with the same Apple ID used for the original purchase.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Is my data synced across devices?</h3>
              <p className="text-slate-600">
                Yes! Your data is securely stored in the cloud and syncs automatically when you sign in on any device with the same account.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Can I export my data?</h3>
              <p className="text-slate-600">
                Premium subscribers can export their parameter history as CSV files. Go to History → Export to download your data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">What's the difference between subscription tiers?</h3>
              <p className="text-slate-600">
                <strong>Free:</strong> 1 tank, parameter logging, history charts, maintenance tracking<br />
                <strong>Premium:</strong> 3 tanks, photo gallery, data export, custom thresholds, no ads<br />
                <strong>Super Premium:</strong> 10 tanks, equipment tracking, livestock management, priority support
              </p>
            </div>
          </div>
        </section>

        {/* Troubleshooting Section */}
        <section className="bg-white rounded-2xl border border-cyan-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Troubleshooting</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">App won't load or crashes</h3>
              <p className="text-slate-600">
                Try force-closing the app and reopening it. If the issue persists, try uninstalling and reinstalling. Your data is safely stored in the cloud.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Data not syncing</h3>
              <p className="text-slate-600">
                Check your internet connection. Pull down on most screens to refresh. If issues continue, try signing out and back in.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Subscription not showing as active</h3>
              <p className="text-slate-600">
                Tap "Restore Purchases" on the subscription screen. Make sure you're signed in with the account that made the purchase.
              </p>
            </div>
          </div>
        </section>

        {/* Links Section */}
        <section className="bg-slate-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Legal</h2>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-cyan-600 hover:text-cyan-700 font-medium">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-cyan-600 hover:text-cyan-700 font-medium">
              Terms of Service
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-100 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500">
          <p>© {new Date().getFullYear()} AquaXone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
