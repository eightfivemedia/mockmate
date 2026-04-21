export const metadata = {
  title: 'Privacy Policy | MockMate',
  description: 'Privacy Policy for MockMate.',
};

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="pt-10 first:pt-0">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full tabular-nums">{number}</span>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-3 text-gray-600 leading-relaxed pl-9">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <article>
      {/* Title block */}
      <div className="mb-10 pb-10 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Legal
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm">Last updated: April 13, 2026</p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          This Privacy Policy explains how MockMate collects, uses, and shares information when
          you use our service. We keep this simple and honest.
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        <Section number="01" title="Information We Collect">
          <p className="font-medium text-slate-700">Information you provide</p>
          <ul className="space-y-2">
            {[
              'Email address and name (when you sign up)',
              'Resume text (if you upload or paste a resume)',
              'Job description text (if you paste a job description)',
              'Interview answers and messages during mock interviews',
              'Payment information (processed by Stripe — we never see your card number)',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="font-medium text-slate-700 pt-2">Collected automatically</p>
          <ul className="space-y-2">
            {[
              'Session metadata (role, experience level, duration, score)',
              'Usage analytics (sessions completed, questions answered)',
              'API cost data (used to enforce fair-use limits)',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section number="02" title="How We Use Your Information">
          <ul className="space-y-2">
            {[
              'To provide, operate, and improve MockMate',
              'To generate interview questions and feedback using AI',
              'To enforce session limits and billing',
              'To send transactional emails (account confirmation, student re-verification reminders)',
              'To detect and prevent abuse',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm">
            We do not sell your personal data. We do not use your data to train AI models.
          </div>
        </Section>

        <Section number="03" title="AI Processing">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm leading-relaxed">
            <strong className="font-semibold">Important:</strong> Your interview content is sent to
            third-party AI providers to generate responses. This includes your messages, answers,
            and any resume or job description text you provide.
          </div>
          <p>
            Currently we use OpenAI. Their privacy policy governs how they handle data sent to their
            API. OpenAI does not use API data to train their models by default.
          </p>
          <p>
            Do not include sensitive personal information (Social Security numbers, financial account
            numbers, passwords) in your interview content.
          </p>
        </Section>

        <Section number="04" title="Third-Party Services">
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Service</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Purpose</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Data shared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { service: 'Supabase', purpose: 'Database & authentication', data: 'All user data' },
                  { service: 'OpenAI', purpose: 'AI interview generation & scoring', data: 'Interview content, resume, job descriptions' },
                  { service: 'Stripe', purpose: 'Payment processing', data: 'Email, billing info' },
                  { service: 'Resend', purpose: 'Transactional email', data: 'Email address' },
                ].map((row) => (
                  <tr key={row.service} className="bg-white">
                    <td className="px-4 py-3 font-medium text-slate-700">{row.service}</td>
                    <td className="px-4 py-3 text-gray-600">{row.purpose}</td>
                    <td className="px-4 py-3 text-gray-500">{row.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section number="05" title="Student Data">
          <p>
            If you sign up with a <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">.edu</code> email
            address we store your verification timestamp and discount expiry date. This data is used
            only to validate your eligibility for student pricing and is deleted when you close your account.
          </p>
        </Section>

        <Section number="06" title="Data Retention">
          <p>
            We retain your account data for as long as your account is active. Interview session data
            is retained to power your history and analytics within the app. You may request deletion
            at any time.
          </p>
          <p>
            Resume and job description text is stored only for the duration of the interview session
            and associated history. We do not retain this text longer than necessary to provide the service.
          </p>
        </Section>

        <Section number="07" title="Your Rights">
          <ul className="space-y-2">
            {[
              'Access the personal data we hold about you',
              'Request correction of inaccurate data',
              'Request deletion of your account and associated data',
              'Export your data in a portable format',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p>
            To exercise any of these rights, email{' '}
            <a href="mailto:privacy@mockmate.app" className="text-blue-600 hover:underline font-medium">
              privacy@mockmate.app
            </a>
            . We will respond within 30 days.
          </p>
        </Section>

        <Section number="08" title="Cookies">
          <p>
            MockMate uses cookies only for authentication session management (via Supabase Auth).
            We do not use tracking or advertising cookies.
          </p>
        </Section>

        <Section number="09" title="Children's Privacy">
          <p>
            MockMate is not directed at children under 13. We do not knowingly collect personal
            information from children under 13. If you believe a child has provided us their data,
            contact us and we will delete it promptly.
          </p>
        </Section>

        <Section number="10" title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material
            changes via email or an in-app notice. The &quot;last updated&quot; date reflects the most
            recent revision.
          </p>
        </Section>

        <Section number="11" title="Contact">
          <p>
            Privacy questions:{' '}
            <a href="mailto:privacy@mockmate.app" className="text-blue-600 hover:underline font-medium">
              privacy@mockmate.app
            </a>
          </p>
          <p>
            General:{' '}
            <a href="mailto:hello@mockmate.app" className="text-blue-600 hover:underline font-medium">
              hello@mockmate.app
            </a>
          </p>
        </Section>
      </div>
    </article>
  );
}
