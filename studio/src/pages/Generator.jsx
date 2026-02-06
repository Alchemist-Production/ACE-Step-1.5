import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Wand2, RefreshCw, Zap, Sliders, Music, Mic2, Play, Download, ChevronDown, ChevronUp } from 'lucide-react';
import InfoTooltip from '../components/InfoTooltip';

const Generator = ({ onPlay }) => {
  const [formData, setFormData] = useState({
    prompt: '',
    lyrics: '',
    model: '',
    duration: 10,
    batch_size: 2,
    inference_steps: 50,
    guidance_scale: 7.0,
    seed: -1,
    task_type: 'text2music',
    use_random_seed: true,
    thinking: false,
    lm_temperature: 0.85,
    lm_cfg_scale: 2.0,
    lm_negative_prompt: 'NO USER INPUT'
  });

  const [models, setModels] = useState([]);
  const [loras, setLoras] = useState([]);
  const [selectedLora, setSelectedLora] = useState('');
  const [loraScale, setLoraScale] = useState(1.0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState([]);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Fetch models on load
    api.getModels().then(res => {
        if(res.data?.data?.models) {
            setModels(res.data.data.models);
            if(res.data.data.default_model) {
                setFormData(prev => ({...prev, model: res.data.data.default_model}));
            }
        }
    }).catch(console.error);

    // Fetch LoRAs
    api.getLoras().then(res => {
        if(res.data?.data) {
            setLoras(res.data.data);
        }
    }).catch(console.error);
  }, []);

  // Handle LoRA changes
  useEffect(() => {
    if (selectedLora) {
        api.loadLora(selectedLora).catch(console.error);
    } else {
        // Only unload if we previously had one selected?
        // For now, always unload if empty to be safe
        api.unloadLora().catch(console.error);
    }
  }, [selectedLora]);

  useEffect(() => {
    if (selectedLora) {
        api.setLoraScale(loraScale).catch(console.error);
    }
  }, [loraScale, selectedLora]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSurpriseMe = async () => {
      try {
          const res = await api.getRandomSample();
          if (res.data?.data) {
              const sample = res.data.data;
              setFormData(prev => ({
                  ...prev,
                  prompt: sample.description || sample.prompt || '',
                  lyrics: sample.lyrics || '',
                  duration: sample.duration || prev.duration,
                  task_type: 'text2music'
              }));
          }
      } catch (e) {
          console.error("Surprise me failed", e);
      }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setStatus('Initializing...');
    setGeneratedTracks([]);

    try {
        const res = await api.generateMusic(formData);
        if (res.data?.data?.task_id) {
            const taskId = res.data.data.task_id;
            setStatus('Generating... (this may take a while)');
            pollResult(taskId);
        } else {
            throw new Error("Failed to start generation");
        }
    } catch (e) {
        setError(e.response?.data?.detail || e.message);
        setIsGenerating(false);
    }
  };

  const pollResult = async (taskId) => {
      const interval = setInterval(async () => {
          try {
              const res = await api.queryResult([taskId]);
              const taskResult = res.data?.data?.[0];

              if (taskResult) {
                  if (taskResult.status === 1) { // Succeeded
                      clearInterval(interval);
                      setIsGenerating(false);
                      setStatus('Completed!');

                      try {
                        const resultData = JSON.parse(taskResult.result);
                        setGeneratedTracks(resultData);
                      } catch(e) { console.error("Parse error", e); }

                  } else if (taskResult.status === 2) { // Failed
                      clearInterval(interval);
                      setIsGenerating(false);
                      setError("Generation failed on server.");
                  }
                  // Status 0 is running/queued, continue polling
              }
          } catch (e) {
              console.error("Polling error", e);
              // Don't stop polling on transient network error, but maybe limit retries in real app
          }
      }, 2000);
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* Input Section */}
      <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-border custom-scrollbar">
        <div className="max-w-xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Wand2 className="text-primary" /> Generator
                </h2>
                <button
                    onClick={handleSurpriseMe}
                    className="text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-full transition flex items-center gap-2"
                >
                    <Zap size={14} className="text-yellow-400" /> Surprise Me
                </button>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Description</label>
                <textarea
                    name="prompt"
                    value={formData.prompt}
                    onChange={handleChange}
                    className="w-full h-32 bg-surface border border-border rounded-lg p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition"
                    placeholder="A cinematic orchestral track with epic drums..."
                />
            </div>

            {/* Lyrics */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <Mic2 size={16} /> Lyrics (Optional)
                </label>
                <textarea
                    name="lyrics"
                    value={formData.lyrics}
                    onChange={handleChange}
                    className="w-full h-32 bg-surface border border-border rounded-lg p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition font-mono text-sm"
                    placeholder="[Verse]..."
                />
            </div>

            {/* Core Settings Grid */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center">
                        <label className="text-sm font-medium text-zinc-400">Duration (s)</label>
                        <InfoTooltip label="Duration" description="Length of the generated audio in seconds." />
                    </div>
                    <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full bg-surface border border-border rounded-lg p-2.5 outline-none focus:border-primary transition"
                    />
                </div>
                <div className="space-y-2">
                     <div className="flex items-center">
                        <label className="text-sm font-medium text-zinc-400">Generations Count</label>
                        <InfoTooltip label="Generation Count" description="Number of tracks to generate in parallel (Batch Size)." />
                    </div>
                    <input
                        type="number"
                        name="batch_size"
                        value={formData.batch_size}
                        onChange={handleChange}
                        min="1" max="4"
                        className="w-full bg-surface border border-border rounded-lg p-2.5 outline-none focus:border-primary transition"
                    />
                </div>
                 <div className="space-y-2">
                    <div className="flex items-center">
                        <label className="text-sm font-medium text-zinc-400">Refinement</label>
                         <InfoTooltip label="Refinement (Steps)" description="Number of inference steps. Higher values take longer but can improve quality. (1-100)" />
                    </div>
                    <input
                        type="number"
                        name="inference_steps"
                        value={formData.inference_steps}
                        onChange={handleChange}
                        className="w-full bg-surface border border-border rounded-lg p-2.5 outline-none focus:border-primary transition"
                    />
                </div>
                 <div className="space-y-2">
                     <div className="flex items-center">
                        <label className="text-sm font-medium text-zinc-400">Creativity</label>
                        <InfoTooltip label="Creativity (Guidance Scale)" description="How strictly the model follows the prompt. Higher values = more strict/creative. (1.0 - 20.0)" />
                    </div>
                    <input
                        type="number"
                        name="guidance_scale"
                        value={formData.guidance_scale}
                        onChange={handleChange}
                        step="0.1"
                        className="w-full bg-surface border border-border rounded-lg p-2.5 outline-none focus:border-primary transition"
                    />
                </div>
            </div>

            {/* Model & LoRA */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center">
                         <label className="text-sm font-medium text-zinc-400">Model</label>
                         <InfoTooltip label="Model" description="Select the base model for generation." />
                    </div>
                     <select
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className="w-full bg-surface border border-border rounded-lg p-2.5 outline-none focus:border-primary transition appearance-none"
                     >
                         {models.map(m => (
                             <option key={m.name} value={m.name}>{m.name}</option>
                         ))}
                     </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                         <div className="flex items-center">
                             <label className="text-sm font-medium text-zinc-400">LoRA Adapter</label>
                             <InfoTooltip label="LoRA Adapter" description="Load a custom trained style adapter." />
                        </div>
                         <select
                            value={selectedLora}
                            onChange={(e) => setSelectedLora(e.target.value)}
                            className="w-full bg-surface border border-border rounded-lg p-2.5 outline-none focus:border-primary transition appearance-none"
                         >
                             <option value="">None</option>
                             {loras.map(l => (
                                 <option key={l.name} value={l.path}>{l.name}</option>
                             ))}
                         </select>
                    </div>
                    <div className="space-y-2">
                         <div className="flex items-center">
                            <label className="text-sm font-medium text-zinc-400">LoRA Strength</label>
                             <InfoTooltip label="LoRA Scale" description="Intensity of the LoRA effect. (0.0 - 1.0)" />
                        </div>
                        <input
                            type="range"
                            min="0" max="1" step="0.05"
                            value={loraScale}
                            onChange={(e) => setLoraScale(parseFloat(e.target.value))}
                            disabled={!selectedLora}
                            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary mt-3"
                        />
                         <div className="text-xs text-right text-zinc-500">{loraScale.toFixed(2)}</div>
                    </div>
                </div>
            </div>

             {/* Advanced Settings */}
             <div className="border border-border rounded-xl overflow-hidden bg-black/10">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full p-4 flex items-center justify-between text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 transition"
                >
                    <span className="flex items-center gap-2">
                        <Sliders size={16} /> Advanced Settings
                    </span>
                    {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showAdvanced && (
                    <div className="p-4 pt-0 space-y-4 border-t border-border/50 mt-2">
                         <div className="grid grid-cols-2 gap-6 pt-4">
                             <div className="space-y-2">
                                <div className="flex items-center">
                                    <label className="text-sm font-medium text-zinc-400">Variation ID</label>
                                     <InfoTooltip label="Variation ID (Seed)" description="Random seed. Set to -1 for random." />
                                </div>
                                <input
                                    type="number"
                                    name="seed"
                                    value={formData.seed}
                                    onChange={handleChange}
                                    className="w-full bg-surface border border-border rounded-lg p-2.5 outline-none focus:border-primary transition"
                                />
                            </div>
                             <div className="flex items-center justify-between p-2">
                                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                    Enable Thinking
                                     <InfoTooltip label="Thinking" description="Enable Chain-of-Thought reasoning for better adherence." />
                                </label>
                                <input
                                    type="checkbox"
                                    name="thinking"
                                    checked={formData.thinking}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-primary"
                                />
                             </div>
                         </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-zinc-400">Prompt Temperature</label>
                                     <InfoTooltip label="Temperature" description="Randomness for prompt enhancement. (0.1 - 1.0)" />
                                </div>
                                <input
                                    type="range"
                                    name="lm_temperature"
                                    min="0.1" max="1.5" step="0.05"
                                    value={formData.lm_temperature}
                                    onChange={(e) => setFormData({...formData, lm_temperature: parseFloat(e.target.value)})}
                                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="text-xs text-right text-zinc-500">{formData.lm_temperature}</div>
                            </div>
                             <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-zinc-400">Prompt CFG</label>
                                     <InfoTooltip label="LM CFG Scale" description="Classifier-Free Guidance for prompt enhancement." />
                                </div>
                                <input
                                    type="range"
                                    name="lm_cfg_scale"
                                    min="1.0" max="4.0" step="0.1"
                                    value={formData.lm_cfg_scale}
                                    onChange={(e) => setFormData({...formData, lm_cfg_scale: parseFloat(e.target.value)})}
                                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                 <div className="text-xs text-right text-zinc-500">{formData.lm_cfg_scale}</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <div className="flex items-center">
                                <label className="text-sm font-medium text-zinc-400">Negative Prompt</label>
                                <InfoTooltip label="Negative Prompt" description="Things to avoid in the generation." />
                             </div>
                            <textarea
                                name="lm_negative_prompt"
                                value={formData.lm_negative_prompt}
                                onChange={handleChange}
                                className="w-full h-20 bg-surface border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition text-sm"
                            />
                        </div>
                    </div>
                )}
             </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                {isGenerating ? (
                    <><RefreshCw className="animate-spin" /> Generating...</>
                ) : (
                    <><Music /> Generate Track</>
                )}
            </button>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

             {status && !error && (
                <div className="text-center text-sm text-zinc-500 animate-pulse">
                    {status}
                </div>
            )}
        </div>
      </div>

      {/* Results Section */}
      <div className="w-full md:w-1/2 bg-black/20 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-zinc-300">Results</h2>

        {generatedTracks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-xl">
                <Music size={48} className="mb-4 opacity-20" />
                <p>No tracks generated yet</p>
            </div>
        ) : (
            <div className="space-y-4">
                {generatedTracks.map((track, i) => (
                    <div key={i} className="bg-surface border border-border rounded-xl p-4 hover:border-primary/50 transition group">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                                #{i+1}
                            </span>
                            <span className="text-xs text-zinc-500">{new Date().toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-zinc-300 line-clamp-2 mb-4 italic">
                            {formData.prompt}
                        </p>
                        <div className="flex items-center gap-2">
                             <button
                                onClick={() => onPlay({
                                    ...track,
                                    caption: formData.prompt,
                                    audio_url: track.url // Ensure URL matches player expectation
                                })}
                                className="flex-1 bg-white text-black font-semibold py-2 rounded-lg hover:bg-zinc-200 transition flex items-center justify-center gap-2"
                            >
                                <Play size={16} fill="currentColor" /> Play
                             </button>
                             <a
                                href={track.url}
                                download
                                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition"
                            >
                                <Download size={20} />
                             </a>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Generator;
