import React, { useState } from 'react';
import { Music, ListMusic, Settings, Activity, Book } from 'lucide-react';
import HelpModal from './HelpModal';

const Layout = ({ children, activeTab, setActiveTab }) => {
  const [showHelp, setShowHelp] = useState(false);
  const navItems = [
    { id: 'generator', icon: Music, label: 'Create' },
    { id: 'library', icon: ListMusic, label: 'Library' },
  ];

  return (
    <div className="flex w-full h-[calc(100vh-96px)]">
      <div className="w-64 bg-surface border-r border-border flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ACE-Step
          </h1>
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Studio v1.5</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setShowHelp(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <Book size={20} />
            <span className="font-medium">Guide</span>
          </button>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>System Online</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-dark relative">
        {children}
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default Layout;
