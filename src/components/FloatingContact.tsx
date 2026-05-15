import React from 'react';
import { MessageCircle, Mail, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageProvider';
import { motion } from 'motion/react';

export const FloatingContact: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="floating-contact-bar fixed right-0 top-1/2 -translate-y-1/2 z-50">
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col overflow-hidden rounded-l-2xl shadow-2xl border border-white/10"
      >
        <motion.a
          href="mailto:sales@ramanisteel.com?subject=Nickel%20Strip%20Enquiry"
          aria-label={t('product.email')}
          whileHover={{ x: -6 }}
          className="contact-item email flex items-center gap-2 bg-[#304e58] px-4 py-3 text-sm font-semibold text-white transition-transform"
        >
          <Mail size={16} />
          <span className="hidden sm:inline">{t('product.email')}</span>
        </motion.a>
        <motion.a
          href="https://wa.me/918369724730?text=Hello%20Team%2C%20we%20need%20a%20quote%20for%20nickel%20strips%20for%20lithium-ion%20batteries."
          target="_blank"
          rel="noreferrer"
          aria-label={t('product.whatsapp')}
          whileHover={{ x: -6 }}
          className="contact-item whatsapp flex items-center gap-2 bg-[#22C55E] px-4 py-3 text-sm font-semibold text-white transition-transform"
        >
          <MessageCircle size={16} />
          <span className="hidden sm:inline">{t('product.whatsapp')}</span>
        </motion.a>
        <motion.button
          type="button"
          onClick={() => navigate('/products?enquiry=1')}
          aria-label={t('enquiry.title')}
          whileHover={{ x: -6 }}
          className="contact-item flex items-center gap-2 bg-[#304e58] px-4 py-3 text-sm font-semibold text-white transition-transform text-left"
        >
          <ClipboardList size={16} />
          <span className="hidden sm:inline">{t('enquiry.title')}</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

