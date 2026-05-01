import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";

const diseaseTabs = [
  {
    code: "hiv",
    title: "HIV Emotional Support",
  },
  {
    code: "malaria",
    title: "Malaria Recovery Support",
  },
  {
    code: "tb",
    title: "TB Adherence Support",
  },
  {
    code: "herpes",
    title: "Herpes Stigma Support",
  },
  {
    code: "hepatitis-b",
    title: "Hepatitis B Support",
  },
  {
    code: "hpv",
    title: "HPV Support",
  },
  {
    code: "diabetes",
    title: "Diabetes Stigma Support",
  },
  {
    code: "hypertension",
    title: "Hypertension Support",
  },
  {
    code: "epilepsy",
    title: "Epilepsy Support",
  },
];

const supportResources = [
  {
    id: "hiv-language",
    condition: "hiv",
    category: "Communication",
    title: "Use stigma-free language and challenge myths",
    summary:
      "HIV stigma is driven by negative attitudes and misinformation. Open, factual language can reduce shame and improve care-seeking.",
    actions: [
      "Avoid blaming language and moral judgments.",
      "Correct myths about transmission in calm, factual ways.",
      "Use person-first language (for example, 'person living with HIV').",
    ],
    sourceName: "CDC HIV Stigma",
    sourceUrl: "https://www.cdc.gov/stophivtogether/hiv-stigma/index.html",
  },
  {
    id: "hiv-care-rights",
    condition: "hiv",
    category: "Health Rights",
    title: "Seek stigma-free, rights-based healthcare",
    summary:
      "WHO emphasizes quality, stigma-free services so people can stay engaged in prevention and treatment without fear.",
    actions: [
      "Document discriminatory behavior if it occurs in care settings.",
      "Ask for confidential handling of HIV-related information.",
      "Request referral to facilities with trained, non-discriminatory staff.",
    ],
    sourceName: "WHO Technical Brief on HIV Stigma",
    sourceUrl:
      "https://www.who.int/news/item/22-07-2024-who-releases-technical-brief-on-reducing-hiv-related-stigma-and-discrimination-in-healthcare-settings",
  },
  {
    id: "tb-respect",
    condition: "tb",
    category: "Health Rights",
    title: "Protect dignity, confidentiality, and informed choice",
    summary:
      "WHO TB guidance highlights that people with TB should be treated with respect, confidentiality, and clear information.",
    actions: [
      "Ask providers to explain treatment in simple language.",
      "Request private counseling spaces where possible.",
      "Involve trusted family only with your consent.",
    ],
    sourceName: "WHO TB Knowledge Sharing",
    sourceUrl: "https://tbksp.who.int/en/node/2325",
  },
  {
    id: "tb-peer",
    condition: "tb",
    category: "Social Support",
    title: "Use peer/companionship support to reduce isolation",
    summary:
      "Peer support and trained companions can reduce psychological burden and help people cope with TB-related stigma.",
    actions: [
      "Join a TB support group or treatment buddy program.",
      "Connect with recovered TB champions where available.",
      "Use check-ins for motivation during long treatment phases.",
    ],
    sourceName: "WHO TB Companionship Support",
    sourceUrl: "https://tbksp.who.int/en/node/2319",
  },
  {
    id: "malaria-care",
    condition: "malaria",
    category: "Clinical Care",
    title: "Get tested early and use proven treatment",
    summary:
      "WHO guidance emphasizes rapid diagnosis and prompt treatment, especially in the first 24 hours for suspected severe illness.",
    actions: [
      "Get diagnostic testing quickly when fever starts.",
      "Use recommended antimalarial treatment from qualified providers.",
      "Avoid unproven herbal-only malaria treatments.",
    ],
    sourceName: "WHO Malaria Q&A",
    sourceUrl: "https://www.who.int/news-room/questions-and-answers/item/malaria",
  },
  {
    id: "malaria-prevention",
    condition: "malaria",
    category: "Prevention",
    title: "Reduce stigma through prevention literacy",
    summary:
      "Understanding prevention lowers fear and blame in communities affected by recurring malaria.",
    actions: [
      "Use insecticide-treated bed nets consistently.",
      "Follow local prevention guidance for households.",
      "Encourage community education instead of blame.",
    ],
    sourceName: "WHO Global Malaria Programme",
    sourceUrl: "https://www.who.int/teams/global-malaria-programme/case-management/treatment",
  },
  {
    id: "herpes-counseling",
    condition: "herpes",
    category: "Communication",
    title: "Use counseling to manage anxiety and relationship concerns",
    summary:
      "CDC STI guidance notes counseling is central to helping people cope and reduce transmission-related fear.",
    actions: [
      "Discuss recurrent symptoms and triggers with a clinician.",
      "Talk through disclosure plans in a safe, supported space.",
      "Use clear, non-shaming language with partners.",
    ],
    sourceName: "CDC Herpes Treatment Guidelines",
    sourceUrl: "https://www.cdc.gov/std/treatment-guidelines/herpes.htm",
  },
  {
    id: "herpes-manageable",
    condition: "herpes",
    category: "Clinical Care",
    title: "Reinforce that herpes is manageable",
    summary:
      "CDC notes genital herpes is common and manageable with treatment; suppressive therapy can reduce transmission risk.",
    actions: [
      "Review antiviral options with your provider.",
      "Avoid sex during outbreaks or prodromal symptoms.",
      "Use condoms correctly and consistently.",
    ],
    sourceName: "CDC About Genital Herpes",
    sourceUrl: "https://www.cdc.gov/herpes/about/index.html",
  },
  {
    id: "hep-b-testing",
    condition: "hepatitis-b",
    category: "Clinical Care",
    title: "Normalize hepatitis B testing, vaccination, and follow-up",
    summary:
      "Routine screening and vaccination reduce fear and misinformation, while linking people to treatment early.",
    actions: [
      "Encourage confidential testing in non-judgmental settings.",
      "Discuss vaccination for close contacts where appropriate.",
      "Use follow-up plans that reduce shame and improve continuity of care.",
    ],
    sourceName: "WHO Hepatitis B Fact Sheet",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/hepatitis-b",
  },
  {
    id: "hep-b-rights",
    condition: "hepatitis-b",
    category: "Health Rights",
    title: "Protect confidentiality and avoid status-based exclusion",
    summary:
      "People with chronic viral infections often face workplace and social exclusion; rights-based care reduces harm.",
    actions: [
      "Do not disclose diagnosis without consent.",
      "Challenge exclusionary language in family, school, or work settings.",
      "Use accurate education to reduce fear-driven stigma.",
    ],
    sourceName: "WHO Global Hepatitis Programme",
    sourceUrl: "https://www.who.int/teams/global-hiv-hepatitis-and-stis-programmes/hepatitis",
  },
  {
    id: "hpv-communication",
    condition: "hpv",
    category: "Communication",
    title: "Reframe HPV as common and manageable",
    summary:
      "HPV is very common; stigma is often reduced when people understand prevalence, prevention, and screening.",
    actions: [
      "Use factual, non-blaming sexual health language.",
      "Promote regular screening based on local guidance.",
      "Encourage vaccine discussions with providers and caregivers.",
    ],
    sourceName: "WHO HPV and Cervical Cancer",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/human-papillomavirus-(hpv)-and-cervical-cancer",
  },
  {
    id: "hpv-support",
    condition: "hpv",
    category: "Social Support",
    title: "Address relationship anxiety and self-blame",
    summary:
      "People diagnosed with HPV can experience shame and fear; counseling and partner communication improve coping.",
    actions: [
      "Use counseling to process fear and uncertainty.",
      "Plan partner conversations ahead with trusted scripts.",
      "Focus on prevention, treatment, and regular check-ins.",
    ],
    sourceName: "WHO Cervical Cancer Resources",
    sourceUrl: "https://www.who.int/health-topics/cervical-cancer",
  },
  {
    id: "diabetes-shame",
    condition: "diabetes",
    category: "Communication",
    title: "Challenge blame and lifestyle shaming",
    summary:
      "Diabetes stigma can reduce treatment adherence and mental wellbeing; supportive, non-judgmental communication helps.",
    actions: [
      "Avoid blaming people for glucose fluctuations.",
      "Use collaborative language around care plans.",
      "Prioritize psychological support when distress appears.",
    ],
    sourceName: "WHO Diabetes Fact Sheet",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes",
  },
  {
    id: "diabetes-selfcare",
    condition: "diabetes",
    category: "Clinical Care",
    title: "Promote practical self-management without stigma",
    summary:
      "Supportive routines and patient education improve outcomes better than shame-based messaging.",
    actions: [
      "Set realistic medication and monitoring routines.",
      "Use community or family support for adherence.",
      "Ask for mental health support when burnout increases.",
    ],
    sourceName: "WHO Global Diabetes Compact",
    sourceUrl: "https://www.who.int/initiatives/the-who-global-diabetes-compact",
  },
  {
    id: "hypertension-stigma",
    condition: "hypertension",
    category: "Prevention",
    title: "Treat hypertension as a long-term health condition, not personal failure",
    summary:
      "People may hide diagnosis due to stigma; routine screening and simple education reduce silence and late care.",
    actions: [
      "Encourage regular blood pressure checks.",
      "Use neutral language about medication use.",
      "Support gradual lifestyle changes without judgment.",
    ],
    sourceName: "WHO Hypertension Fact Sheet",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/hypertension",
  },
  {
    id: "hypertension-adherence",
    condition: "hypertension",
    category: "Clinical Care",
    title: "Support medication adherence with dignity",
    summary:
      "Consistent treatment lowers complications; stigma can interrupt adherence if people fear being judged.",
    actions: [
      "Use reminders and family support where helpful.",
      "Discuss side effects openly with providers.",
      "Normalize long-term treatment as common and responsible care.",
    ],
    sourceName: "WHO HEARTS Technical Package",
    sourceUrl: "https://www.who.int/teams/noncommunicable-diseases/cardiovascular-diseases/hearts-technical-package",
  },
  {
    id: "epilepsy-rights",
    condition: "epilepsy",
    category: "Health Rights",
    title: "Counter social exclusion and discrimination in epilepsy",
    summary:
      "Epilepsy is often misunderstood; rights-based education reduces exclusion at school, work, and in communities.",
    actions: [
      "Provide first-aid education to family and peers.",
      "Correct myths linking epilepsy to shame or danger.",
      "Support participation in school/work with reasonable adjustments.",
    ],
    sourceName: "WHO Epilepsy Fact Sheet",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/epilepsy",
  },
  {
    id: "epilepsy-support",
    condition: "epilepsy",
    category: "Social Support",
    title: "Build support networks to reduce isolation",
    summary:
      "Stigma can lead to isolation; trusted support circles improve confidence, adherence, and quality of life.",
    actions: [
      "Create a personal seizure support plan with trusted people.",
      "Use peer groups for shared coping strategies.",
      "Seek counseling for anxiety linked to public stigma.",
    ],
    sourceName: "WHO mhGAP Epilepsy Resources",
    sourceUrl: "https://www.who.int/teams/mental-health-and-substance-use/treatment-care/mental-health-gap-action-programme",
  },
];
 
const stigmaFacts = [
  {
    disease: "HIV/AIDS",
    fact: "Emotional support and social inclusion significantly improve health outcomes and quality of life for people living with HIV.",
    source: "WHO/CDC"
  },
  {
    disease: "Tuberculosis",
    fact: "Psychosocial support is critical for treatment adherence and helps patients overcome the isolation often linked to TB stigma.",
    source: "WHO"
  },
  {
    disease: "Hepatitis B",
    fact: "Open communication and emotional support can reduce the anxiety and social exclusion often experienced by those with chronic Hepatitis B.",
    source: "WHO"
  },
  {
    disease: "Herpes",
    fact: "Counseling and peer support are vital in managing the psychological distress and relationship anxiety associated with herpes stigma.",
    source: "CDC"
  },
  {
    disease: "HPV",
    fact: "Reducing self-blame through emotional support and education is key to improving mental wellness for people diagnosed with HPV.",
    source: "WHO"
  },
  {
    disease: "Diabetes",
    fact: "Compassionate emotional support helps people with diabetes manage 'diabetes distress' and improves their ability to stay engaged in self-care.",
    source: "WHO"
  },
  {
    disease: "Hypertension",
    fact: "Dignified support and non-judgmental environments encourage long-term treatment adherence and reduce the stress of living with hypertension.",
    source: "WHO"
  },
  {
    disease: "Epilepsy",
    fact: "Building strong emotional support networks is essential for countering the social isolation and discrimination often faced by people with epilepsy.",
    source: "WHO"
  }
];

const categoryFilters = ["All", "Communication", "Health Rights", "Social Support", "Prevention"];

function StigmaSupportPage({ session }) {
  const user = session?.user ?? null;
  const navigate = useNavigate();
  const [activeDisease, setActiveDisease] = useState(diseaseTabs[0].code);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % stigmaFacts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return <Navigate replace to="/login" />;

  const filteredResources = supportResources.filter((item) => {
    const diseaseMatch = item.condition === activeDisease;
    const categoryMatch = activeCategory === "All" || item.category === activeCategory;
    const content = `${item.title} ${item.summary} ${item.actions.join(" ")} ${item.category}`.toLowerCase();
    const queryMatch = query.trim() === "" || content.includes(query.toLowerCase().trim());
    return diseaseMatch && categoryMatch && queryMatch;
  });

  const selectedDisease = diseaseTabs.find((item) => item.code === activeDisease) ?? diseaseTabs[0];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h1 className="font-h2 text-h2 text-primary mb-4">❤️‍🩹 Stigma-Sensitive Health Support</h1>
          <p className="text-sm text-on-surface-variant mb-4">
            Evidence-informed support for people navigating stigma around HIV, malaria, TB, and herpes.
          </p>

          <div className="mb-4">
            <input
              className="w-full rounded-xl border border-slate-300"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="🔎 Search support guidance, coping tips, rights, or communication advice..."
              value={query}
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {diseaseTabs.map((item) => (
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer active:scale-95 ${
                  item.code === activeDisease
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-primary border-primary/30 hover:bg-primary/5"
                }`}
                key={item.code}
                onClick={() => setActiveDisease(item.code)}
                type="button"
              >
                {item.title.split(" ")[0]}
              </button>
            ))}
            <button
              className="px-4 py-2 rounded-full text-sm font-medium border bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer active:scale-95"
              onClick={() => {
                setActiveDisease(diseaseTabs[0].code);
                setActiveCategory("All");
                setQuery("");
              }}
              type="button"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categoryFilters.map((category) => (
              <button
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  activeCategory === category
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600"
                }`}
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Animated Slideshow of Facts */}
          <div className="relative h-[220px] md:h-[180px] mb-8 overflow-hidden rounded-[24px] border border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5">
            {stigmaFacts.map((slide, index) => (
              <div 
                key={index}
                className={`absolute inset-0 p-6 flex items-center justify-between transition-all duration-1000 transform ${
                  index === currentSlide 
                    ? "opacity-100 translate-x-0" 
                    : "opacity-0 translate-x-12 pointer-events-none"
                }`}
              >
                <div className="max-w-[70%]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      Did you know?
                    </span>
                    <span className="text-xs font-bold text-slate-500">{slide.disease}</span>
                  </div>
                  <p className="text-base md:text-lg font-medium text-primary leading-tight mb-2">
                    &ldquo;{slide.fact}&rdquo;
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">— Source: {slide.source}</p>
                </div>

                <button
                  className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 cursor-pointer hover:bg-primary/90 transition-all active:scale-95 whitespace-nowrap text-sm flex items-center gap-2"
                  onClick={() =>
                    navigate(
                      `/dashboard/ai-support-chat?prompt=${encodeURIComponent(
                        `I need support with ${slide.disease.toLowerCase()} and the stigma I am experiencing. I just read that "${slide.fact}"`
                      )}`
                    )
                  }
                  type="button"
                >
                  Chat About This
                  <span className="material-symbols-outlined text-sm">chat_bubble</span>
                </button>
              </div>
            ))}
            
            {/* Progress Dots */}
            <div className="absolute bottom-4 left-6 flex gap-1.5">
               {stigmaFacts.map((_, i) => (
                 <div 
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-4 bg-primary' : 'w-1 bg-primary/20'}`}
                 ></div>
               ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredResources.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 p-12 bg-slate-50 text-center">
                <p className="text-sm text-on-surface-variant italic">
                  No specific guidance found for your search. Try broader terms or check other categories. 🕊️
                </p>
              </div>
            ) : (
              filteredResources.map((resource) => (
                <article className="rounded-2xl border border-slate-200 p-4 bg-white" key={resource.id}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h4 className="font-semibold text-primary">{resource.title}</h4>
                    <span className="text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                      {resource.category}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-3">{resource.summary}</p>
                  <ul className="space-y-1 mb-3">
                    {resource.actions.map((action) => (
                      <li className="text-sm text-on-surface-variant" key={action}>
                        - {action}
                      </li>
                    ))}
                  </ul>
                  <a
                    className="text-sm font-medium text-primary underline"
                    href={resource.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Source: {resource.sourceName}
                  </a>
                </article>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StigmaSupportPage;
