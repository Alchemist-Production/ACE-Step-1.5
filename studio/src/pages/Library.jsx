import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Play, Trash2, Calendar, Clock, Search } from 'lucide-react';

const Library = ({ onPlay, currentTrack }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
        const res = await api.getHistory();
        if(res.data?.data) {
            setTracks(res.data.data);
        }
    } catch(e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
      e.stopPropagation();
      if(confirm('Delete this track?')) {
          try {
              await api.deleteHistory(id);
              setTracks(prev => prev.filter(t => t.id !== id));
          } catch(err) {
              console.error(err);
              alert("Failed to delete");
          }
      }
  };

  const filteredTracks = tracks.filter(t =>
    (t.caption || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.filename || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Library</h2>
            <p className="text-zinc-500 text-sm">{tracks.length} tracks generated</p>
          </div>

          <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border border-border rounded-full pl-10 pr-4 py-2 outline-none focus:border-primary transition text-sm text-white placeholder-zinc-500"
              />
          </div>
      </div>

      {loading ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
              Loading library...
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-24 custom-scrollbar">
              {filteredTracks.map((track) => (
                  <div
                    key={track.id}
                    className="group bg-surface border border-border rounded-xl p-4 hover:border-primary/50 transition cursor-pointer relative"
                    onClick={() => onPlay(track)}
                  >
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition z-10">
                          <button
                            onClick={(e) => handleDelete(track.id, e)}
                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>

                      <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition">
                          <Play fill="currentColor" size={20} />
                      </div>

                      <h3 className="font-semibold truncate mb-1" title={track.caption}>{track.caption || "Untitled"}</h3>
                      <p className="text-xs text-zinc-500 truncate mb-4">{track.filename}</p>

                      <div className="flex items-center gap-4 text-xs text-zinc-500 border-t border-border pt-3">
                          <div className="flex items-center gap-1">
                              <Clock size={12} />
                              {track.duration}s
                          </div>
                          <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              {track.date?.split(' ')[0]}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default Library;
