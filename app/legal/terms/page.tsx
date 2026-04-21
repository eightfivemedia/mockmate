export const metadata = {
  title: 'Terms of Service | MockMate',
  description: 'Terms of Service for MockMate.',
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

export default function TermsPage() {
  return (
    <article>
      {/* Title block */}
      <div className="mb-10 pb-10 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Legal
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm">Last updated: April 13, 2026</p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Please read these Terms carefully before using MockMate. By accessing or using MockMate
          you agree to be bound by these Terms. If you do not agree, do not use the service.
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        <Section number="01" title="Description of Service">
          <p>
            MockMate is an AI-powered interview practice platform. It generates interview questions,
            conducts simulated interviews, and provides feedback using large language models. MockMate
            is intended for practice and self-improvement purposes only.
          </p>
        </Section>

        <Section number="02" title="AI Disclaimer">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm leading-relaxed">
            <strong className="font-semibold">Important:</strong> MockMate uses artificial intelligence
            to generate questions, evaluate answers, and provide feedback. AI-generated content may be
            inaccurate, incomplete, or inconsistent. Scores and feedback are not a guarantee of
            performance in real interviews and do not constitute professional career, legal, or
            employment advice.
          </div>
          <p>
            Your interview content (messages, answers, resume text, and job descriptions) is processed
            by third-party AI providers. See our Privacy Policy for details.
          </p>
        </Section>

        <Section number="03" title="Accounts and Eligibility">
          <p>
            You must be at least 13 years old to use MockMate. By creating an account you represent
            that all information you provide is accurate. You are responsible for maintaining the
            security of your account credentials.
          </p>
        </Section>

        <Section number="04" title="Student Discount">
          <p>
            The student pricing tier is available to users with a valid <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">.edu</code> email
            address currently enrolled at an accredited institution. By signing up with a <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">.edu</code> email
            you confirm your eligibility. MockMate reserves the right to verify enrollment status and
            revoke the student discount if eligibility cannot be confirmed. Student discounts must be
            re-verified annually.
          </p>
        </Section>

        <Section number="05" title="Subscriptions and Billing">
          <p>
            Paid subscriptions are billed in advance on a monthly or annual basis. Prices are displayed
            at checkout and may change with 30 days&apos; notice. You may cancel at any time; access
            continues until the end of the current billing period. We do not offer refunds for partial
            billing periods unless required by applicable law.
          </p>
          <p>Free tier users are subject to session limits displayed in the pricing section.</p>
        </Section>

        <Section number="06" title="Acceptable Use">
          <p>You agree not to:</p>
          <ul className="space-y-2">
            {[
              'Use MockMate to generate harmful, illegal, or deceptive content',
              'Attempt to reverse engineer, scrape, or abuse the API',
              'Share your account credentials with others',
              'Use the service in any way that violates applicable laws',
              'Misrepresent your student status to obtain discounted pricing',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </Section>

        <Section number="07" title="Intellectual Property">
          <p>
            MockMate and its content are owned by us and protected by intellectual property laws.
            You retain ownership of content you submit (resume text, answers). By submitting content
            you grant us a limited license to process it for the purpose of providing the service.
          </p>
        </Section>

        <Section number="08" title="Limitation of Liability">
          <p>
            To the fullest extent permitted by law, MockMate is provided &quot;as is&quot; without warranties
            of any kind. We are not liable for any indirect, incidental, or consequential damages
            arising from your use of the service, including reliance on AI-generated feedback.
            Our total liability to you shall not exceed the amount you paid us in the 12 months
            preceding the claim.
          </p>
        </Section>

        <Section number="09" title="Changes to Terms">
          <p>
            We may update these Terms from time to time. We will notify you of material changes via
            email or a notice in the app. Continued use of MockMate after changes take effect
            constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section number="10" title="Contact">
          <p>
            Questions about these Terms? Email us at{' '}
            <a href="mailto:hello@mockmate.app" className="text-blue-600 hover:underline font-medium">
              hello@mockmate.app
            </a>.
          </p>
        </Section>
      </div>
    </article>
  );
}
