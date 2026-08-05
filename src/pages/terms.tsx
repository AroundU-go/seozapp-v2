import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight } from 'lucide-react';

export default function TermsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const content = [
    {
      title: "1. Acceptance of Terms",
      text: "By accessing or using SEOzapp (\"the Service\"), you agree to be bound by these Terms of Service (\"Terms\"). Please read these Terms carefully before using the Service. If you do not agree to these Terms, you must not access or use the Service.",
      footer: "These Terms constitute a legally binding agreement between you (or the entity you represent) and SEOzapp (\"we,\" \"us,\" or \"our\"), the operator of seozapp.com."
    },
    {
      title: "2. Description of Service",
      text: "SEOzapp is a search engine optimization (SEO) platform that provides tools and analytics including, but not limited to, keyword research, site audits, backlink analysis, rank tracking, and SEO reporting. The specific features available to you depend on your subscription plan.",
      footer: "We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with reasonable notice where feasible."
    },
    {
      title: "3. Eligibility",
      text: "You must be at least 18 years of age (or the age of majority in your jurisdiction) to use the Service. By using SEOzapp, you represent and warrant that:",
      list: [
        "You are of legal age and have the legal capacity to enter into these Terms.",
        "You are not located in a country subject to applicable trade sanctions.",
        "You are not on any government-prohibited party list.",
        "If using on behalf of an organization, you have authority to bind that organization to these Terms."
      ]
    },
    {
      title: "4. Account Registration",
      text: "To access most features of SEOzapp, you must register an account. You agree to:",
      list: [
        "Provide accurate, complete, and current registration information.",
        "Maintain the security of your password and account credentials.",
        "Notify us immediately of any unauthorized access to your account.",
        "Accept responsibility for all activities occurring under your account.",
        "Not share your account credentials with third parties or allow others to access your account."
      ],
      footer: "We reserve the right to suspend or terminate accounts that contain false information or that violate these Terms."
    },
    {
      title: "5. Subscription & Payments",
      text: "Access to premium features of SEOzapp requires a paid subscription. By subscribing, you agree to the following:",
      list: [
        "Billing: Subscriptions are billed in advance on a monthly or annual basis, depending on your plan selection.",
        "Auto-Renewal: Subscriptions automatically renew at the end of each billing cycle unless you cancel before the renewal date.",
        "Payment Processing: Payments are processed by third-party payment processors (e.g., Stripe, Dodo Payments). You authorize us to charge your designated payment method for all applicable fees.",
        "Refunds: Payments are generally non-refundable, except as expressly stated in our Refund Policy or required by applicable law.",
        "Price Changes: We reserve the right to change subscription pricing with at least 30 days' advance notice."
      ]
    },
    {
      title: "6. Acceptable Use Policy",
      text: "You agree to use the Service only for lawful purposes. You must NOT:",
      list: [
        "Use the Service to scrape, harvest, or extract data from third-party websites without authorization.",
        "Attempt to gain unauthorized access to our systems, user accounts, or computer networks.",
        "Use the Service to send unsolicited commercial messages (spam).",
        "Interfere with or disrupt the integrity or performance of the Service.",
        "Reverse-engineer, decompile, or disassemble any portion of the Service.",
        "Use the Service to build a competing product or benchmark against competitors in ways that violate third-party terms.",
        "Exceed rate limits or misuse API access provided under your plan."
      ]
    },
    {
      title: "7. Intellectual Property Rights",
      text: "All intellectual property rights in the Service—including software, design, text, graphics, logos, and trademarks—are owned by or licensed to SEOzapp. Nothing in these Terms grants you any ownership rights in the Service.",
      footer: "You retain ownership of all data and content you upload to the Service (\"User Data\"). You grant us a limited, non-exclusive license to process User Data solely as necessary to provide the Service."
    },
    {
      title: "8. Third-Party Integrations & Links",
      text: "SEOzapp may integrate with or link to third-party services (e.g., Google Search Console, Google Analytics). Your use of such integrations is subject to the respective third-party's terms and privacy policies. We are not responsible for the availability, accuracy, or practices of third-party services."
    },
    {
      title: "9. Disclaimer of Warranties",
      text: "THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
      footer: "We do not warrant that the Service will be uninterrupted, error-free, completely secure, or that SEO results or ranking improvements are guaranteed."
    },
    {
      title: "10. Limitation of Liability",
      text: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SEOZAPP, ITS AFFILIATES, OFFICERS, DIRECTORS, OR EMPLOYEES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.",
      footer: "OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY YOU TO SEOZAPP IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM."
    },
    {
      title: "11. Indemnification",
      text: "You agree to indemnify, defend, and hold harmless SEOzapp and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or related to your use of the Service, your violation of these Terms, or your infringement of any third-party rights."
    },
    {
      title: "12. Termination",
      text: "We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, if you breach these Terms. Upon termination, your right to use the Service will immediately cease.",
      footer: "You may cancel your account at any time through your account settings or by contacting support."
    },
    {
      title: "13. Governing Law & Dispute Resolution",
      text: "These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which SEOzapp operates, without regard to its conflict of law principles. Any legal action or proceeding arising under these Terms shall be brought exclusively in the courts of competent jurisdiction in that region."
    },
    {
      title: "14. Changes to Terms",
      text: "We reserve the right to update or modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page with a revised \"Last Updated\" date. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms."
    },
    {
      title: "15. Contact Us",
      text: "If you have any questions, concerns, or inquiries regarding these Terms of Service, please contact us at:",
      footer: "SEOzapp Support Team\nEmail: go.aroundu@gmail.com\nTwitter/X: @ItsUddipan\nWebsite: https://seozapp.com"
    }
  ];

  return (
    <>
      <Head>
        <title>Terms of Service — SEOzapp</title>
        <meta name="description" content="Terms of Service for SEOzapp. Read our terms and conditions for using our services." />
      </Head>

      <div className="min-h-screen bg-[#ffffff] text-[#17191c] font-sohne selection:bg-[#fbe1d1] selection:text-[#5d2a1a] flex flex-col justify-between">
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff]/90 backdrop-blur-md border-b border-[#17191c]/10 py-4">
          <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
            <Link href="/" className="font-signifier text-2xl font-normal text-[#17191c] tracking-tight">
              SEOzapp
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-[#17191c] text-[#ffffff] rounded-full px-5 py-2 text-[14px] font-normal hover:bg-[#17191c]/90 transition-all flex items-center gap-1.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#fbe1d1]" />
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth')}
                  className="bg-[#17191c] text-[#ffffff] rounded-full px-5 py-2 text-[14px] font-normal hover:bg-[#17191c]/90 transition-all"
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Main Terms Body */}
        <main className="max-w-4xl mx-auto px-6 pt-36 pb-24 w-full">
          <div className="mb-12 text-center md:text-left space-y-2">
            <h1 className="font-signifier text-4xl md:text-5xl font-normal tracking-tight text-[#17191c]">
              Terms of Service
            </h1>
            <p className="text-sm text-[#777b86]">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric'})}
            </p>
          </div>

          <div className="space-y-8">
            {content.map((section, idx) => (
              <div key={idx} className="bg-[#fafafb] border border-[#17191c]/10 rounded-2xl p-6 md:p-8 space-y-3">
                <h2 className="text-xl font-semibold text-[#17191c]">{section.title}</h2>
                {section.text && <p className="text-[#777b86] text-sm leading-relaxed">{section.text}</p>}
                {section.list && (
                  <ul className="list-disc pl-5 space-y-1.5 text-[#777b86] text-sm leading-relaxed">
                    {section.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.footer && (
                  <p className="text-[#777b86] text-xs leading-relaxed whitespace-pre-line border-t border-[#17191c]/10 pt-3 mt-3">
                    {section.footer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* Standard v2 Footer */}
        <Footer />
      </div>
    </>
  );
}
