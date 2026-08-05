
export function ComparisonSection() {
    return (
        <section className="py-20 px-6 bg-card">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Same AI features. A fraction of the price.
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-stretch">
                    {/* Card 1: SEOzapp */}
                    <div className="bg-[#18181b] border border-[#27272a] rounded-[12px] p-10 text-center flex flex-col justify-center items-center text-white shadow-sm">
                        <div className="mb-3">
                            <span className="text-4xl md:text-5xl font-black text-[#0075de]">$29/mo</span>
                        </div>
                        <p className="text-base font-medium text-white/80 mb-2">AI Suite, Monthly</p>
                        <p className="text-xs font-bold text-[#0075de] uppercase tracking-widest">SEOzapp</p>
                    </div>

                    {/* Card 2: Competitors */}
                    <div className="bg-card border border-border rounded-[12px] p-10 text-center flex flex-col justify-center items-center opacity-60 transition-opacity duration-300">
                        <div className="mb-3">
                            <span className="text-4xl md:text-5xl font-black text-foreground/40">$2,500/mo</span>
                        </div>
                        <p className="text-base font-medium text-foreground/60 mb-2">Enterprise AI SEO tools</p>
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Competitors</p>
                    </div>

                    {/* Card 3: Savings */}
                    <div className="bg-[#fffdf0] dark:bg-[#1e1d13] border border-[#fef08a] dark:border-[#fef08a]/30 rounded-[12px] p-10 text-center flex flex-col justify-center items-center relative overflow-hidden shadow-sm">
                        <div className="relative z-10">
                            <div className="mb-3">
                                <span className="text-4xl md:text-5xl font-black text-[#854d0e] dark:text-[#fef08a]">Save 98%</span>
                            </div>
                            <p className="text-base font-medium text-foreground/70 mb-2">Compared to competitors</p>
                            <p className="text-xs font-bold text-[#854d0e] dark:text-[#fef08a] uppercase tracking-widest">Same AI features</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
