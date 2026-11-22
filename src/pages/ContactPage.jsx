import { useEffect, useState } from "react";
import { toast } from "sonner";
import { submitContactInquiry } from "../services/contactService";

const initialFormData = {
  full_name: "",
  email: "",
  phone: "",
  inquiry_type: "",
  subject: "",
  message: "",
};

const fieldClass =
  "w-full rounded-sm border border-[#E4DCCE] bg-[#FAF8F4] px-4 py-3 text-sm text-[#1C1C1C] outline-none transition placeholder:text-[#A49A8D] focus:border-[#B3261E] focus:ring-2 focus:ring-[#B3261E]/10 focus-visible:outline-none";

const labelClass =
  "mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6B6258]";

const errorClass = "mt-2 text-xs text-[#B3261E]";

const focusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E] focus-visible:ring-offset-2";

const ContactPage = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrors({});
    setIsSubmitting(true);

    try {
      await submitContactInquiry(formData);

      toast.success("Your inquiry has been submitted successfully.");
      setFormData(initialFormData);
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const fieldErrors = {};

        error.errors.forEach((item) => {
          fieldErrors[item.field] = item.message;
        });

        setErrors(fieldErrors);
        toast.error("Please check the highlighted fields.");
      } else {
        toast.error(error.message || "Unable to submit your inquiry.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF8F4] text-[#1C1C1C]">
      {/* Hero */}
      <section className="bg-[#EDE6D8]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B3261E]">
            Customer Care
          </p>

          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-medium leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
            We'd love to hear from you.
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-8 text-[#6B6258] sm:text-base">
            Have a question, need assistance, or simply want to share something
            with us? Send us a message and we'll be happy to help.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
        {/* Contact Information */}
        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B3261E]">
            Get in Touch
          </p>

          <h2 className="mt-5 font-serif text-3xl font-medium leading-tight sm:text-4xl">
            Here to make your experience better.
          </h2>

          <p className="mt-6 text-sm leading-8 text-[#6B6258]">
            Whether it's about an order, a product, or anything else, we're here
            to listen. Share your inquiry through the form and our team will
            review your message.
          </p>

          <div className="mt-12 border-t border-[#E4DCCE] pt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B3261E]">
              A Note from AVÉRO
            </p>

            <p className="mt-4 font-serif text-2xl leading-relaxed text-[#1C1C1C]">
              Thoughtful service begins with listening.
            </p>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="rounded-sm border border-[#E4DCCE] bg-white p-6 sm:p-9 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B3261E]">
            Send an Inquiry
          </p>

          <h2 className="mt-3 font-serif text-3xl font-medium">
            How can we help?
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#6B6258]">
            Fill in the details below and send us your message.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className={labelClass}>
                  Full Name
                </label>

                <input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                  maxLength={150}
                  aria-invalid={Boolean(errors.full_name)}
                  aria-describedby={
                    errors.full_name ? "full_name-error" : undefined
                  }
                />

                {errors.full_name && (
                  <p id="full_name-error" role="alert" className={errorClass}>
                    {errors.full_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  maxLength={255}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />

                {errors.email && (
                  <p id="email-error" role="alert" className={errorClass}>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone Number{" "}
                <span className="font-normal normal-case">(Optional)</span>
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={fieldClass}
                placeholder="Your contact number"
                autoComplete="tel"
                maxLength={30}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />

              {errors.phone && (
                <p id="phone-error" role="alert" className={errorClass}>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Inquiry Type */}
            <div>
              <label htmlFor="inquiry_type" className={labelClass}>
                Inquiry Type
              </label>

              <input
                id="inquiry_type"
                name="inquiry_type"
                value={formData.inquiry_type}
                onChange={handleChange}
                className={fieldClass}
                placeholder="e.g. Product Inquiry, Order Support, General Inquiry"
                required
                maxLength={50}
                aria-invalid={Boolean(errors.inquiry_type)}
                aria-describedby={
                  errors.inquiry_type ? "inquiry_type-error" : undefined
                }
              />

              {errors.inquiry_type && (
                <p id="inquiry_type-error" role="alert" className={errorClass}>
                  {errors.inquiry_type}
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className={labelClass}>
                Subject
              </label>

              <input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={fieldClass}
                placeholder="What is your message about?"
                required
                maxLength={150}
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? "subject-error" : undefined}
              />

              {errors.subject && (
                <p id="subject-error" role="alert" className={errorClass}>
                  {errors.subject}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className={labelClass}>
                Message
              </label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`${fieldClass} min-h-36 resize-y`}
                placeholder="Tell us how we can help..."
                rows={6}
                required
                maxLength={5000}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "message-error" : undefined}
              />

              {errors.message && (
                <p id="message-error" role="alert" className={errorClass}>
                  {errors.message}
                </p>
              )}

              <p className="mt-2 text-right text-xs text-[#8A8176]">
                {formData.message.length}/5000
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex w-full items-center justify-center rounded-sm bg-[#B3261E] px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#922019] disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}
            >
              {isSubmitting ? "Submitting..." : "Send Inquiry"}
            </button>

            <p className="text-center text-xs leading-6 text-[#8A8176]">
              Your inquiry will be reviewed by our customer care team.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
