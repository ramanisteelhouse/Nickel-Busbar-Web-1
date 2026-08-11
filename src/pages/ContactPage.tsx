import React from 'react';
import { Helmet } from 'react-helmet-async';
import { logCallClick } from '../lib/utils';

const SITE_URL = 'https://www.nickelbusbar.com';

export const ContactPage: React.FC = () => {
  const [formState, setFormState] = React.useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState('');
  const [submitError, setSubmitError] = React.useState(false);

  const handleChange = (key: keyof typeof formState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError(false);

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: 'General Enquiry',
          fullName: formState.name,
          email: formState.email,
          phone: formState.phone,
          company: formState.company,
          message: formState.message || 'Contact page enquiry',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitMessage('Thanks! Your enquiry has been received — our team will get back to you within 1 business day.');
      setFormState({ name: '', email: '', phone: '', company: '', message: '' });
    } catch {
      setSubmitError(true);
      setSubmitMessage('Unable to submit right now. Please email or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Ramani Steel House',
    url: `${SITE_URL}/contact`,
    about: {
      '@type': 'Organization',
      name: 'Ramani Steel House',
      email: 'ramanioffice@gmail.com',
      telephone: '+91 8369724730',
    },
  };

  return (
    <div className="pt-28 pb-20 bg-[#f6f8f9] text-brand">
      <Helmet>
        <title>Contact Us | Ramani Steel House</title>
        <meta
          name="description"
          content="Contact Ramani Steel House, a nickel strip manufacturer in India, for nickel strip and nickel busbar enquiries. Request a quote for lithium-ion battery manufacturing applications."
        />
        <link rel="canonical" href="https://www.nickelbusbar.com/contact" />
        <script type="application/ld+json">{JSON.stringify(contactPageJsonLd)}</script>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold">Contact Us</h1>
        <p className="mt-3 text-slate-600">For product enquiries, custom requirements, and bulk orders.</p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 h-fit">
            <p>
              <span className="font-semibold">Email:</span>{' '}
              <a
                href="mailto:ramanioffice@gmail.com"
                onClick={() => logCallClick('ramanioffice@gmail.com', 'contact_page_email')}
                className="hover:text-brand-dark"
              >
                ramanioffice@gmail.com
              </a>
            </p>
            <p>
              <span className="font-semibold">Phone:</span>{' '}
              <a href="tel:+918369724730" onClick={() => logCallClick('+918369724730', 'contact_page')} className="hover:text-brand-dark">
                +91 8369724730
              </a>
            </p>
            <p><span className="font-semibold">Service Coverage:</span> PAN India and international supply support</p>
            <div className="pt-2">
              <a
                href="https://maps.app.goo.gl/8D2hLs4CMunteUCN8"
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
              >
                Open in Google Maps
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <h2 className="sm:col-span-2 text-lg font-semibold text-brand">Send us an enquiry</h2>
            <input
              value={formState.name}
              onChange={handleChange('name')}
              placeholder="Name"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              required
            />
            <input
              value={formState.email}
              onChange={handleChange('email')}
              placeholder="Email"
              type="email"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              required
            />
            <input
              value={formState.phone}
              onChange={handleChange('phone')}
              placeholder="Phone"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              required
            />
            <input
              value={formState.company}
              onChange={handleChange('company')}
              placeholder="Company (optional)"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            />
            <textarea
              value={formState.message}
              onChange={handleChange('message')}
              placeholder="Tell us about your requirement (product, dimensions, quantity)"
              className="sm:col-span-2 min-h-[110px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              required
            />
            {submitMessage && (
              <p className={`sm:col-span-2 text-sm ${submitError ? 'text-red-600' : 'text-brand'}`}>{submitMessage}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="sm:col-span-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting...' : 'Send Enquiry'}
            </button>
          </form>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <iframe
            title="Ramani Steel House location"
            src="https://maps.google.com/maps?q=Ramani%20Steel%20House&t=&z=14&ie=UTF8&iwloc=&output=embed"
            className="h-[360px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
};
