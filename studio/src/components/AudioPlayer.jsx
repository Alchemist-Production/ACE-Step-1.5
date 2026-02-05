import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Maximize2 } from 'lucide-react';

const MusicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
)

const AudioPlayer = ({ track }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.src = track.audio_url;
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
      setIsPlaying(true);
    } else {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    }
  }, [track]);

  const togglePlay = () => {
    if (!audioRef.current || !track) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e) => {
      const vol = parseFloat(e.target.value);
      setVolume(vol);
      if(audioRef.current) audioRef.current.volume = vol;
  }

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (!track) return (
      <div className="h-24 bg-surface border-t border-border flex items-center justify-center text-zinc-500">
          Select a track to play
      </div>
  );

  return (
    <div className="h-24 bg-surface border-t border-border px-6 flex items-center justify-between z-50 relative shadow-2xl">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* Track Info */}
      <div className="flex items-center gap-4 w-1/4">
        <div className="w-12 h-12 bg-zinc-800 rounded-md flex items-center justify-center text-zinc-600">
            <MusicIcon />
        </div>
        <div className="overflow-hidden">
          <h3 className="font-semibold text-white truncate">{track.caption || track.filename}</h3>
          <p className="text-xs text-zinc-400 truncate">{track.filename}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
        <div className="flex items-center gap-6">
          <button className="text-zinc-400 hover:text-white transition"><SkipBack size={20} /></button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-lg"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
          <button className="text-zinc-400 hover:text-white transition"><SkipForward size={20} /></button>
        </div>

        <div className="w-full flex items-center gap-3 text-xs text-zinc-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Actions */}
      <div className="flex items-center gap-4 w-1/4 justify-end">
        <div className="flex items-center gap-2 group">
            <Volume2 size={18} className="text-zinc-400" />
            <input
                type="range"
                min="0" max="1" step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            />
        </div>
        <a
            href={track.audio_url}
            download
            className="p-2 text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-full transition"
            title="Download"
        >
            <Download size={18} />
        </a>
      </div>
    </div>
  );
};

export default AudioPlayer;
