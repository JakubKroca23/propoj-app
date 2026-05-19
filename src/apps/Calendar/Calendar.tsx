import React, { useState, useEffect } from 'react';
import { useCalendarStore, CalendarEventDocument } from '@/stores/calendarStore';
import { useAuthStore } from '@/stores/authStore';
import './Calendar.css';

interface CalendarProps {
  params?: {
    eventId?: string;
  };
}

const DAYS_OF_WEEK = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const MONTHS_CZ = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenc', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
];

const PRESETS_COLORS = ['#6C47FF', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6'];

export default function Calendar({ params }: CalendarProps) {
  const { user } = useAuthStore();
  const { events, isLoading, loadEvents, createEvent, updateEvent, deleteEvent } = useCalendarStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modální stavy
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventDocument | null>(null);
  
  // Stavy formuláře
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formAllDay, setFormAllDay] = useState(false);
  const [formColor, setFormColor] = useState('#6C47FF');

  // Načtení událostí na mount
  useEffect(() => {
    if (user?.$id && events.length === 0) {
      loadEvents(user.$id);
    }
  }, [user?.$id, loadEvents, events.length]);

  // Hluboké prolinkování z parametrů (např. z Bento widgetu nebo vyhledávání)
  useEffect(() => {
    if (params?.eventId) {
      const target = events.find((e) => e.$id === params.eventId);
      if (target) {
        const start = new Date(target.startDate);
        setCurrentDate(start);
        handleOpenEdit(target);
      }
    }
  }, [params?.eventId, events]);

  // Calendar Grid Výpočty
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const startDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate();

  const prevMonthDays = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push({
      day: prevMonthDaysCount - i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth - 1, prevMonthDaysCount - i)
    });
  }

  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(currentYear, currentMonth, i)
    });
  }

  const totalCells = 42; // 6 řádků
  const nextMonthDaysCount = totalCells - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = [];
  for (let i = 1; i <= nextMonthDaysCount; i++) {
    nextMonthDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth + 1, i)
    });
  }

  const allCells = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Navigace měsíců
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Správa otevírání modálů
  const handleOpenCreate = (date: Date) => {
    setSelectedEvent(null);
    setFormTitle('');
    setFormDescription('');
    
    // Nastavení výchozích dat s lokálním časem
    const startStr = new Date(date.setHours(9, 0, 0, 0)).toISOString().slice(0, 16);
    const endStr = new Date(date.setHours(10, 0, 0, 0)).toISOString().slice(0, 16);
    
    setFormStartDate(startStr);
    setFormEndDate(endStr);
    setFormAllDay(false);
    setFormColor('#6C47FF');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: CalendarEventDocument) => {
    setSelectedEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description);
    
    // Převod na lokální formát YYYY-MM-DDTHH:MM
    const startStr = new Date(event.startDate).toISOString().slice(0, 16);
    const endStr = new Date(event.endDate).toISOString().slice(0, 16);
    
    setFormStartDate(startStr);
    setFormEndDate(endStr);
    setFormAllDay(event.allDay);
    setFormColor(event.color || '#6C47FF');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.$id || !formTitle.trim()) return;

    const startISO = new Date(formStartDate).toISOString();
    const endISO = new Date(formEndDate).toISOString();

    if (selectedEvent) {
      // Úprava
      await updateEvent(selectedEvent.$id, {
        title: formTitle,
        description: formDescription,
        startDate: startISO,
        endDate: endISO,
        allDay: formAllDay,
        color: formColor
      });
    } else {
      // Nový
      await createEvent(
        user.$id,
        formTitle,
        formDescription,
        startISO,
        endISO,
        formAllDay,
        formColor
      );
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (confirm('Opravdu chcete tuto událost smazat?')) {
      await deleteEvent(selectedEvent.$id);
      setIsModalOpen(false);
    }
  };

  // Pomocná metoda pro získání událostí pro konkrétní buňku dne
  const getEventsForDay = (cellDate: Date) => {
    return events.filter((e) => {
      const start = new Date(e.startDate);
      return (
        start.getDate() === cellDate.getDate() &&
        start.getMonth() === cellDate.getMonth() &&
        start.getFullYear() === cellDate.getFullYear()
      );
    });
  };

  const isToday = (cellDate: Date) => {
    const today = new Date();
    return (
      cellDate.getDate() === today.getDate() &&
      cellDate.getMonth() === today.getMonth() &&
      cellDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="calendar-app">
      {/* Ovládací panel nahoře */}
      <header className="calendar-header">
        <div className="header-left">
          <button onClick={handleToday} className="calendar-btn-nav">Dnes</button>
          <div className="month-navigation">
            <button onClick={handlePrevMonth} className="calendar-btn-nav">◀</button>
            <span className="current-month-label">
              {MONTHS_CZ[currentMonth]} {currentYear}
            </span>
            <button onClick={handleNextMonth} className="calendar-btn-nav">▶</button>
          </div>
        </div>
        <div className="header-right">
          <button onClick={() => handleOpenCreate(new Date())} className="btn-add-event">
            + Nová událost
          </button>
        </div>
      </header>

      {/* Dny v týdnu */}
      <div className="weekdays-bar">
        {DAYS_OF_WEEK.map((d) => (
          <span key={d} className="weekday-label">{d}</span>
        ))}
      </div>

      {/* Grid kalendáře */}
      <main className="calendar-grid">
        {isLoading && events.length === 0 ? (
          <div className="calendar-loading-overlay">Načítání událostí...</div>
        ) : (
          allCells.map((cell, index) => {
            const dayEvents = getEventsForDay(cell.date);
            const todayClass = isToday(cell.date) ? 'today' : '';
            const activeMonthClass = cell.isCurrentMonth ? 'current-month' : 'other-month';

            return (
              <div
                key={index}
                className={`calendar-cell ${activeMonthClass} ${todayClass}`}
                onClick={() => handleOpenCreate(cell.date)}
              >
                <span className="cell-day-number">{cell.day}</span>
                <div className="cell-events-list">
                  {dayEvents.map((event) => (
                    <div
                      key={event.$id}
                      className="cell-event-badge"
                      style={{
                        background: `${event.color}1e`,
                        borderLeft: `2px solid ${event.color || '#6C47FF'}`,
                        color: event.color
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Zamezí spuštění handleOpenCreate
                        handleOpenEdit(event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Modální okno pro Přidání / Detail události */}
      {isModalOpen && (
        <div className="calendar-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="calendar-modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent ? 'Detail události' : 'Nová událost'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-modal-close">×</button>
            </div>
            
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Název události</label>
                <input
                  type="text"
                  required
                  placeholder="např. Schůzka s designéry"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label>Popis</label>
                <textarea
                  placeholder="např. Probrat novou barvu akcentu"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="modal-textarea"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Začátek</label>
                  <input
                    type="datetime-local"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="modal-input"
                  />
                </div>
                <div className="form-group">
                  <label>Konec</label>
                  <input
                    type="datetime-local"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-group-checkbox">
                <input
                  type="checkbox"
                  id="allDayCheckbox"
                  checked={formAllDay}
                  onChange={(e) => setFormAllDay(e.target.checked)}
                />
                <label htmlFor="allDayCheckbox">Celý den</label>
              </div>

              <div className="form-group">
                <label>Barva události</label>
                <div className="color-presets-picker">
                  {PRESETS_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`color-circle ${formColor === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn-modal-action delete"
                  >
                    Smazat událost
                  </button>
                )}
                <div className="right-actions">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-modal-action cancel"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    className="btn-modal-action submit"
                  >
                    Uložit
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
