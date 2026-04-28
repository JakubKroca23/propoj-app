import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '@/hooks/useProjects';
import type { Project } from '@/hooks/useProjects';
import { Plus, Trash2, Edit2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import ProjectForm from './ProjectForm';
import type { ToastType } from './HudToast';

interface ProjectManagerProps {
  onToast?: (message: string, type: ToastType) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ onToast }) => {
  const { projects, loading, error, addProject, updateProject, deleteProject } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any, file?: File) => {
    setIsSubmitting(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.$id, data, file);
        onToast?.('Project unit updated successfully.', 'success');
      } else if (file) {
        await addProject(data, file);
        onToast?.('New project unit initialized.', 'success');
      }
      setShowForm(false);
      setEditingProject(null);
    } catch (err: any) {
      console.error(err);
      onToast?.(err.message || 'Failed to save project', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Are you sure you want to terminate ${project.title}?`)) return;
    try {
      await deleteProject(project.$id, (project as any).thumbnail_id || project.thumbnail);
      onToast?.('Project unit terminated.', 'warning');
    } catch (err: any) {
      console.error(err);
      onToast?.(err.message || 'Failed to delete project', 'error');
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-[0.3em] text-white">Project Manager</h1>
          <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Direct Database Interface</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          <Plus size={16} />
          Initialize New Unit
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Projects Table */}
      <div className="bg-slate-900/30 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40">Unit</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40">Status</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40">Configuration</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40">Priority</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {projects.map((project) => (
              <motion.tr 
                key={project.$id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-slate-800 border border-white/10 overflow-hidden flex-shrink-0">
                      <img src={project.thumbnail} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{project.title}</div>
                      <div className="text-[10px] text-white/30 truncate max-w-[200px]">{project.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                    project.featured ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-white/5 text-white/30 border border-white/10'
                  }`}>
                    {project.featured ? 'Featured' : 'Standard'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 text-white/40">
                    {project.demo_url && <ExternalLink size={14} className="hover:text-cyan-400 cursor-help" />}
                    <span className="text-[10px]">{project.tags.slice(0, 2).join(', ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-cyan-500/50">
                  #{project.order}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(project)}
                      className="p-2 text-white/20 hover:text-purple-400 transition-colors" 
                      title="Edit Unit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(project)}
                      className="p-2 text-white/20 hover:text-red-400 transition-colors"
                      title="Terminate Unit"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {projects.length === 0 && (
          <div className="p-12 text-center text-white/20 uppercase text-xs tracking-widest">
            No units initialized in database
          </div>
        )}
      </div>

      {/* Modal Form Overlay */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={handleCancel}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative z-10 w-full flex justify-center"
            >
              <ProjectForm 
                onSubmit={handleSubmit} 
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                initialData={editingProject}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectManager;
