import React from 'react';
import { Link } from 'react-router-dom';
import { logCallClick } from '../lib/utils';
import { EMAIL_ADDRESSES, PHONE_NUMBERS, POSTAL_ADDRESS, telHref } from '../lib/contact';
import { STATE_LANDING_PAGES } from '../lib/landingPages';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-2xl font-display font-bold text-brand">Ramani Nickel Strips</h3>
            <p className="text-sm text-slate-600">
              Premium nickel strips manufacturer serving lithium-ion battery producers worldwide.
            </p>
            <p className="text-sm text-slate-600">52+ years of metallurgical excellence | Mumbai, India</p>
            {/* PostalAddress microdata, not a sentence. The SEO audit's Local SEO check reported
                the address as missing while this printed it as one unlabelled line — nothing in
                the markup identified any part of it as an address. The values come from
                lib/contact so the visible address and the JSON-LD cannot drift apart. */}
            <address
              className="text-sm not-italic text-slate-600"
              itemScope
              itemType="https://schema.org/PostalAddress"
            >
              Office address:{' '}
              <span itemProp="streetAddress">{POSTAL_ADDRESS.streetAddress}</span>,{' '}
              <span itemProp="addressLocality">{POSTAL_ADDRESS.addressLocality}</span>,{' '}
              <span itemProp="addressRegion">{POSTAL_ADDRESS.addressRegion}</span>{' '}
              <span itemProp="postalCode">{POSTAL_ADDRESS.postalCode}</span>,{' '}
              <span itemProp="addressCountry">{POSTAL_ADDRESS.countryName}</span>
            </address>
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a href="https://www.linkedin.com/company/ramani-steel-house/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-brand">LinkedIn</a>
              <a href="https://www.facebook.com/profile.php?id=61550731232092" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-brand">Facebook</a>
              <a href="https://www.instagram.com/ramanisteelhouse/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-brand">Instagram</a>
              <a href="https://in.pinterest.com/ramanisteel2023/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-brand">Pinterest</a>
              <a href="https://x.com/SteelHouse69101" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-brand">X</a>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4">Quick Links</p>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products?search=nickel">Nickel Strips</Link></li>
              <li><Link to="/h-type-nickel-strip">H Type Nickel Strip</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/calculator">Weight Calculator</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/export-enquiry">Export Enquiry</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4">Contact</p>
            <ul className="space-y-3 text-sm text-slate-600">
              {EMAIL_ADDRESSES.map((email) => (
                <li key={email}>
                  <a
                    href={`mailto:${email}`}
                    onClick={() => logCallClick(email, 'footer_email')}
                    className="hover:text-brand"
                  >
                    {email}
                  </a>
                </li>
              ))}
              {PHONE_NUMBERS.map((number) => (
                <li key={number.e164}>
                  <a
                    href={telHref(number)}
                    onClick={() => logCallClick(`+${number.e164}`, 'footer')}
                    className="hover:text-brand"
                  >
                    {number.display}
                  </a>
                </li>
              ))}
              <li>PAN India + international supply support</li>
            </ul>
          </div>
        </div>
        {/* Crawlable links to the state landing pages. Without an entry point in site-wide
            navigation these URLs would be reachable only from the sitemap and from each other,
            which is a weak enough signal that Google often leaves such a cluster uncrawled. */}
        <div className="mt-10 border-t border-slate-200 pt-8">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4">Nickel Strip Supply Across India</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
            {STATE_LANDING_PAGES.map((state) => (
              <li key={state.path}>
                <Link to={state.path} className="hover:text-brand">{state.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <p>Copyright 2026 Ramani Steel House. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
