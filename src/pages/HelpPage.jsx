import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Truck,
  UserRound,
  RefreshCcw,
  HelpCircle,
} from "lucide-react";

const faqSections = [
  {
    id: "ordering",
    title: "Ordering",
    description: "Everything about placing an order.",
    icon: ShoppingBag,
    questions: [
      {
        question: "How do I place an order?",
        answer:
          "Browse our collection, select the products you want, and add them to your cart. When you're ready, proceed to checkout, provide your customer and shipping information, select a payment method, and complete your order.",
      },
      {
        question: "Do I need an account to place an order?",
        answer:
          "Yes. You need to sign in to your AVÉRO account before placing an order.",
      },
      {
        question: "Why can't I add a product to my order?",
        answer:
          "A product may be unavailable or may not have enough stock for your requested quantity. Product availability is checked again when your order is submitted.",
      },
      {
        question: "Can I change my order after placing it?",
        answer:
          "Please review your order carefully before submitting it. Contact AVÉRO's support team for assistance with order concerns. Changes are not currently available through a customer self-service feature.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    description: "Understand available payment methods and statuses.",
    icon: CreditCard,
    questions: [
      {
        question: "What payment methods are available?",
        answer:
          "AVÉRO currently supports Cash on Delivery (COD), GCash, and Card as selectable payment methods.",
      },
      {
        question: "Are GCash and card payments fully integrated?",
        answer:
          "Not yet. GCash and Card payments are currently simulated within the marketplace. No external payment gateway is integrated at this time.",
      },
      {
        question: "What does Pending payment mean?",
        answer:
          "Pending means a payment record has been created but has not yet been marked as paid, failed, or cancelled.",
      },
      {
        question: "When is an order eligible for processing?",
        answer:
          "An order must have a paid payment status before it can move into processing, shipping, or delivery.",
      },
    ],
  },
  {
    id: "orders",
    title: "Orders & Delivery",
    description: "Follow your order's progress.",
    icon: Truck,
    questions: [
      {
        question: "Where can I view my orders?",
        answer:
          "Sign in to your account and visit My Orders to view your order history, payment status, order status, and order details.",
      },
      {
        question: "What do the order statuses mean?",
        answer:
          "Pending means the order has been created. Processing means the order is being prepared. Shipped means it has been marked as shipped. Delivered means the order has been marked as delivered. Cancelled means the order has been cancelled.",
      },
      {
        question: "Can I track my package?",
        answer:
          "The current marketplace provides order status tracking through your order history and order details. External courier tracking is not currently integrated.",
      },
      {
        question: "Can I download an invoice?",
        answer:
          "Yes. Open your order confirmation page and use the available invoice download option.",
      },
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    description: "Help with your AVÉRO account.",
    icon: UserRound,
    questions: [
      {
        question: "How do I create an account?",
        answer:
          "Select Create an Account from the navigation or sign-in page, complete the registration form, and submit your details.",
      },
      {
        question: "Why can't I sign in?",
        answer:
          "Check that your email address and password are correct. If your account has been deactivated, you will need assistance from an administrator.",
      },
    ],
  },
  {
    id: "cancellations",
    title: "Cancellations & Refunds",
    description: "Understand how cancellations and refunds work.",
    icon: RefreshCcw,
    questions: [
      {
        question: "Can I cancel my order myself?",
        answer:
          "Customer self-service cancellation is not currently available. Order cancellations are handled through the marketplace's administrative workflow.",
      },
      {
        question: "Which orders are eligible for cancellation?",
        answer:
          "Pending and processing orders may be cancelled when their payment status is neither paid nor refunded. Paid orders must follow the refund workflow instead.",
      },
      {
        question: "How are refunds handled?",
        answer:
          "Only paid payments belonging to pending or processing orders are eligible for the current refund workflow. A successful refund marks the payment as refunded, cancels the order, and restores the associated product stock.",
      },
      {
        question: "What happens to product stock after cancellation?",
        answer:
          "When an eligible order is cancelled, its associated product quantities are returned to inventory. The marketplace also records the inventory movement.",
      },
    ],
  },
];

const HelpPage = () => {
  const [activeSection, setActiveSection] = useState("ordering");
  const [openQuestion, setOpenQuestion] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const selectedSection = faqSections.find(
    (section) => section.id === activeSection,
  );

  const handleQuestionToggle = (questionIndex) => {
    setOpenQuestion((current) =>
      current === questionIndex ? null : questionIndex,
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1C1C1C]">
      {/* Hero */}
      <section className="border-b border-[#E4DCCE]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-28">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B3261E]">
              Customer Care
            </p>

            <h1 className="mt-5 text-4xl font-medium leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              How can we
              <span className="block text-[#8A8176]">help you today?</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#6B6258] sm:text-base">
              Find answers to common questions about shopping, payments, orders,
              and your AVÉRO account.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
          {/* Categories */}
          <aside>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8176]">
              Browse by topic
            </p>

            <div className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
              {faqSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(section.id);
                      setOpenQuestion(null);
                    }}
                    aria-pressed={isActive}
                    className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] focus-visible:ring-offset-2 ${
                      isActive
                        ? "bg-[#1C1C1C] text-[#FAF8F4]"
                        : "text-[#6B6258] hover:bg-[#EDE6D8]"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{section.title}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Questions */}
          <div className="min-w-0">
            <div className="border-b border-[#E4DCCE] pb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B3261E]">
                Help & Information
              </p>

              <h2 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
                {selectedSection.title}
              </h2>

              <p className="mt-2 text-sm text-[#8A8176]">
                {selectedSection.description}
              </p>
            </div>

            <div className="mt-4">
              {selectedSection.questions.map((item, index) => {
                const isOpen = openQuestion === index;
                const answerId = `faq-answer-${activeSection}-${index}`;

                return (
                  <div
                    key={item.question}
                    className="border-b border-[#E4DCCE]"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => handleQuestionToggle(index)}
                      className="flex w-full items-center justify-between gap-5 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] focus-visible:ring-offset-2"
                    >
                      <span className="text-sm font-medium leading-6 sm:text-base">
                        {item.question}
                      </span>

                      <ChevronDown
                        aria-hidden="true"
                        className={`size-5 shrink-0 text-[#B3261E] transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div id={answerId} className="max-w-2xl pb-6 pr-8">
                        <p className="text-sm leading-7 text-[#6B6258]">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-[#EDE6D8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#FAF8F4]">
              <HelpCircle
                aria-hidden="true"
                className="size-5 text-[#B3261E]"
              />
            </div>

            <div>
              <h2 className="text-lg font-medium">Still need help?</h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-[#6B6258]">
                Visit our collection or return to your account to review your
                orders.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#1C1C1C] px-5 text-sm font-medium text-white transition-colors hover:bg-[#37322D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] focus-visible:ring-offset-2"
            >
              Explore Collection
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>

            <Link
              to="/orders"
              className="inline-flex h-11 items-center rounded-lg border border-[#CFC4B3] px-5 text-sm font-medium text-[#1C1C1C] transition-colors hover:bg-[#FAF8F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] focus-visible:ring-offset-2"
            >
              My Orders
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;
