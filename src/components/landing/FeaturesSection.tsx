import { useEffect, useRef } from "react";
import {
    IconTerminal2,
    IconBrain,
    IconLink,
    IconSearch,
    IconFlame,
    IconRobot,
    IconShieldCheck,
    IconHistory,
    IconWorld,
} from "@tabler/icons-react";

interface FeatureData {
    title: string;
    icon: React.ReactNode;
    whatItDoes: string;
    bullets: string[];
    whyItMatters: string;
    matterBullets: string[];
    accentClass: string;
}

const features: FeatureData[] = [
    {
        title: "Deep On-Page SEO Analysis",
        icon: <IconTerminal2 className="w-7 h-7" />,
        accentClass: "card-accent-marigold",
        whatItDoes: "SEOzapp runs a full on-page audit across 25+ ranking factors:",
        bullets: [
            "Meta titles & descriptions",
            "Heading structure (H1–H6)",
            "Internal & external links",
            "Image optimization (alt text, size)",
            "Content structure & readability",
            "Schema markup & more",
        ],
        whyItMatters: "Most sites don't lose rankings to strategy — they lose them to basics nobody checked:",
        matterBullets: [
            "Missing meta tags",
            "Duplicate headings",
            "Poor structure",
            "Broken linking",
        ],
    },
    {
        title: "AI Engine Optimization (AEO)",
        icon: <IconBrain className="w-7 h-7" />,
        accentClass: "card-accent-midnight-ink",
        whatItDoes: "SEOzapp scores how your content actually performs inside AI search — ChatGPT, Perplexity, Gemini, and AI-powered search layers:",
        bullets: [
            "AI visibility score",
            "AI bot crawl check",
            "AI-readiness insights",
            "Fixes to improve AI discoverability",
        ],
        whyItMatters: "Search isn't just Google anymore. Your content needs to survive:",
        matterBullets: [
            "AI-generated answers",
            "LLM summaries",
            "Conversational search",
            "The layer most SEO tools still ignore",
        ],
    },
    {
        title: "Top Search Keywords Insights",
        icon: <IconSearch className="w-7 h-7" />,
        accentClass: "card-accent-sky-wash",
        whatItDoes: "SEOzapp shows you:",
        bullets: [
            "Keywords you already rank for",
            "Search volume by keyword",
            "Your current keyword positioning",
        ],
        whyItMatters: "Keywords alone aren't the win — clarity is:",
        matterBullets: [
            "Know what's already working",
            "See where you're close",
            "Double down instead of guessing",
            "Improve existing pages faster than starting over",
        ],
    },
    {
        title: "Speed & Performance Optimization",
        icon: <IconFlame className="w-7 h-7" />,
        accentClass: "card-accent-sky-tint",
        whatItDoes: "A full performance breakdown:",
        bullets: [
            "Page load time",
            "TTFB (time to first byte)",
            "Page size & request breakdown",
            "Actionable fixes, ranked by impact",
        ],
        whyItMatters: "Speed is a ranking factor and a revenue factor:",
        matterBullets: [
            "Direct SEO impact",
            "Direct UX impact",
            "Direct conversion impact",
            "Most sites bleed traffic here without knowing it",
        ],
    },
    {
        title: "Bot Access & Crawlability Checks",
        icon: <IconRobot className="w-7 h-7" />,
        accentClass: "card-accent-marigold",
        whatItDoes: "SEOzapp checks whether bots — human search and AI crawlers alike — can actually reach your page:",
        bullets: [
            "Access verification",
            "Crawl issue detection",
            "Indexing blocker checks",
        ],
        whyItMatters: "If a bot can't reach your page, nothing else on this list matters:",
        matterBullets: [
            "Confirms search-engine friendliness",
            "Surfaces technical access barriers before they cost you rankings",
        ],
    },
    {
        title: "Security & Technical Health",
        icon: <IconShieldCheck className="w-7 h-7" />,
        accentClass: "card-accent-midnight-ink",
        whatItDoes: "A scan across your technical foundation:",
        bullets: [
            "Security vulnerabilities",
            "HTTPS/SSL issues",
            "Technical SEO gaps",
        ],
        whyItMatters: "Security is a ranking signal too:",
        matterBullets: [
            "Insecure sites lose trust — and rankings",
            "Technical errors quietly hurt indexing",
        ],
    },
    {
        title: "History Tracking",
        icon: <IconHistory className="w-7 h-7" />,
        accentClass: "card-accent-coral",
        whatItDoes: "SEOzapp lets you:",
        bullets: [
            "Track every past audit",
            "Monitor improvement over time",
        ],
        whyItMatters: "SEO isn't a one-time fix:",
        matterBullets: [
            "See real before/after progress",
            "Prove the work is working",
        ],
    },
    {
        title: "Bulk URL Analysis",
        icon: <IconWorld className="w-7 h-7" />,
        accentClass: "card-accent-sky-wash",
        whatItDoes: "SEOzapp lets you:",
        bullets: [
            "Analyze multiple URLs in one pass",
            "Scale audits across an entire site",
        ],
        whyItMatters: "Stop auditing page-by-page:",
        matterBullets: [
            "Cover your whole site in one go",
            "Audit every client page without the busywork",
        ],
    },
];

function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("feature-visible");
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return ref;
}

function FeatureCard({ feature, index }: { feature: FeatureData; index: number }) {
    const ref = useScrollReveal();
    const isEven = index % 2 === 0;

    return (
        <div
            ref={ref}
            className="feature-card-wrapper"
            style={{ transitionDelay: `${(index % 3) * 100}ms` }}
        >
            <div className={`feature-card ${feature.accentClass} ${isEven ? "feature-card--left" : "feature-card--right"}`}>
                {/* Number badge */}
                <div className="feature-number">
                    {String(index + 1).padStart(2, "0")}
                </div>

                {/* Header */}
                <div className="feature-header">
                    <div className="feature-icon-wrap">
                        {feature.icon}
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                </div>

                {/* Content columns */}
                <div className="feature-columns">
                    {/* What it does */}
                    <div className="feature-col">
                        <div className="feature-col-label">
                            <span className="feature-col-dot feature-col-dot--does" />
                            What it does
                        </div>
                        <p className="feature-col-desc">{feature.whatItDoes}</p>
                        <ul className="feature-bullet-list">
                            {feature.bullets.map((b) => (
                                <li key={b} className="feature-bullet">
                                    <span className="feature-bullet-icon">›</span>
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Divider */}
                    <div className="feature-divider" />

                    {/* Why it matters */}
                    <div className="feature-col">
                        <div className="feature-col-label">
                            <span className="feature-col-dot feature-col-dot--matters" />
                            Why it matters
                        </div>
                        <p className="feature-col-desc">{feature.whyItMatters}</p>
                        <ul className="feature-bullet-list">
                            {feature.matterBullets.map((b) => (
                                <li key={b} className="feature-bullet feature-bullet--matters">
                                    <span className="feature-bullet-check">✓</span>
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FeaturesSection() {
    return (
        <div className="features-container">
            {features.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
        </div>
    );
}
