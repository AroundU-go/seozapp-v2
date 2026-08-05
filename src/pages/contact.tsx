import { useRouter } from 'next/router';
import { ArrowLeft, MessageSquare, Calendar } from 'lucide-react';

export default function ContactPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#f8f9fe]">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-40">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-gray-500 hover:text-accent transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                </button>
                <a href="/" className="font-black text-xl tracking-tight text-gray-900">
                    SEO<span className="text-accent">zapp</span>
                </a>
                <div className="w-8" />
            </div>

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
                        <MessageSquare className="w-8 h-8 text-accent" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Contact &amp; Book a Demo</h1>
                    <p className="text-gray-500 text-lg">Have questions or want a 1-on-1 walk-through? Schedule a call or drop us a line.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Book a Demo Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center flex flex-col justify-between">
                        <div>
                            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-7 h-7 text-accent" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Book a Live Demo</h2>
                            <p className="text-gray-500 mb-6 text-sm">Schedule a live demo to explore custom enterprise features &amp; LLM monitoring.</p>
                        </div>
                        <a
                            href="https://cal.com/uddipan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#17191c] text-white font-bold rounded-xl shadow-md hover:bg-[#17191c]/90 transition-all duration-300"
                        >
                            <Calendar className="w-5 h-5 text-[#fbe1d1]" />
                            Book Demo on Cal.com
                        </a>
                    </div>

                    {/* Contact Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center flex flex-col justify-between">
                        <div>
                            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-7 h-7 text-accent" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Message Us</h2>
                            <p className="text-gray-500 mb-6 text-sm">Drop us a line directly on X / Twitter and we'll reply right away.</p>
                        </div>
                        <a
                            href="https://x.com/ItsUddipan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Contact on X
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
