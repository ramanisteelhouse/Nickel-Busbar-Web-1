import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Globe, MapPin, FileCheck, Ship, Factory, ArrowRight, FileText } from 'lucide-react';
import { BROCHURE } from '../lib/brochure';
import { logCallClick } from '../lib/utils';
import { EMAIL_ADDRESSES, PHONE_NUMBERS, telHref } from '../lib/contact';
import {
  EXPORT_DESCRIPTION,
  EXPORT_DOCUMENTS,
  EXPORT_FAQS,
  EXPORT_H1,
  EXPORT_HIGHLIGHTS,
  EXPORT_LEAD,
  EXPORT_PATH,
  EXPORT_REGIONS,
  EXPORT_SPECS,
  EXPORT_TITLE,
  HS_CODES,
  INCOTERMS,
  INDIA_HIGHLIGHTS,
  LOADING_PORTS,
  SUPPLY_REGIONS,
  type SupplyRegion,
} from '../lib/exportEnquiry';

const SITE_URL = 'https://www.nickelbusbar.com';

/**
 * No <script type="application/ld+json"> here on purpose. injectHead() in seoSnapshot.ts
 * writes this route's JSON-LD *outside* #root, so React's mount does not replace it - a
 * rendering crawler would see both copies and read one claim marked up twice. All structured
 * data for this URL lives in STATIC_ROUTE_SEO["/export-enquiry"]; the head tags below mirror
 * it and the two change together.
 */
export const ExportEnquiryPage: React.FC = () => {
  const [formState, setFormState] = React.useState({
    supplyRegion: 'export' as SupplyRegion,
    name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    port: '',
    product: '',
    thickness: '',
    quantity: '',
    incoterm: 'FOB',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState('');
  const [submitError, setSubmitError] = React.useState(false);

  const isExport = formState.supplyRegion === 'export';

  const handleChange =
    (key: keyof typeof formState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormState((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError(false);

    // /api/enquiries already stores location, quantity, thickness and requirement, so the
    // export-specific fields map onto the existing columns rather than needing a migration.
    const productName =
      SUPPLY_REGIONS.find((region) => region.value === formState.supplyRegion)?.productName ?? 'Export Enquiry';
    const destination = [formState.country, formState.port].filter(Boolean).join(' - ');

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          requirement: formState.product || 'Nickel strip / nickel busbar',
          thickness: formState.thickness,
          fullName: formState.name,
          email: formState.email,
          phone: formState.phone,
          company: formState.company,
          location: destination,
          quantity: formState.quantity,
          message: [
            isExport ? `Incoterm: ${formState.incoterm}` : 'Supply within India',
            formState.message,
          ]
            .filter(Boolean)
            .join(' | '),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitMessage(
        'Thanks! Your enquiry has been received - our export desk will send a quotation within 1 business day.'
      );
      setFormState((prev) => ({
        ...prev,
        name: '',
        email: '',
        phone: '',
        company: '',
        country: '',
        port: '',
        product: '',
        thickness: '',
        quantity: '',
        message: '',
      }));
    } catch {
      setSubmitError(true);
      setSubmitMessage('Unable to submit right now. Please email or call our export desk directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm';

  return (
    <div className="pt-28 pb-20 bg-[#f6f8f9] text-brand">
      <Helmet>
        <title>{EXPORT_TITLE}</title>
        <meta name="description" content={EXPORT_DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}${EXPORT_PATH}`} />
        <meta property="og:title" content={EXPORT_TITLE} />
        <meta property="og:description" content={EXPORT_DESCRIPTION} />
        <meta property="og:url" content={`${SITE_URL}${EXPORT_PATH}`} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
          <Link to="/" className="hover:text-brand">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-brand font-semibold">Export Enquiry</span>
        </nav>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-brand">
          Bulk Supply - India &amp; Worldwide
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-display font-bold">{EXPORT_H1}</h1>
        <p className="mt-4 max-w-3xl text-slate-600">{EXPORT_LEAD}</p>
        {/* Overseas buyers almost always want the company profile before they send a spec —
            it is what gets forwarded for internal approval. */}
        <a
          href={BROCHURE.path}
          target="_blank"
          rel="noreferrer"
          title={BROCHURE.description}
          className="mt-5 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand hover:bg-brand hover:text-white transition-colors"
        >
          <FileText size={16} />
          Download brochure
          <span className="font-normal opacity-70">({BROCHURE.sizeLabel})</span>
        </a>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-brand">
              <MapPin size={18} className="text-brand" /> Supply within India
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {INDIA_HIGHLIGHTS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-brand">-</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-brand">
              <Globe size={18} className="text-brand" /> Export worldwide
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {EXPORT_HIGHLIGHTS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-brand">-</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-brand">
            <Ship size={18} className="text-brand" /> Export markets we serve
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Exporting to 17+ countries from our Mumbai manufacturing unit, loading at {LOADING_PORTS}.
          </p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXPORT_REGIONS.map((market) => (
              <div key={market.region} className="rounded-xl border border-slate-100 bg-[#f6f8f9] p-4">
                <h3 className="text-sm font-semibold text-brand">{market.region}</h3>
                <p className="mt-1 text-xs text-slate-600">{market.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-brand">
              <Factory size={18} className="text-brand" /> Specification range
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              {EXPORT_SPECS.map((spec) => (
                <div key={spec.label} className="grid grid-cols-[130px_1fr] gap-3">
                  <dt className="font-semibold text-brand">{spec.label}</dt>
                  <dd className="text-slate-600">{spec.value}</dd>
                </div>
              ))}
            </dl>
            <Link
              to="/products"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
            >
              Browse the full nickel strip and busbar catalogue
              <ArrowRight size={14} />
            </Link>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-brand">
              <FileCheck size={18} className="text-brand" /> Export documentation
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {EXPORT_DOCUMENTS.map((doc) => (
                <li key={doc} className="flex gap-2">
                  <span className="text-brand">-</span>
                  {doc}
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold text-brand">HS codes</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              {HS_CODES.map((entry) => (
                <li key={entry.code}>
                  <span className="font-semibold text-brand">{entry.code}</span> - {entry.covers}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Incoterms quoted: {INCOTERMS.join(', ')}. Destination tariff lines vary by country - confirm the
              import line with your customs broker.
            </p>
          </section>
        </div>

        <section id="enquiry-form" className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-brand">Send your export or bulk enquiry</h2>
          <p className="mt-2 text-sm text-slate-600">
            Share the specification, quantity and destination. We respond with a quotation within 1 business day.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="sm:col-span-2 text-sm font-semibold text-brand">
              Supply region
              <select
                value={formState.supplyRegion}
                onChange={handleChange('supplyRegion')}
                className={`mt-2 w-full font-normal ${inputClass}`}
              >
                {SUPPLY_REGIONS.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </label>

            <input
              value={formState.name}
              onChange={handleChange('name')}
              placeholder="Full name"
              className={inputClass}
              required
            />
            <input
              value={formState.email}
              onChange={handleChange('email')}
              placeholder="Business email"
              type="email"
              className={inputClass}
              required
            />
            <input
              value={formState.phone}
              onChange={handleChange('phone')}
              placeholder="Phone / WhatsApp (with country code)"
              className={inputClass}
              required
            />
            <input
              value={formState.company}
              onChange={handleChange('company')}
              placeholder="Company"
              className={inputClass}
            />
            <input
              value={formState.country}
              onChange={handleChange('country')}
              placeholder={isExport ? 'Destination country' : 'State / city'}
              className={inputClass}
              required
            />
            <input
              value={formState.port}
              onChange={handleChange('port')}
              placeholder={isExport ? 'Port of destination' : 'Delivery location (optional)'}
              className={inputClass}
            />
            <input
              value={formState.product}
              onChange={handleChange('product')}
              placeholder="Product (pure nickel strip, H-type, busbar...)"
              className={inputClass}
            />
            <input
              value={formState.thickness}
              onChange={handleChange('thickness')}
              placeholder="Thickness x width (e.g. 0.15 x 8 mm)"
              className={inputClass}
            />
            <input
              value={formState.quantity}
              onChange={handleChange('quantity')}
              placeholder="Quantity (kg / MT)"
              className={inputClass}
              required
            />
            {isExport ? (
              <label className="text-sm font-semibold text-brand">
                Incoterm
                <select
                  value={formState.incoterm}
                  onChange={handleChange('incoterm')}
                  className={`mt-2 w-full font-normal ${inputClass}`}
                >
                  {INCOTERMS.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <textarea
              value={formState.message}
              onChange={handleChange('message')}
              placeholder="Application, standard required, packing preference, target delivery date"
              className={`sm:col-span-2 min-h-[110px] ${inputClass}`}
            />

            {submitMessage && (
              <p className={`sm:col-span-2 text-sm ${submitError ? 'text-red-600' : 'text-brand'}`}>
                {submitMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="sm:col-span-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting...' : 'Send Enquiry'}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-brand">Export desk email:</span>{' '}
              {EMAIL_ADDRESSES.map((email, index) => (
                <React.Fragment key={email}>
                  {index > 0 ? ' / ' : ''}
                  <a
                    href={`mailto:${email}`}
                    onClick={() => logCallClick(email, 'export_enquiry_email')}
                    className="hover:text-brand-dark"
                  >
                    {email}
                  </a>
                </React.Fragment>
              ))}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-brand">Phone / WhatsApp:</span>{' '}
              {PHONE_NUMBERS.map((number, index) => (
                <React.Fragment key={number.e164}>
                  {index > 0 ? ' / ' : ''}
                  <a
                    href={telHref(number)}
                    onClick={() => logCallClick(`+${number.e164}`, 'export_enquiry')}
                    className="hover:text-brand-dark"
                  >
                    {number.display}
                  </a>
                </React.Fragment>
              ))}
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-display font-bold text-brand">Export enquiry FAQs</h2>
          <div className="mt-5 space-y-3">
            {EXPORT_FAQS.map((faq) => (
              <details key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-5">
                <summary className="cursor-pointer text-sm font-semibold text-brand">{faq.question}</summary>
                <p className="mt-3 text-sm text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-10 text-sm text-slate-600">
          Need a weight estimate before you enquire? Use the{' '}
          <Link to="/calculator" className="font-semibold text-brand hover:text-brand-dark">
            nickel strip weight calculator
          </Link>
          , or read more{' '}
          <Link to="/about" className="font-semibold text-brand hover:text-brand-dark">
            about our manufacturing since 1974
          </Link>
          .
        </p>
      </div>
    </div>
  );
};
