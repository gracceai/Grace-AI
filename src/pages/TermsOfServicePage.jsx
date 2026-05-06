import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

const terms = [
  { title: "About GraceAI", body: "GraceAI is an AI-assisted platform offering emotional support and wellness guidance." },
  { title: "Acceptance of Terms", body: "By using GraceAI, you agree to these terms." },
  { title: "Nature of Service", body: "GraceAI does not provide medical advice, diagnosis, or treatment." },
  { title: "No Emergency Services", body: "GraceAI does not provide crisis intervention." },
  {
    title: "Privacy Policy & Cookies",
    body: "We will not sell, share, or rent your Personal Information to any third party or use your email address for unsolicited mail. Any emails sent by us will only be in connection with the provision of our services and/or the marketing thereof. We use cookies on our website to give you the most relevant experience by remembering your preferences and repeat visits. By clicking \"I AGREE\", you consent to the use of ALL the cookies.",
  },
  { title: "Intellectual Property", body: "All content belongs to GraceAI." },
  { title: "Limitation of Liability", body: "Use of the platform is at your own risk." },
  { title: "Changes to Terms", body: "We may update these terms at any time." },
  { title: "Governing Law", body: "These terms are governed by the laws of Namibia." },
];

function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h1 className="font-h2 text-h2 text-primary mb-3">Terms and Conditions</h1>
          <p className="text-sm text-on-surface-variant mb-6">
            These terms govern your use of the GraceAI platform.
          </p>
          <div className="space-y-5">
            {terms.map((term) => (
              <article key={term.title} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                <h2 className="text-lg font-semibold text-primary mb-2">{term.title}</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">{term.body}</p>
              </article>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default TermsOfServicePage;
