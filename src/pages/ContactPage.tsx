import React from 'react';
import { Helmet } from 'react-helmet-async';
import { logCallClick } from '../lib/utils';

export const ContactPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 bg-[#f6f8f9] text-brand">
      <Helmet>
        <title>Contact Us | Ramani Steel House</title>
        <meta
          name="description"
          content="Contact Ramani Steel House for nickel strips and industrial material requirements. Request quotes for lithium-ion battery manufacturing applications."
        />
        <link rel="canonical" href="https://www.nickelbusbar.com/contact" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold">Contact Us</h1>
        <p className="mt-3 text-slate-600">For product enquiries, custom requirements, and bulk orders.</p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
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
