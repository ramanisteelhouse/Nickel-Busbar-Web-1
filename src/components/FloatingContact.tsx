import React from 'react';
import { MessageCircle, Mail, ClipboardList, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageProvider';
import { motion } from 'motion/react';
import { logCallClick } from '../lib/utils';
import {
  PRIMARY_CALL,
  PRIMARY_EMAIL,
  PRIMARY_WHATSAPP,
  buildWhatsAppUrl,
  telHref,
} from '../lib/contact';

const WHATSAPP_MESSAGE =
  'Hello Team, we need a quote for nickel strips for lithium-ion batteries.';

export const FloatingContact: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [chatOpen, setChatOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => setChatOpen(!!(e as CustomEvent<{ open: boolean }>).detail?.open);
    window.addEventListener('chatbot-open-changed', handler);
    return () => window.removeEventListener('chatbot-open-changed', handler);
  }, []);

  return (
    <div
      className="floating-contact-bar fixed right-0 top-1/2 z-50 transition-transform duration-300"
      style={{ transform: `translateY(-50%) translateX(${chatOpen ? '100%' : '0'})` }}
    >
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col overflow-hidden rounded-l-2xl shadow-2xl border border-white/10"
      >
        <motion.a
          href={telHref(PRIMARY_CALL)}
          aria-label={t('product.call')}
          onClick={() => logCallClick(`+${PRIMARY_CALL.e164}`, 'floating_contact')}
          whileHover={{ x: -6 }}
          className="contact-item call flex items-center gap-2 bg-brand-dark px-4 py-3 text-sm font-semibold text-white transition-transform"
        >
          <Phone size={16} />
          <span className="hidden sm:inline">{t('product.call')}</span>
        </motion.a>
        {/* Opens the enquiry form rather than mailto: a mail client hand-off never
            reaches the server, so the lead would never arrive in the CRM. */}
        <motion.button
          type="button"
          aria-label={t('product.email')}
          onClick={() => {
            logCallClick(PRIMARY_EMAIL, 'floating_contact_email');
            navigate('/products?enquiry=1');
          }}
          whileHover={{ x: -6 }}
          className="contact-item email flex items-center gap-2 bg-brand px-4 py-3 text-sm font-semibold text-white transition-transform text-left"
        >
          <Mail size={16} />
          <span className="hidden sm:inline">{t('product.email')}</span>
        </motion.button>
        <motion.a
          href={buildWhatsAppUrl(WHATSAPP_MESSAGE)}
          target="_blank"
          rel="noreferrer"
          aria-label={t('product.whatsapp')}
          onClick={() => logCallClick(`+${PRIMARY_WHATSAPP.e164}`, 'floating_contact_whatsapp')}
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
          className="contact-item flex items-center gap-2 bg-brand px-4 py-3 text-sm font-semibold text-white transition-transform text-left"
        >
          <ClipboardList size={16} />
          <span className="hidden sm:inline">{t('enquiry.title')}</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

