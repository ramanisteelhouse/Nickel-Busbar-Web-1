import React from 'react';
import { Link } from 'react-router-dom';
import { logCallClick } from '../lib/utils';

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
            <p className="text-sm text-slate-600">Office address: Marine Lines East, Mumbai, Maharashtra 400004, India</p>
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a href="https://www.linkedin.com/company/ramani-steel-house/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-brand">LinkedIn</a>
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
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/calculator">Weight Calculator</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4">Contact</p>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <a
                  href="mailto:ramanioffice@gmail.com"
                  onClick={() => logCallClick('ramanioffice@gmail.com', 'footer_email')}
                  className="hover:text-brand"
                >
                  ramanioffice@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+918369724730"
                  onClick={() => logCallClick('+918369724730', 'footer')}
                  className="hover:text-brand"
                >
                  +91 8369724730
                </a>
              </li>
              <li>PAN India + international supply support</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <p>Copyright 2026 Ramani Steel House. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
