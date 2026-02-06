import React, { useEffect, useState } from 'react';
import { X, Book } from 'lucide-react';
import Markdown from 'react-markdown';
import { api } from '../api/client';

const HelpModal = ({ onClose }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGuide()
      .then(res => {
        setContent(res.data?.data?.content || '# No guide available');
      })
      .catch(err => {
        console.error(err);
        setContent('# Error loading guide');
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl h-[85vh] bg-zinc-900 border border-zinc-700 rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-100">
            <Book className="text-primary" /> User Guide
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/20">
          {loading ? (
             <div className="flex items-center justify-center h-full text-zinc-500">
               Loading guide...
             </div>
          ) : (
            <div className="prose prose-invert prose-blue max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-200 prose-code:text-primary prose-pre:bg-zinc-900/50 prose-pre:border prose-pre:border-zinc-800">
              <Markdown>{content}</Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
