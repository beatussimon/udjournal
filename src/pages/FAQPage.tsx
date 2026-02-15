import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: "What is UDSM Journals?",
    answer: "UDSM Journals is the University of Dar es Salaam's premier open access platform for scholarly research, journals, and academic publications. It provides access to peer-reviewed academic journals across various disciplines."
  },
  {
    question: "How do I submit my research?",
    answer: "To submit your research, click on the 'Submit Research' button on our homepage. You'll be guided through the submission process which includes manuscript preparation, author information, and journal selection."
  },
  {
    question: "Is there a cost to publish or access content?",
    answer: "No, UDSM Journals follows an open access model. All content is freely available to readers worldwide, and there are no submission fees for authors (subject to journal-specific policies)."
  },
  {
    question: "How do I search for specific articles?",
    answer: "Use our search feature by clicking on 'Search Repository' or navigating to the search page. You can search by article title, author name, journal name, or keywords."
  },
  {
    question: "How can I track the impact of my article?",
    answer: "Each article page displays metrics including views, downloads, and citations. You can also find links to Google Scholar for citation tracking."
  },
  {
    question: "What journals are available on the platform?",
    answer: "UDSM Journals hosts multiple academic journals covering various disciplines including science, technology, humanities, and social sciences. Browse our journal collection on the Journals page."
  },
  {
    question: "How do I become a reviewer?",
    answer: "If you're interested in becoming a reviewer, please contact the specific journal's editorial office. Reviewers are typically academics with expertise in the relevant field."
  },
  {
    question: "Can I download articles for offline reading?",
    answer: "Yes, most articles offer PDF download options. Look for the 'Download PDF' button on the article page."
  }
]

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-udsm-dark mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 mb-8">
          Find answers to common questions about UDSM Journals platform.
        </p>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="font-medium text-udsm-dark dark:text-white">
                  {item.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 dark:text-slate-300">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-50 dark:bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-serif font-bold text-udsm-dark dark:text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 dark:text-slate-300 mb-4">
            If you can't find the answer you're looking for, please contact our support team.
          </p>
          <a
            href="mailto:journals@udsm.ac.tz"
            className="inline-block bg-udsm-primary text-white px-6 py-2 rounded-lg hover:bg-udsm-secondary transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}

export default FAQPage
