import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const BackNavButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/') {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          navigate(-1);
          return;
        }
        navigate('/');
      }}
      className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-semibold text-brand shadow-lg backdrop-blur hover:bg-white"
      aria-label="Go back"
    >
      <ArrowLeft size={14} />
      Back
    </button>
  );
};
