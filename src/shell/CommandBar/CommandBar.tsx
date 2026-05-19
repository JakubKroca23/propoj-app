import React, { useState, useEffect, useRef } from 'react';
import { APPS } from '@/data/apps';
import { useWindowStore } from '@/stores/windowStore';
import { useBentoStore } from '@/stores/bentoStore';
import { useAuthStore } from '@/stores/authStore';
import { databases, storage } from '@/lib/appwrite';
import {
  DATABASE_ID,
  COLLECTION_NOTES,
  COLLECTION_TASKS,
  COLLECTION_EVENTS,
  BUCKET_FILES
} from '@/lib/dbSetup';
import './CommandBar.css';

interface CommandBarProps {
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  type: 'app' | 'note' | 'task' | 'event' | 'file';
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  original: any;
}

type SearchCategory = 'all' | 'apps' | 'notes' | 'tasks' | 'calendar' | 'files';

export default function CommandBar({ onClose }: CommandBarProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notes, setNotes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(true);

  const windowStore = useWindowStore();
  const bentoStore = useBentoStore();
  const authStore = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Načtení dat z Appwrite při otevření Command Baru
  useEffect(() => {
    let isMounted = true;
    const fetchAllSources = async () => {
      if (!authStore.user) {
        setIsDbLoading(false);
        return;
      }
      
      setIsDbLoading(true);
      try {
        // Souběžné stahování ze všech 4 zdrojů, bezpečně izolované v try/catch
        const [notesRes, tasksRes, eventsRes, filesRes] = await Promise.allSettled([
          databases.listDocuments(DATABASE_ID, COLLECTION_NOTES),
          databases.listDocuments(DATABASE_ID, COLLECTION_TASKS),
          databases.listDocuments(DATABASE_ID, COLLECTION_EVENTS),
          storage.listFiles(BUCKET_FILES)
        ]);

        if (!isMounted) return;

        if (notesRes.status === 'fulfilled') {
          setNotes(notesRes.value.documents);
        } else {
          console.warn('[Search] Selhalo stažení poznámek:', notesRes.reason);
        }

        if (tasksRes.status === 'fulfilled') {
          setTasks(tasksRes.value.documents);
        } else {
          console.warn('[Search] Selhalo stažení úkolů:', tasksRes.reason);
        }

        if (eventsRes.status === 'fulfilled') {
          setEvents(eventsRes.value.documents);
        } else {
          console.warn('[Search] Selhalo stažení událostí:', eventsRes.reason);
        }

        if (filesRes.status === 'fulfilled') {
          // Appwrite Storage vrací { total: number, files: File[] }
          setFiles((filesRes.value as any).files || []);
        } else {
          console.warn('[Search] Selhalo stažení souborů:', filesRes.reason);
        }
      } catch (err) {
        console.error('[Search] Neočekávaná chyba při načítání vyhledávání:', err);
      } finally {
        if (isMounted) {
          setIsDbLoading(false);
        }
      }
    };

    fetchAllSources();
    return () => {
      isMounted = false;
    };
  }, [authStore.user]);

  // Sledování prefixů v textovém poli (/n, /t, /f, /c, /a)
  useEffect(() => {
    const match = query.match(/^\/([n|t|c|f|a])\s*(.*)/i);
    if (match) {
      const char = match[1].toLowerCase();
      const cats: Record<string, SearchCategory> = {
        n: 'notes',
        t: 'tasks',
        c: 'calendar',
        f: 'files',
        a: 'apps'
      };
      if (cats[char] !== category) {
        setCategory(cats[char]);
      }
    }
  }, [query, category]);

  // Vyčištění vyhledávacího klíče od prefixu pro samotné filtrování
  const getSearchTerm = () => {
    const match = query.match(/^\/[n|t|c|f|a]\s*(.*)/i);
    return match ? match[1].trim() : query.trim();
  };

  const searchTerm = getSearchTerm();

  // 1. Filtrování aplikací a pluginů (z bentoStore)
  const tiles = bentoStore.tiles.length > 0 ? bentoStore.tiles : APPS.map(app => ({
    id: app.id,
    name: app.name,
    icon: app.icon,
    description: app.description,
    color: app.color,
    size: app.size,
    enabled: true,
    isPlugin: false
  }));

  const matchedApps = tiles.filter(tile =>
    tile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tile.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).map(tile => ({
    id: `app-${tile.id}`,
    type: 'app' as const,
    title: tile.name,
    subtitle: tile.description || 'Aplikace',
    icon: tile.icon,
    color: tile.color,
    original: tile
  }));

  // 2. Filtrování poznámek
  const matchedNotes = notes.filter(note =>
    (note.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).map(note => ({
    id: `note-${note.$id}`,
    type: 'note' as const,
    title: note.title || 'Bez názvu',
    subtitle: note.content ? note.content.substring(0, 70).replace(/<[^>]*>/g, '') : 'Žádný obsah poznámky',
    icon: '📝',
    color: '#6C47FF',
    original: note
  }));

  // 3. Filtrování úkolů
  const matchedTasks = tasks.filter(task =>
    (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).map(task => {
    const statusText = task.status === 'done' ? 'Hotovo' : task.status === 'in_progress' ? 'Probíhá' : 'K rozpracování';
    const priorityText = task.priority === 'high' ? 'Vysoká' : task.priority === 'medium' ? 'Střední' : 'Nízká';
    return {
      id: `task-${task.$id}`,
      type: 'task' as const,
      title: task.title || 'Bez názvu úkolu',
      subtitle: `Stav: ${statusText} • Priorita: ${priorityText}`,
      icon: '✅',
      color: '#3B82F6',
      original: task
    };
  });

  // 4. Filtrování událostí v kalendáři
  const matchedEvents = events.filter(event =>
    (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).map(event => {
    const dateStr = event.startDate ? new Date(event.startDate).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Bez data';
    return {
      id: `event-${event.$id}`,
      type: 'event' as const,
      title: event.title || 'Bez názvu události',
      subtitle: `${dateStr} • ${event.description || 'Bez popisu'}`,
      icon: '📅',
      color: '#22C55E',
      original: event
    };
  });

  // 5. Filtrování souborů
  const matchedFiles = files.filter(file =>
    (file.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).map(file => {
    const sizeInMB = ((file.sizeOriginal || file.size || 0) / 1024 / 1024).toFixed(2);
    let icon = '📄';
    let color = '#F59E0B';
    if (file.name.toLowerCase().endsWith('.pdf')) {
      icon = '📕';
      color = '#EF4444';
    } else if (file.mimeType?.startsWith('image/')) {
      icon = '🖼️';
      color = '#10B981';
    } else if (file.mimeType?.startsWith('video/')) {
      icon = '🎥';
      color = '#3B82F6';
    }
    return {
      id: `file-${file.$id}`,
      type: 'file' as const,
      title: file.name,
      subtitle: `${sizeInMB} MB • ${file.mimeType || 'Soubor'}`,
      icon,
      color,
      original: file
    };
  });

  // Sestavení finálních výsledků dle zvoleného filtru
  let results: SearchResultItem[] = [];

  if (category === 'all') {
    // V zobrazení Všude limitujeme každou sekci na max 4 položky pro přehlednost
    // Pokud je vyhledávací pole prázdné, primárně zobrazujeme aplikace
    if (!searchTerm) {
      results = matchedApps;
    } else {
      results = [
        ...matchedApps.slice(0, 4),
        ...matchedNotes.slice(0, 4),
        ...matchedTasks.slice(0, 4),
        ...matchedEvents.slice(0, 4),
        ...matchedFiles.slice(0, 4)
      ];
    }
  } else if (category === 'apps') {
    results = matchedApps;
  } else if (category === 'notes') {
    results = matchedNotes;
  } else if (category === 'tasks') {
    results = matchedTasks;
  } else if (category === 'calendar') {
    results = matchedEvents;
  } else if (category === 'files') {
    results = matchedFiles;
  }

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, category]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    if (item.type === 'app') {
      windowStore.openWindow(item.original);
    } else if (item.type === 'note') {
      const notesApp = APPS.find(a => a.id === 'notes');
      if (notesApp) {
        windowStore.openWindow(notesApp, { noteId: item.original.$id });
      }
    } else if (item.type === 'task') {
      const tasksApp = APPS.find(a => a.id === 'tasks');
      if (tasksApp) {
        windowStore.openWindow(tasksApp, { taskId: item.original.$id });
      }
    } else if (item.type === 'event') {
      const calendarApp = APPS.find(a => a.id === 'calendar');
      if (calendarApp) {
        windowStore.openWindow(calendarApp, { eventId: item.original.$id });
      }
    } else if (item.type === 'file') {
      if (item.original.name.toLowerCase().endsWith('.pdf')) {
        const pdfApp = APPS.find(a => a.id === 'pdf-viewer');
        if (pdfApp) {
          const fileUrl = storage.getFileView(BUCKET_FILES, item.original.$id).toString();
          windowStore.openWindow(pdfApp, { fileUrl, fileName: item.original.name });
        }
      } else {
        const filesApp = APPS.find(a => a.id === 'files');
        if (filesApp) {
          windowStore.openWindow(filesApp, { fileId: item.original.$id });
        }
      }
    }
    onClose();
  };

  // Zpracování klávesových zkratek a navigace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Tab') {
        // Přepínání kategorií pomocí Tab / Shift+Tab
        e.preventDefault();
        const cats: SearchCategory[] = ['all', 'apps', 'notes', 'tasks', 'calendar', 'files'];
        const currentIndex = cats.indexOf(category);
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + cats.length) % cats.length
          : (currentIndex + 1) % cats.length;
        
        // Změníme i text v inputu, pokud tam byl prefix
        const cleanQuery = getSearchTerm();
        const prefixes = {
          all: '',
          apps: '/a ',
          notes: '/n ',
          tasks: '/t ',
          calendar: '/c ',
          files: '/f '
        };
        setCategory(cats[nextIndex]);
        setQuery(`${prefixes[cats[nextIndex]]}${cleanQuery}`);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results.length > 0) {
          handleSelectResult(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, category, query, onClose]);

  useEffect(() => {
    if (resultsRef.current) {
      // Protože rendering obsahuje i hlavičky skupin, vyhledáme aktivní element podle třídy
      const activeEl = resultsRef.current.querySelector('.command-bar-result-item.active') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Kliknutí na chip visual selectoru
  const handleChipClick = (cat: SearchCategory) => {
    const cleanQuery = getSearchTerm();
    const prefixes = {
      all: '',
      apps: '/a ',
      notes: '/n ',
      tasks: '/t ',
      calendar: '/c ',
      files: '/f '
    };
    setCategory(cat);
    setQuery(`${prefixes[cat]}${cleanQuery}`);
    inputRef.current?.focus();
  };

  let lastType = '';
  const typeHeaders = {
    app: '📱 Aplikace',
    note: '📝 Poznámky',
    task: '✅ Úkoly',
    event: '📅 Kalendář',
    file: '📁 Soubory'
  };

  return (
    <div className="command-bar-overlay" onClick={handleOverlayClick}>
      <div className="command-bar-container animate-slide-down">
        <div className="command-bar-input-wrapper">
          <span className="command-bar-search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="command-bar-input"
            placeholder="Hledat všude... (např. /n poznámky, /t úkoly)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="command-bar-esc-hint">ESC</span>
        </div>

        <div className="command-bar-chips-container">
          <button
            className={`command-bar-chip ${category === 'all' ? 'active' : ''}`}
            onClick={() => handleChipClick('all')}
          >
            🌐 Všude
          </button>
          <button
            className={`command-bar-chip ${category === 'apps' ? 'active' : ''}`}
            onClick={() => handleChipClick('apps')}
          >
            📱 Aplikace
          </button>
          <button
            className={`command-bar-chip ${category === 'notes' ? 'active' : ''}`}
            onClick={() => handleChipClick('notes')}
          >
            📝 Poznámky
          </button>
          <button
            className={`command-bar-chip ${category === 'tasks' ? 'active' : ''}`}
            onClick={() => handleChipClick('tasks')}
          >
            ✅ Úkoly
          </button>
          <button
            className={`command-bar-chip ${category === 'calendar' ? 'active' : ''}`}
            onClick={() => handleChipClick('calendar')}
          >
            📅 Kalendář
          </button>
          <button
            className={`command-bar-chip ${category === 'files' ? 'active' : ''}`}
            onClick={() => handleChipClick('files')}
          >
            📁 Soubory
          </button>
        </div>

        {isDbLoading ? (
          <div className="command-bar-loading">
            <span className="command-bar-loading-spinner">⏳</span>
            <span>Načítám datové zdroje Appwrite...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="command-bar-results" ref={resultsRef}>
            {results.map((item, index) => {
              const isActive = index === selectedIndex;
              const showHeader = category === 'all' && item.type !== lastType;
              lastType = item.type;

              return (
                <React.Fragment key={item.id}>
                  {showHeader && (
                    <div className="command-bar-group-header">
                      {typeHeaders[item.type]}
                    </div>
                  )}
                  <div
                    className={`command-bar-result-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div
                      className="command-bar-item-icon-wrapper"
                      style={{
                        background: `linear-gradient(135deg, ${item.color}22, ${item.color}44)`,
                        border: `1px solid ${item.color}33`,
                      }}
                    >
                      <span className="command-bar-item-icon">{item.icon}</span>
                    </div>
                    <div className="command-bar-item-details">
                      <span className="command-bar-item-name">{item.title}</span>
                      <span className="command-bar-item-desc">{item.subtitle}</span>
                    </div>
                    <div className="command-bar-item-action">
                      {isActive && (
                        <span className="command-bar-item-enter-hint">
                          {item.type === 'file' && item.original.name.toLowerCase().endsWith('.pdf')
                            ? 'prohlížet 📕'
                            : item.type === 'app'
                            ? 'spustit ↩'
                            : 'otevřít ↩'}
                        </span>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="command-bar-no-results">
            <span className="command-bar-no-results-icon">🤷</span>
            <span className="command-bar-no-results-text">
              Nebyly nalezeny žádné výsledky pro "{searchTerm}"
            </span>
          </div>
        )}

        <div className="command-bar-footer">
          <span className="command-bar-footer-item">
            <kbd>Tab</kbd> filtry
          </span>
          <span className="command-bar-footer-item">
            <kbd>↑↓</kbd> navigace
          </span>
          <span className="command-bar-footer-item">
            <kbd>↵</kbd> otevřít
          </span>
          <span className="command-bar-footer-item">
            <kbd>esc</kbd> zavřít
          </span>
        </div>
      </div>
    </div>
  );
}
