import React from 'react';
import { Helmet } from 'react-helmet-async';

export const ContactPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 bg-[#f6f8f9] text-[#304e58]">
      <Helmet>
        <title>Contact Us | Ramani Steel House</title>
        <meta
          name="description"
          content="Contact Ramani Steel House for nickel strips and industrial material requirements. Request quotes for lithium-ion battery manufacturing applications."
        />
        <link rel="canonical" href="https://nickelbusbar.com/contact" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold">Contact Us</h1>
        <p className="mt-3 text-slate-600">For product enquiries, custom requirements, and bulk orders.</p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
          <p><span className="font-semibold">Email:</span> ramanioffice@gmail.com</p>
          <p><span className="font-semibold">Phone:</span> +91 22 4567 8900</p>
          <p><span className="font-semibold">Service Coverage:</span> PAN India and international supply support</p>
        </div>
      </div>
    </div>
  );
};
