import React, { useEffect, useState } from 'react';
import BentoLauncher from './BentoLauncher';
import DesktopWidget from './DesktopWidget';
import WindowManager from '../WindowManager/WindowManager';
import { useTasksStore } from '@/stores/tasksStore';
import { useCalendarStore } from '@/stores/calendarStore';
import { useNotesStore } from '@/stores/notesStore';
import { useAuthStore } from '@/stores/authStore';
import { useWindowStore } from '@/stores/windowStore';
import { useFilesStore } from '@/stores/filesStore';
import { useFinanceStore } from '@/stores/financeStore';
import { useWeatherStore } from '@/stores/weatherStore';
import { APPS } from '@/data/apps';
import './Desktop.css';

export default function Desktop() {
  const { user } = useAuthStore();
  const { tasks, loadTasks, toggleTaskStatus } = useTasksStore();
  const { events, loadEvents } = useCalendarStore();
  const { loadNotes } = useNotesStore();
  const { files, loadFiles } = useFilesStore();
  const { transactions, loadTransactions } = useFinanceStore();
  const { weatherData, forecast: weatherForecast, cityName: weatherCity, detectLocationAndFetch: detectWeatherLocation } = useWeatherStore();
  const windowStore = useWindowStore();

  // State pro live Hodiny
  const [time, setTime] = useState(new Date());

  // Automatické načítání dat pro všechny core widgety a aplikace po přihlášení
  useEffect(() => {
    if (user?.$id) {
      loadTasks(user.$id);
      loadEvents(user.$id);
      loadNotes(user.$id);
      loadFiles();
      loadTransactions(user.$id);
      detectWeatherLocation();
    }
  }, [user?.$id, loadTasks, loadEvents, loadNotes, loadFiles, loadTransactions, detectWeatherLocation]);

  // Interval pro Hodiny (každou vteřinu)
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Formátování času a data pro Hodiny
  const timeString = time.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const rawDateString = time.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
  const dateString = rawDateString.charAt(0).toUpperCase() + rawDateString.slice(1);

  // Filtrujeme prioritní úkoly
  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const completedTasksCount = tasks.filter((t) => t.status === 'done').length;

  // Seřadíme události kalendáře od nejbližších dnešních
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Získání nedávných souborů (nejnovější 3 nahrané soubory)
  const recentFiles = [...files]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Pomocné funkce pro soubory
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mime: string, name: string) => {
    if (mime.startsWith('image/')) return '🖼️';
    if (mime.startsWith('video/')) return '🎥';
    if (mime === 'application/pdf' || name.endsWith('.pdf')) return '📕';
    if (mime.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.md')) return '📄';
    return '📦';
  };

  const handleFileClick = (file: any) => {
    if (file.mimeType === 'application/pdf' || file.name.endsWith('.pdf')) {
      const pdfApp = APPS.find((a) => a.id === 'pdf-viewer');
      if (pdfApp) {
        windowStore.openWindow(pdfApp, {
          fileUrl: file.url,
          fileName: file.name
        });
      }
    } else {
      window.open(file.url, '_blank');
    }
  };

  // Výpočet agregace financí pro aktuální měsíc (Budget Bar)
  const currentMonthString = new Date().toISOString().slice(0, 7);
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonthString));
  
  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = currentMonthIncome - currentMonthExpense;
  const spentPercent = currentMonthIncome > 0 ? Math.min((currentMonthExpense / currentMonthIncome) * 100, 100) : (currentMonthExpense > 0 ? 100 : 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(val);
  };

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
        {/* Hodiny Widget */}
        <DesktopWidget title="Čas a Datum" icon="🕰">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center', height: '100%' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1.1 }}>
              {timeString}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {dateString}
            </div>
          </div>
        </DesktopWidget>

        {/* Počasí Widget */}
        <DesktopWidget title="Počasí" icon="🌤">
          <div 
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', cursor: 'pointer' }}
            onClick={() => {
              const weatherApp = APPS.find(a => a.id === 'weather');
              if (weatherApp) windowStore.openWindow(weatherApp);
            }}
          >
            {weatherData ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px' }}>{weatherData.temp}°C</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>{weatherData.description}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>📍 {weatherCity.split(',')[0]}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Vítr: {weatherData.windSpeed} km/h</div>
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
                  {weatherForecast.slice(1, 4).map((day, idx) => {
                    const d = new Date(day.date);
                    const daysShort = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
                    const dayShortName = daysShort[d.getDay()];
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        <span>{dayShortName}</span>
                        <span style={{ fontSize: '1.1rem', margin: '2px 0' }} title={day.description}>{day.emoji}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{day.tempMax}°</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Načítání počasí...
              </div>
            )}
          </div>
        </DesktopWidget>

        {/* Finance Budget Widget */}
        <DesktopWidget title="Měsíční Budget" icon="💰">
          <div 
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', cursor: 'pointer' }}
            onClick={() => {
              const finApp = APPS.find(a => a.id === 'finance');
              if (finApp) windowStore.openWindow(finApp);
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Bilance: <strong style={{ color: netBalance >= 0 ? '#10b981' : '#f43f5e' }}>{formatCurrency(netBalance)}</strong></span>
              <span>Vyčerpáno: <strong>{spentPercent.toFixed(0)}%</strong></span>
            </div>
            
            {/* Progress bar s glassmorphic podkladem */}
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${spentPercent}%`, 
                  background: spentPercent > 90 ? 'var(--rose-accent, #f43f5e)' : spentPercent > 65 ? 'var(--amber-accent, #f59e0b)' : 'var(--emerald-accent, #10b981)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                  boxShadow: spentPercent > 90 ? '0 0 10px rgba(244,63,94,0.3)' : 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              <span>Příjmy: {formatCurrency(currentMonthIncome)}</span>
              <span>Výdaje: {formatCurrency(currentMonthExpense)}</span>
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

        {/* Nedávné Soubory Widget */}
        <DesktopWidget title="Nedávné soubory" icon="📁">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', fontSize: '0.78rem' }}>
            {recentFiles.length > 0 ? (
              recentFiles.map((file) => (
                <div 
                  key={file.$id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '6px 8px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleFileClick(file)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '1.1rem' }}>{getFileIcon(file.mimeType, file.name)}</span>
                    <span 
                      style={{ 
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={file.name}
                    >
                      {file.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginLeft: '8px', flexShrink: 0 }}>
                    {formatBytes(file.size)}
                  </span>
                </div>
              ))
            ) : (
              <div 
                style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={() => {
                  const filesApp = APPS.find(a => a.id === 'files');
                  if (filesApp) windowStore.openWindow(filesApp);
                }}
              >
                Žádné nahrané soubory. Kliknutím otevřete FileManager.
              </div>
            )}
          </div>
        </DesktopWidget>
      </div>

      <WindowManager />
    </div>
  );
}
