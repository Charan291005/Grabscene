"use client";

import React, { useEffect, useState } from 'react';
import { X, Mail } from 'lucide-react';

export const EmailPreviewDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    // Listen for custom event that gets dispatched upon checkout confirmation
    const handleEmailPreview = (e: any) => {
      if (e.detail?.mockHtml) {
        setHtmlContent(e.detail.mockHtml);
        setIsOpen(true);
      }
    };

    window.addEventListener('grabscene:mock-email', handleEmailPreview as EventListener);
    return () => window.removeEventListener('grabscene:mock-email', handleEmailPreview as EventListener);
  }, []);

  if (!isOpen || !htmlContent) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 shadow-2xl h-full flex flex-col transform transition-transform duration-500 translate-x-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-none">Mock Email Intercepted</h2>
              <p className="text-sm text-zinc-400 mt-1">Rendered in Dev Mode (No RESEND_API_KEY)</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Iframe Content */}
        <div className="flex-1 bg-white relative overflow-hidden">
          <iframe 
            srcDoc={htmlContent} 
            className="w-full h-full border-none"
            title="Email Preview"
          />
        </div>

      </div>
    </div>
  );
};
