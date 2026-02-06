import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import { Play, Trash2, Calendar, Clock, Search, Grid, List, Tag, Folder, Edit2, MoreHorizontal, Check, X as XIcon, FolderPlus } from 'lucide-react';
import InfoTooltip from '../components/InfoTooltip';

const Library = ({ onPlay, currentTrack }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedFolder, setSelectedFolder] = useState('All');

  // Editing states
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [taggingId, setTaggingId] = useState(null);
  const [tagInput, setTagInput] = useState('');

  // Moving state
  const [movingIds, setMovingIds] = useState([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

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

  // Derived state: Folders
  const folders = useMemo(() => {
    const foldersSet = new Set(['All']);
    tracks.forEach(t => {
        // Extract folder name from path
        // path: /.../gradio_outputs/folder/file.json
        // We assume the structure is flat or 1 level deep mostly, but let's try to find relative path
        // A simple heuristic: take the parent directory name
        const parts = t.id.replace(/\\/g, '/').split('/');
        const parent = parts[parts.length - 2];
        if (parent !== 'gradio_outputs') {
             foldersSet.add(parent);
        }
    });
    return Array.from(foldersSet).sort();
  }, [tracks]);

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

  const handleRename = async (id, newName) => {
      if (!newName.trim()) return;
      try {
          await api.updateLibrary({ action: 'rename', id, new_filename: newName });
          // Refresh to get new paths
          fetchHistory();
          setEditingId(null);
      } catch(err) {
          alert("Failed to rename: " + (err.response?.data?.detail || err.message));
      }
  };

  const handleAddTag = async (track, tag) => {
      if(!tag.trim()) return;
      const currentTags = track.meta?.tags || [];
      if(currentTags.includes(tag)) return;

      const newTags = [...currentTags, tag.trim()];
      try {
          await api.updateLibrary({ action: 'tag', id: track.id, tags: newTags });
          // Optimistic update
          setTracks(prev => prev.map(t =>
              t.id === track.id ? { ...t, meta: { ...t.meta, tags: newTags } } : t
          ));
          setTagInput('');
      } catch(err) {
          console.error(err);
      }
  };

  const handleRemoveTag = async (track, tagToRemove) => {
      const currentTags = track.meta?.tags || [];
      const newTags = currentTags.filter(t => t !== tagToRemove);
      try {
          await api.updateLibrary({ action: 'tag', id: track.id, tags: newTags });
           setTracks(prev => prev.map(t =>
              t.id === track.id ? { ...t, meta: { ...t.meta, tags: newTags } } : t
          ));
      } catch(err) {
           console.error(err);
      }
  };

  const handleMove = async (targetFolder) => {
      if (!targetFolder) return;
      try {
          // Move all selected or just the one triggered
          const idsToMove = movingIds.length > 0 ? movingIds : []; // Should strictly control this
          // For now let's just assume we move one at a time or build a selection system
          // Implementation of selection system is large, let's stick to single file move context for now if movingIds is empty
          // But wait, the state `movingIds` implies multiple.

          for (const id of movingIds) {
             await api.updateLibrary({ action: 'move', id, target_folder: targetFolder });
          }

          fetchHistory();
          setShowMoveModal(false);
          setMovingIds([]);
          setNewFolderName('');
      } catch(err) {
          alert("Failed to move: " + err.message);
      }
  };

  const filteredTracks = tracks.filter(t => {
      // Filter by Search
      const matchesSearch = (t.caption || "").toLowerCase().includes(search.toLowerCase()) ||
                            (t.filename || "").toLowerCase().includes(search.toLowerCase()) ||
                            (t.meta?.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()));

      // Filter by Folder
      if (selectedFolder === 'All') return matchesSearch;

      const parts = t.id.replace(/\\/g, '/').split('/');
      const parent = parts[parts.length - 2];
      const isRoot = parent === 'gradio_outputs';

      // If selected folder is a name, match it
      // Note: this logic assumes 1 level deep.
      return matchesSearch && parent === selectedFolder;
  });

  return (
    <div className="h-full flex">
        {/* Sidebar */}
        <div className="w-48 bg-black/20 border-r border-border p-4 flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Folders</h3>
            {folders.map(f => (
                <button
                    key={f}
                    onClick={() => setSelectedFolder(f)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                        selectedFolder === f ? 'bg-primary/20 text-primary' : 'text-zinc-400 hover:bg-zinc-800'
                    }`}
                >
                    <Folder size={14} />
                    <span className="truncate">{f}</span>
                </button>
            ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        Library <span className="text-sm font-normal text-zinc-500">({filteredTracks.length})</span>
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search tracks, tags..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-surface border border-border rounded-full pl-10 pr-4 py-2 outline-none focus:border-primary transition text-sm text-white placeholder-zinc-500"
                        />
                    </div>

                    <div className="flex bg-surface border border-border rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-zinc-500">
                    Loading library...
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24">
                            {filteredTracks.map((track) => (
                                <TrackCard
                                    key={track.id}
                                    track={track}
                                    onPlay={onPlay}
                                    onDelete={handleDelete}
                                    onRename={handleRename}
                                    onAddTag={handleAddTag}
                                    onRemoveTag={handleRemoveTag}
                                    onMove={(id) => { setMovingIds([id]); setShowMoveModal(true); }}
                                    editingId={editingId}
                                    setEditingId={setEditingId}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2 pb-24">
                             {filteredTracks.map((track) => (
                                <TrackRow
                                    key={track.id}
                                    track={track}
                                    onPlay={onPlay}
                                    onDelete={handleDelete}
                                    onRename={handleRename}
                                    onAddTag={handleAddTag}
                                    onRemoveTag={handleRemoveTag}
                                    onMove={(id) => { setMovingIds([id]); setShowMoveModal(true); }}
                                    editingId={editingId}
                                    setEditingId={setEditingId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Move Modal */}
        {showMoveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-surface border border-border rounded-xl p-6 w-96 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4">Move to Folder</h3>

                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                        {folders.filter(f => f !== 'All').map(f => (
                            <button
                                key={f}
                                onClick={() => handleMove(f)}
                                className="w-full text-left px-3 py-2 rounded hover:bg-zinc-800 flex items-center gap-2 text-sm"
                            >
                                <Folder size={14} /> {f}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-border pt-4">
                        <label className="text-xs text-zinc-500 mb-1 block">Create New Folder</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Folder Name"
                                className="flex-1 bg-zinc-900 border border-border rounded px-3 py-1 text-sm outline-none focus:border-primary"
                            />
                            <button
                                onClick={() => handleMove(newFolderName)}
                                disabled={!newFolderName.trim()}
                                className="bg-primary px-3 py-1 rounded text-white text-sm disabled:opacity-50"
                            >
                                <FolderPlus size={16} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowMoveModal(false)}
                        className="mt-4 w-full py-2 text-zinc-400 hover:text-white text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

const TrackCard = ({ track, onPlay, onDelete, onRename, onAddTag, onRemoveTag, onMove, editingId, setEditingId }) => {
    const isEditing = editingId === track.id;
    const [name, setName] = useState(track.meta?.caption?.slice(0, 30) || track.filename); // Default name logic
    const [tagInput, setTagInput] = useState('');
    const [showTags, setShowTags] = useState(false);

    // Use filename base as display name usually, or caption?
    // User probably wants to rename the FILE.
    const displayName = track.filename.replace(/\.(mp3|wav|flac)$/, '');

    return (
        <div className="group bg-surface border border-border rounded-xl p-4 hover:border-primary/50 transition relative flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
                 <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition cursor-pointer" onClick={() => onPlay(track)}>
                    <Play fill="currentColor" size={16} />
                </div>
                <div className="flex gap-1">
                    <button onClick={() => onMove(track.id)} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white" title="Move">
                        <Folder size={14} />
                    </button>
                    <button onClick={(e) => onDelete(track.id, e)} className="p-1.5 hover:bg-red-500/20 rounded text-zinc-500 hover:text-red-400" title="Delete">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-[3rem]">
                {isEditing ? (
                    <div className="flex items-center gap-1 mb-2">
                        <input
                            autoFocus
                            className="w-full bg-zinc-900 border border-primary rounded px-2 py-1 text-sm outline-none"
                            defaultValue={displayName}
                            onBlur={(e) => onRename(track.id, e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter') onRename(track.id, e.currentTarget.value); }}
                        />
                    </div>
                ) : (
                    <h3
                        className="font-semibold text-sm line-clamp-2 mb-2 cursor-text hover:text-primary transition"
                        onDoubleClick={() => setEditingId(track.id)}
                        title="Double click to rename"
                    >
                        {displayName}
                    </h3>
                )}

                <p className="text-xs text-zinc-500 line-clamp-2 italic mb-2">{track.caption}</p>
            </div>

            {/* Tags */}
            <div className="mb-3 flex flex-wrap gap-1">
                {(track.meta?.tags || []).map(tag => (
                    <span key={tag} className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                        {tag}
                        <button onClick={() => onRemoveTag(track, tag)} className="hover:text-red-400"><XIcon size={8} /></button>
                    </span>
                ))}
                <div className="relative">
                    <button onClick={() => setShowTags(!showTags)} className="text-[10px] bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Tag size={8} /> +
                    </button>
                    {showTags && (
                        <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-border p-2 rounded w-32 z-20">
                            <input
                                autoFocus
                                className="w-full bg-black border border-zinc-700 rounded px-1 text-xs outline-none"
                                placeholder="New tag..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') {
                                        onAddTag(track, tagInput);
                                        setTagInput('');
                                        setShowTags(false);
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-500 border-t border-border pt-3 mt-auto">
                <span className="flex items-center gap-1"><Clock size={12} /> {track.duration}s</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {track.date?.split(' ')[0]}</span>
            </div>
        </div>
    );
};

const TrackRow = ({ track, onPlay, onDelete, onRename, onAddTag, onRemoveTag, onMove, editingId, setEditingId }) => {
    const isEditing = editingId === track.id;
    const displayName = track.filename.replace(/\.(mp3|wav|flac)$/, '');
    const [tagInput, setTagInput] = useState('');

    return (
        <div className="group bg-surface border border-border rounded-lg p-2 hover:bg-zinc-800/50 transition flex items-center gap-4">
            <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white" onClick={() => onPlay(track)}>
                <Play fill="currentColor" size={12} />
            </div>

            <div className="flex-1 min-w-0">
                 {isEditing ? (
                    <input
                        autoFocus
                        className="bg-zinc-900 border border-primary rounded px-2 py-0.5 text-sm outline-none"
                        defaultValue={displayName}
                        onBlur={(e) => onRename(track.id, e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter') onRename(track.id, e.currentTarget.value); }}
                    />
                ) : (
                    <div className="font-medium text-sm truncate cursor-pointer hover:text-primary" onDoubleClick={() => setEditingId(track.id)}>
                        {displayName}
                    </div>
                )}
            </div>

            {/* Tags in row */}
             <div className="flex items-center gap-1 w-1/4 overflow-hidden">
                {(track.meta?.tags || []).slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                        {tag}
                    </span>
                ))}
                 <input
                    className="w-16 bg-transparent text-[10px] outline-none text-zinc-500 focus:text-white placeholder-zinc-700"
                    placeholder="+ tag"
                    onKeyDown={(e) => {
                        if(e.key === 'Enter') {
                            onAddTag(track, e.currentTarget.value);
                            e.currentTarget.value = '';
                        }
                    }}
                />
            </div>

            <div className="text-xs text-zinc-500 w-20">{track.duration}s</div>
            <div className="text-xs text-zinc-500 w-24">{track.date?.split(' ')[0]}</div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button onClick={() => onMove(track.id)} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-500 hover:text-white"><Folder size={14} /></button>
                <button onClick={(e) => onDelete(track.id, e)} className="p-1.5 hover:bg-red-500/20 rounded text-zinc-500 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
        </div>
    )
}

export default Library;
