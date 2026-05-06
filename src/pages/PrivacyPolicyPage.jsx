import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

const sections = [
  {
    title: "General Service Disclaimer",
    body: "GraceAI provides AI-assisted emotional support and general wellness guidance. It is not a substitute for professional medical, psychological, or psychiatric care. The information and support provided through GraceAI should not be considered medical advice, diagnosis, or treatment. Users are encouraged to seek qualified healthcare professionals for any medical or mental health concerns.",
  },
  {
    title: "Special Personal Information Authorization",
    body: "In accordance with Section 32 of POPIA, GraceAI processes health information solely for the purpose of providing mental health support and treatment. By using this service, you provide explicit consent for the processing of this special personal information, which we treat with the highest level of professional confidentiality and protect through advanced encryption standards.",
  },
  {
    title: "Not Emergency Support Disclaimer",
    body: "GraceAI is not an emergency service. If you are experiencing a mental health crisis, are in danger, or are considering harming yourself or others, please seek immediate help from a qualified professional, local emergency services, or a crisis helpline.",
  },
  {
    title: "User Responsibility Disclaimer",
    body: "GraceAI is here to support, not replace human care. We encourage you to reach out to qualified professionals, trusted individuals, or local support services whenever you need deeper care or urgent help. You are not alone, and support is always available.",
  },
  {
    title: "Privacy & Data Awareness",
    body: "GraceAI respects your privacy and aims to handle all user interactions with care and confidentiality. However, users are advised not to share highly sensitive personal, medical, or financial information through the platform.",
  },
  {
    title: "Limitation of Liability",
    body: "GraceAI and its creators shall not be held liable for any direct, indirect, or consequential outcomes resulting from the use of the service. Use of the platform is entirely at the user’s own risk.",
  },
];

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h1 className="font-h2 text-h2 text-primary mb-3">Disclaimers</h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Please read these disclaimers carefully before using GraceAI.
          </p>
          <div className="space-y-5">
            {sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                <h2 className="text-lg font-semibold text-primary mb-2">{section.title}</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default PrivacyPolicyPage;
