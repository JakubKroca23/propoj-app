import React, { useEffect } from 'react';
import BentoLauncher from './BentoLauncher';
import DesktopWidget from './DesktopWidget';
import WindowManager from '../WindowManager/WindowManager';
import { useTasksStore } from '@/stores/tasksStore';
import { useCalendarStore } from '@/stores/calendarStore';
import { useNotesStore } from '@/stores/notesStore';
import { useAuthStore } from '@/stores/authStore';
import { useWindowStore } from '@/stores/windowStore';
import { APPS } from '@/data/apps';
import './Desktop.css';

export default function Desktop() {
  const { user } = useAuthStore();
  const { tasks, loadTasks, toggleTaskStatus } = useTasksStore();
  const { events, loadEvents } = useCalendarStore();
  const { loadNotes } = useNotesStore();
  const windowStore = useWindowStore();

  // Automatické načítání dat pro všechny core widgety a aplikace po přihlášení
  useEffect(() => {
    if (user?.$id) {
      loadTasks(user.$id);
      loadEvents(user.$id);
      loadNotes(user.$id);
    }
  }, [user?.$id, loadTasks, loadEvents, loadNotes]);

  // Filtrujeme prioritní úkoly (aktivní, neseřazené nebo seřazené podle priority)
  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const completedTasksCount = tasks.filter((t) => t.status === 'done').length;

  // Seřadíme události kalendáře od nejbližších dnešních
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="os-desktop">
      <div className="desktop-header">
        <div className="desktop-header-content">
          <h1 className="desktop-title">Canvas OS</h1>
          <p className="desktop-subtitle">Vítejte ve svém osobním workspace. Vyberte aplikaci z Bento Launcheru níže.</p>
        </div>
        <div className="desktop-status-pill">
          <span className="status-indicator"></span>
          <span className="status-text">Všechny systémy online</span>
        </div>
      </div>

      {/* Hlavní Bento Grid Launcher plocha */}
      <BentoLauncher />

      {/* Rychlé Widgets panel */}
      <div className="desktop-widgets-row">
        {/* Počasí Widget */}
        <DesktopWidget title="Počasí" icon="🌤">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>21°C</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Polojasno</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                <div>📍 Praha</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Vlhkost: 58%</div>
              </div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '6px', 
              marginTop: '4px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: '8px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>St</span>
                <span style={{ fontSize: '1rem', margin: '2px 0' }}>🌦</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>18°</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>Čt</span>
                <span style={{ fontSize: '1rem', margin: '2px 0' }}>☀️</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>23°</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>Pá</span>
                <span style={{ fontSize: '1rem', margin: '2px 0' }}>🌤</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>22°</span>
              </div>
            </div>
          </div>
        </DesktopWidget>

        {/* Kalendář Widget */}
        <DesktopWidget title="Dnešní události" icon="📅">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            {sortedEvents.length > 0 ? (
              sortedEvents.slice(0, 2).map((event) => {
                const start = new Date(event.startDate);
                const end = new Date(event.endDate);
                const timeStr = event.allDay 
                  ? 'Celý den' 
                  : `${start.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}`;
                
                return (
                  <div 
                    key={event.$id}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      background: `linear-gradient(90deg, ${event.color}1a 0%, rgba(0,0,0,0) 100%)`,
                      borderLeft: `3px solid ${event.color || '#22C55E'}`,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease'
                    }}
                    onClick={() => {
                      const calendarApp = APPS.find(a => a.id === 'calendar');
                      if (calendarApp) {
                        windowStore.openWindow(calendarApp, { eventId: event.$id });
                      }
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>{event.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {timeStr} {event.description ? `| ${event.description}` : ''}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Žádné události na dnes
              </div>
            )}
          </div>
        </DesktopWidget>

        {/* Úkoly Widget */}
        <DesktopWidget title="Úkoly a prioritní cíle" icon="✅">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', fontSize: '0.78rem' }}>
            {activeTasks.length > 0 ? (
              activeTasks.slice(0, 3).map((task) => (
                <div 
                  key={task.$id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '4px 6px',
                    borderRadius: '6px',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}
                    onClick={() => {
                      const tasksApp = APPS.find(a => a.id === 'tasks');
                      if (tasksApp) {
                        windowStore.openWindow(tasksApp, { taskId: task.$id });
                      }
                    }}
                  >
                    <button 
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: task.status === 'done' ? '#22C55E' : 'rgba(255,255,255,0.25)',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Zabrání otevření okna aplikace
                        toggleTaskStatus(task.$id);
                      }}
                    >
                      ○
                    </button>
                    <span 
                      style={{ 
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {task.title}
                    </span>
                  </div>
                  <span 
                    style={{
                      fontSize: '0.62rem',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.15)' : task.priority === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: task.priority === 'high' ? '#EF4444' : task.priority === 'medium' ? '#F59E0B' : '#10B981',
                      fontWeight: 600
                    }}
                  >
                    {task.priority === 'high' ? 'vysoká' : task.priority === 'medium' ? 'střední' : 'nízká'}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                🎉 Všechny úkoly hotovy! ({completedTasksCount} splněno)
              </div>
            )}
          </div>
        </DesktopWidget>
      </div>

      <WindowManager />
    </div>
  );
}
