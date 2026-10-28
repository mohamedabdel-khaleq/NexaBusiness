
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LifeBuoy,
  Search,
  BookOpen,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  Truck,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Lightbulb,
  ShieldCheck,
  AlertTriangle,
  MessageCircle,
  Mail,
  ArrowRight,
  RotateCcw,
  FileText,
} from "lucide-react";

const helpTopics = [
  {
    title: "Dashboard",
    description: "Understand your business overview and statistics.",
    icon: BarChart3,
    link: "/dashboard",
    color: "blue",
  },
  {
    title: "Sales",
    description: "Manage sales transactions and review sales records.",
    icon: ShoppingCart,
    link: "/sales",
    color: "emerald",
  },
  {
    title: "Products & Categories",
    description: "Organize products and their categories.",
    icon: Package,
    link: "/products",
    color: "violet",
  },
  {
    title: "Inventory",
    description: "Review stock quantities and inventory information.",
    icon: FileText,
    link: "/inventory",
    color: "amber",
  },
  {
    title: "Customers & Employees",
    description: "Find and manage customer and employee records.",
    icon: Users,
    link: "/customers",
    color: "pink",
  },
  {
    title: "Payments",
    description: "Review payment records and transaction information.",
    icon: CreditCard,
    link: "/payments",
    color: "cyan",
  },
  {
    title: "Delivery",
    description: "Manage delivery orders and delivery drivers.",
    icon: Truck,
    link: "/delivery-orders",
    color: "orange",
  },
  {
    title: "Reports",
    description: "Review available business reports.",
    icon: BarChart3,
    link: "/reports",
    color: "indigo",
  },
  {
    title: "Account Settings",
    description: "Review your profile and account security settings.",
    icon: Settings,
    link: "/settings",
    color: "slate",
  },
];

const faqs = [
  {
    category: "Getting Started",
    question: "How do I navigate NexaBusiness?",
    answer:
      "Use the sidebar to open the Dashboard, Sales, Products, Categories, Inventory, Customers, Employees, Payments, Delivery, Reports, Users, and Settings pages. Select the section you want to work with.",
  },
  {
    category: "Getting Started",
    question: "What can I find on the Dashboard?",
    answer:
      "The Dashboard provides an overview of the business information available to your account. The figures and summaries shown depend on the data returned by the system.",
  },
  {
    category: "Products & Inventory",
    question: "How can I find a product quickly?",
    answer:
      "Open the Products page and use its available search or filtering controls. You can also use the global search in the top navigation bar if product search is available for your account.",
  },
  {
    category: "Products & Inventory",
    question: "What should I do if stock information looks incorrect?",
    answer:
      "Open Inventory and review the relevant product and its recorded quantity. If the information still looks incorrect, contact your system administrator to check the underlying records and permissions.",
  },
  {
    category: "Sales & Payments",
    question: "Where can I review sales?",
    answer:
      "Open the Sales page to review the sales records available to your account. Use the page's existing filters or search controls, if available, to locate a particular transaction.",
  },
  {
    category: "Sales & Payments",
    question: "Where can I review payments?",
    answer:
      "Open Payments from the sidebar. The records and actions available depend on your account permissions and the information provided by the system.",
  },
  {
    category: "Delivery",
    question: "Where can I manage delivery orders?",
    answer:
      "Open Delivery Orders to review delivery records. The Delivery Drivers page is available separately for reviewing driver information.",
  },
  {
    category: "Account & Security",
    question: "How do I update my profile or password?",
    answer:
      "Open Settings and review the Profile and Security sections. Use the available form controls to make changes supported by your account.",
  },
  {
    category: "Account & Security",
    question: "Why can't I access a page or perform an action?",
    answer:
      "Your account may not have the required permissions, or the service may be temporarily unavailable. Confirm that you are signed in with the correct account. If the problem continues, contact your system administrator.",
  },
  {
    category: "Troubleshooting",
    question: "What should I do if a page does not load?",
    answer:
      "Check your internet connection, refresh the page, and sign in again if necessary. If the issue persists, the API service may be unavailable or the request may be failing. Try again later or contact your system administrator.",
  },
  {
    category: "Troubleshooting",
    question: "Why are some records missing?",
    answer:
      "Check any active search terms or filters and confirm that you are viewing the correct section. Records can also be limited by account permissions or service availability.",
  },
];

const categories = [
  "All Topics",
  "Getting Started",
  "Products & Inventory",
  "Sales & Payments",
  "Delivery",
  "Account & Security",
  "Troubleshooting",
];

const colorClasses = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  violet:
    "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  amber:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  pink: "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
  cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  orange:
    "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  indigo:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  slate:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

function HelpSupport() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Topics");
  const [openFaq, setOpenFaq] = useState(null);

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "All Topics" ||
        faq.category === activeCategory;

      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setOpenFaq(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10 text-slate-800 dark:text-slate-100">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <LifeBuoy size={16} />
            <span>Support Center</span>
            <span>/</span>
            <span className="text-blue-600 dark:text-blue-400">
              Help & Support
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Help & Support
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Find answers, explore the user guide, and troubleshoot common issues.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          Back to Dashboard
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Search hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-lg sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
            <CircleHelp size={30} />
          </div>

          <h2 className="text-2xl font-bold sm:text-3xl">
            How can we help you?
          </h2>

          <p className="mt-2 text-sm text-blue-100 sm:text-base">
            Search the help center to find answers to common questions.
          </p>

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-md ring-1 ring-black/5">
            <Search className="shrink-0 text-slate-400" size={21} />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOpenFaq(null);
              }}
              placeholder="Search questions, topics, or solutions..."
              aria-label="Search help topics"
              className="w-full border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="text-blue-600 dark:text-blue-400" size={21} />
          <h2 className="text-lg font-bold">Explore Help Topics</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {helpTopics.map((topic) => {
            const Icon = topic.icon;

            return (
              <Link
                to={topic.link}
                key={topic.title}
                className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorClasses[topic.color]}`}
                >
                  <Icon size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {topic.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {topic.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Open section
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAQ section */}
      <section
        id="frequently-asked-questions"
        className="scroll-mt-24"
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <MessageCircle
                className="text-blue-600 dark:text-blue-400"
                size={21}
              />
              <h2 className="text-lg font-bold">
                Frequently Asked Questions
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Browse common questions or search for a specific answer.
            </p>
          </div>

          <span className="text-sm text-slate-500 dark:text-slate-400">
            {filteredFaqs.length}{" "}
            {filteredFaqs.length === 1 ? "result" : "results"}
          </span>
        </div>

        {/* FAQ filters */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryChange(category)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === category
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-blue-400"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openFaq === faq.question;

            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenFaq(isOpen ? null : faq.question)
                  }
                  className="flex w-full items-start justify-between gap-4 p-4 text-left transition hover:bg-slate-50 sm:p-5 dark:hover:bg-slate-800/60"
                >
                  <div className="flex min-w-0 gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold leading-6">
                        {faq.question}
                      </h3>
                      <span className="mt-1 inline-block text-xs text-slate-500 dark:text-slate-400">
                        {faq.category}
                      </span>
                    </div>
                  </div>

                  {isOpen ? (
                    <ChevronUp
                      size={20}
                      className="mt-1 shrink-0 text-blue-600"
                    />
                  ) : (
                    <ChevronDown
                      size={20}
                      className="mt-1 shrink-0 text-slate-400"
                    />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-4 pb-5 pt-4 sm:px-5 dark:border-slate-800">
                    <p className="pl-10 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <Search
                size={32}
                className="mx-auto mb-3 text-slate-400"
              />
              <h3 className="font-semibold">No matching questions</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try a different search term or choose another category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All Topics");
                  setOpenFaq(null);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <RotateCcw size={15} />
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Troubleshooting & contact */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="font-bold">Having a problem?</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                If a page fails to load, check your connection, refresh the
                page, and try again. If the issue continues, the service or
                your account permissions may need attention.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("Troubleshooting");
                  setSearch("");
                  setOpenFaq(null);
                  document
                    .getElementById("frequently-asked-questions")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:underline dark:text-amber-300"
              >
                View troubleshooting FAQs
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-6 dark:border-blue-900/50 dark:bg-blue-950/20">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <Mail size={22} />
            </div>
            <div>
              <h3 className="font-bold">Still need help?</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Contact your system administrator if you need help with
                account access, permissions, incorrect records, or a
                persistent system issue.
              </p>
              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                Never share your password or authentication credentials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Helpful reminder */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Lightbulb
          size={20}
          className="mt-0.5 shrink-0 text-amber-500"
        />
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            Tip:
          </span>{" "}
          If you report an issue, include the page name, what you were trying
          to do, and the error message you saw. Never include passwords or
          other sensitive credentials.
        </p>
      </div>
    </div>
  );
}

export default HelpSupport;
