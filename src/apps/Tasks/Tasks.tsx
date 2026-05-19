import React, { useState, useEffect, useRef } from 'react';
import { useTasksStore, TaskDocument } from '@/stores/tasksStore';
import { useAuthStore } from '@/stores/authStore';
import './Tasks.css';

interface TasksProps {
  window: {
    id: string;
    params?: {
      taskId?: string;
    };
  };
}

export default function Tasks({ window: win }: TasksProps) {
  const { user } = useAuthStore();
  const { tasks, isLoading, loadTasks, createTask, updateTask, deleteTask } = useTasksStore();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Rychlé přidání úkolu
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  // Vybraný úkol pro editaci
  const [selectedTask, setSelectedTask] = useState<TaskDocument | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editStatus, setEditStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
  const [editDueDate, setEditDueDate] = useState('');
  const [editTags, setEditTags] = useState('');

  // Zvýraznění úkolu z parametrů
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (user) {
      loadTasks(user.$id);
    }
  }, [user]);

  // Sledování změn v parametrech okna (deep linking)
  useEffect(() => {
    if (win.params?.taskId) {
      const taskId = win.params.taskId;
      setHighlightedTaskId(taskId);
      
      // Pokusíme se otevřít editaci ihned
      const task = tasks.find((t) => t.$id === taskId);
      if (task) {
        handleOpenEdit(task);
      }

      // Po 3 sekundách odstraníme zvýraznění
      const timer = setTimeout(() => {
        setHighlightedTaskId(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [win.params, tasks]);

  // Odrolování k zvýrazněnému úkolu
  useEffect(() => {
    if (highlightedTaskId && taskRefs.current[highlightedTaskId]) {
      taskRefs.current[highlightedTaskId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedTaskId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;

    await createTask(user.$id, newTitle.trim(), '', newPriority, newDueDate);
    setNewTitle('');
    setNewDueDate('');
    setNewPriority('medium');
  };

  const handleOpenEdit = (task: TaskDocument) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setEditDueDate(task.dueDate || '');
    setEditTags(task.tags ? task.tags.join(', ') : '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    const tagsArray = editTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await updateTask(selectedTask.$id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
      status: editStatus,
      dueDate: editDueDate || undefined,
      tags: tagsArray
    });

    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Opravdu chcete tento úkol smazat?')) {
      await deleteTask(taskId);
      setIsEditModalOpen(false);
      setSelectedTask(null);
    }
  };

  // Nativní Drag & Drop Handlery
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Přidáme lehké vizuální zpoždění pro lepší feedback při uchopení
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.classList.add('dragging-card');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('dragging-card');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.currentTarget as HTMLElement;
    target.classList.add('drag-over-column');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('drag-over-column');
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskDocument['status']) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('drag-over-column');

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find((t) => t.$id === taskId);
    if (task && task.status !== targetStatus) {
      await updateTask(taskId, { status: targetStatus });
    }
  };

  // Filtrování úkolů
  const filteredTasks = tasks.filter((task) => {
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  const getTasksByStatus = (status: TaskDocument['status']) => {
    return filteredTasks.filter((t) => t.status === status);
  };

  const getPriorityLabel = (priority: TaskDocument['priority']) => {
    switch (priority) {
      case 'high': return 'Vysoká';
      case 'medium': return 'Střední';
      case 'low': return 'Nízká';
    }
  };

  const getStatusLabel = (status: TaskDocument['status']) => {
    switch (status) {
      case 'todo': return 'K rozpracování';
      case 'in_progress': return 'Probíhá';
      case 'done': return 'Hotovo';
    }
  };

  return (
    <div className="tasks-app">
      {/* Horní panel filtrů a navigace */}
      <header className="tasks-header">
        <div className="header-left">
          <span className="tasks-main-icon">✅</span>
          <div className="view-toggle-group">
            <button
              onClick={() => setViewMode('kanban')}
              className={`btn-toggle ${viewMode === 'kanban' ? 'active' : ''}`}
            >
              📋 Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn-toggle ${viewMode === 'list' ? 'active' : ''}`}
            >
              📄 Seznam
            </button>
          </div>

          <div className="filter-select-wrapper">
            <label htmlFor="priority-filter">Priorita:</label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="tasks-select"
            >
              <option value="all">Všechny priority</option>
              <option value="high">🔴 Vysoká</option>
              <option value="medium">🟡 Střední</option>
              <option value="low">🔵 Nízká</option>
            </select>
          </div>
        </div>

        {/* Formulář pro rychlé přidání */}
        <form onSubmit={handleCreateTask} className="quick-add-form">
          <input
            type="text"
            required
            placeholder="Přidat nový úkol..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="task-input-title"
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as any)}
            className="task-input-priority"
          >
            <option value="low">🔵 Nízká</option>
            <option value="medium">🟡 Střední</option>
            <option value="high">🔴 Vysoká</option>
          </select>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="task-input-date"
            title="Termín splnění"
          />
          <button type="submit" className="btn-add-task">
            ＋ Přidat
          </button>
        </form>
      </header>

      {/* Hlavní plocha */}
      <main className="tasks-content">
        {isLoading ? (
          <div className="tasks-loading">Načítání úkolů...</div>
        ) : tasks.length === 0 ? (
          <div className="tasks-empty-state">
            <div className="empty-graphic">✨</div>
            <h3>Skvělá práce! Nemáte žádné úkoly</h3>
            <p>Vytvořte si nový úkol pomocí horního panelu k rozplánování vašich projektů.</p>
          </div>
        ) : viewMode === 'kanban' ? (
          /* Kanban Board */
          <div className="kanban-board">
            {(['todo', 'in_progress', 'done'] as const).map((status) => {
              const columnTasks = getTasksByStatus(status);
              return (
                <div
                  key={status}
                  className={`kanban-column column-${status}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className="column-header">
                    <h4>{getStatusLabel(status)}</h4>
                    <span className="column-count">{columnTasks.length}</span>
                  </div>

                  <div className="column-cards-wrapper">
                    {columnTasks.map((task) => {
                      const isHighlighted = highlightedTaskId === task.$id;
                      return (
                        <div
                          key={task.$id}
                          ref={(el) => { taskRefs.current[task.$id] = el; }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.$id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleOpenEdit(task)}
                          className={`task-card priority-${task.priority} ${isHighlighted ? 'highlighted-glow' : ''}`}
                        >
                          <div className="card-top">
                            <span className={`badge-priority ${task.priority}`}>
                              {getPriorityLabel(task.priority)}
                            </span>
                            {task.dueDate && (
                              <span className="card-due-date">
                                📅 {new Date(task.dueDate).toLocaleDateString('cs-CZ')}
                              </span>
                            )}
                          </div>
                          
                          <h5 className="card-title">{task.title}</h5>
                          {task.description && (
                            <p className="card-desc">{task.description}</p>
                          )}

                          {task.tags && task.tags.length > 0 && (
                            <div className="card-tags">
                              {task.tags.map((tag) => (
                                <span key={tag} className="tag-badge">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {columnTasks.length === 0 && (
                      <div className="column-empty-hint">
                        Přetáhněte sem úkol
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Seznam - List View Table */
          <div className="list-view-container">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Stav</th>
                  <th>Název úkolu</th>
                  <th style={{ width: '150px' }}>Priorita</th>
                  <th style={{ width: '150px' }}>Termín</th>
                  <th>Štítky</th>
                  <th style={{ width: '100px' }}>Akce</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const isHighlighted = highlightedTaskId === task.$id;
                  const isDone = task.status === 'done';
                  return (
                    <tr
                      key={task.$id}
                      onClick={() => handleOpenEdit(task)}
                      className={`task-row ${isHighlighted ? 'row-highlighted' : ''} ${isDone ? 'row-done' : ''}`}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={async () => {
                            const nextStatus = isDone ? 'todo' : 'done';
                            await updateTask(task.$id, { status: nextStatus as any });
                          }}
                          className="task-checkbox"
                        />
                      </td>
                      <td className="task-row-title">
                        <span className="task-title-text">{task.title}</span>
                        {task.description && (
                          <span className="task-title-sub" title={task.description}>
                            {task.description.substring(0, 80)}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge-priority ${task.priority}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </td>
                      <td>
                        {task.dueDate ? (
                          <span className="task-row-due">
                            📅 {new Date(task.dueDate).toLocaleDateString('cs-CZ')}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <div className="table-tags">
                          {task.tags && task.tags.map((t) => (
                            <span key={t} className="tag-badge">#{t}</span>
                          ))}
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="btn-table-edit"
                        >
                          Upravit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modální okno pro detail a úpravu úkolu */}
      {isEditModalOpen && selectedTask && (
        <div className="tasks-modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="tasks-modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="tasks-modal-header">
              <h3>Upravit úkol</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="btn-modal-close">×</button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="tasks-modal-form">
              <div className="form-group">
                <label>Název úkolu</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label>Popis úkolu</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="modal-textarea"
                  placeholder="Detailnější popis..."
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Stav</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="modal-select"
                  >
                    <option value="todo">K rozpracování</option>
                    <option value="in_progress">Probíhá</option>
                    <option value="done">Hotovo</option>
                  </select>
                </div>

                <div className="form-group half">
                  <label>Priorita</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="modal-select"
                  >
                    <option value="low">🔵 Nízká</option>
                    <option value="medium">🟡 Střední</option>
                    <option value="high">🔴 Vysoká</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Termín splnění</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="form-group half">
                  <label>Štítky (oddělené čárkou)</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="modal-input"
                    placeholder="projekty, bug, design"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(selectedTask.$id)}
                  className="btn-modal-delete"
                >
                  🗑️ Smazat úkol
                </button>
                
                <div className="modal-actions-right">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="btn-modal-cancel"
                  >
                    Zrušit
                  </button>
                  <button type="submit" className="btn-modal-submit">
                    Uložit změny
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
