import { useState, useRef } from 'react';
import { X, Check, Loader2, Image as ImageIcon } from 'lucide-react';

interface ProjectFormProps {
  onSubmit: (data: any, file?: File) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: any;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, onCancel, isSubmitting, initialData }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    tags: initialData?.tags?.join(', ') || '',
    demo_url: initialData?.demo_url || '',
    github_url: initialData?.github_url || '',
    order: initialData?.order || 0,
    featured: initialData?.featured !== undefined ? initialData.featured : true
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialData?.thumbnail || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !initialData) return;
    
    const tagsArray = formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    onSubmit({ ...formData, tags: tagsArray }, file || undefined);
  };

  return (
    <div className="bg-slate-900/80 border border-purple-500/10 backdrop-blur-2xl rounded-xl p-8 max-w-4xl w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold uppercase tracking-[0.3em] text-cyan-400">
          {initialData ? 'Update Project Unit' : 'Initialize New Project'}
        </h2>
        <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors" title="Close Form">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Media */}
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-video rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group ${
              preview ? 'border-cyan-500/50' : 'border-white/10 hover:border-cyan-500/30 bg-white/5'
            }`}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs uppercase font-bold text-cyan-400">Replace Image</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon size={32} className="text-white/20 group-hover:text-cyan-500/50 transition-colors" />
                <span className="text-[10px] uppercase font-bold text-white/30">Upload Thumbnail</span>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2">Display Order</label>
              <input
                type="number"
                title="Display Order"
                placeholder="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                title="Featured Status"
                placeholder="Featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 bg-black border-white/20 rounded accent-cyan-500"
              />
              <label htmlFor="featured" className="text-xs text-white/60 uppercase tracking-widest">Featured Project</label>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2">Project Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              placeholder="e.g. JARVIS_CORE"
            />
          </div>

          <div>
            <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
              placeholder="System specifications..."
            />
          </div>

          <div>
            <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2">Tags (Comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              placeholder="React, AI, Docker"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2">Demo URL</label>
              <input
                type="url"
                value={formData.demo_url}
                onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2">Github URL</label>
              <input
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                placeholder="https://github..."
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end gap-4 mt-4 pt-6 border-t border-white/5">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            Abort
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !file}
            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-white/20 text-white rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
            Commit Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
