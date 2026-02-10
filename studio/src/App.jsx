import React, { useState } from 'react';
import Layout from './components/Layout';
import Generator from './pages/Generator';
import Library from './pages/Library';
import AudioPlayer from './components/AudioPlayer';

function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [currentTrack, setCurrentTrack] = useState(null);

  const playTrack = (track) => {
    setCurrentTrack(track);
  };

  return (
    <div className="flex h-screen bg-dark text-white font-sans selection:bg-primary/30">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === 'generator' && <Generator onPlay={playTrack} />}
            {activeTab === 'library' && <Library onPlay={playTrack} currentTrack={currentTrack} />}
        </Layout>
        <AudioPlayer track={currentTrack} />
      </div>
    </div>
  );
}

export default App;
