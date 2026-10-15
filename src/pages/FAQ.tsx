import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';

interface FAQItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
}

export function FAQ() {
  const contactEmail = 'chaudharyjaypal227@gmail.com';
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true, // Keep first open by default
  });

  const toggle = (id: string) => {
    setOpenIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'How do I purchase a course?',
      answer: 'Open the course, review the details and price, and complete the available payment process.'
    },
    {
      id: 'faq-2',
      question: 'How do I access my purchased course?',
      answer: 'After successful purchase, access the course through your account/course access area.'
    },
    {
      id: 'faq-3',
      question: 'Are videos available online?',
      answer: 'Yes, courses can contain online video content.'
    },
    {
      id: 'faq-4',
      question: 'Are PDFs available?',
      answer: 'Depending on the course, PDF resources may also be included.'
    },
    {
      id: 'faq-5',
      question: 'Can I access a course after purchasing it?',
      answer: 'Purchased course access is provided according to the course\'s access terms.'
    },
    {
      id: 'faq-6',
      question: 'What if my course content is not showing?',
      answer: (
        <span>
          First refresh/reopen the course. If the problem continues, reach out to our team using the{' '}
          <a href={`mailto:${contactEmail}`} className="text-indigo-400 hover:underline font-medium">
            Contact Support
          </a> link.
        </span>
      )
    },
    {
      id: 'faq-7',
      question: 'Do you provide refunds?',
      answer: 'Refund requests are reviewed on a case-by-case basis. A refund may be considered for a genuine and reasonable issue, including an accidental purchase where the customer intended to purchase a different course, subject to review. Refunds are not automatic or guaranteed for every request.'
    },
    {
      id: 'faq-8',
      question: 'How can I contact support?',
      answer: (
        <span>
          You can reach our team anytime by clicking the{' '}
          <a href={`mailto:${contactEmail}`} className="text-indigo-400 hover:underline font-medium">
            Contact Support
          </a> button.
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-slate-400 hover:text-indigo-400 transition-colors gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <HelpCircle className="w-3.5 h-3.5" /> Answers & Assistance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Quick answers to common questions about courses, access, formats, and support.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = Boolean(openIds[faq.id]);
            return (
              <Card 
                key={faq.id} 
                className={`transition-all duration-200 border ${
                  isOpen ? 'border-indigo-500/40 bg-slate-900/90 shadow-md' : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-base sm:text-lg text-white">
                    {faq.question}
                  </span>
                  <div className="p-1.5 rounded-md bg-slate-800 text-slate-300 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <CardContent className="px-5 pb-5 pt-0 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-slate-800/60 mt-2">
                    <div className="pt-3">
                      {faq.answer}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <h3 className="text-lg font-bold text-white">Still have questions?</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            If you need further help or have questions about a course, feel free to contact us directly.
          </p>
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" /> Contact Support
          </a>
        </div>

      </div>
    </div>
  );
}
