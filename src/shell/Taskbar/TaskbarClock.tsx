import React, { useEffect, useState } from 'react';

export default function TaskbarClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    const formatted = date.toLocaleDateString('cs-CZ', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <div className="flex flex-col items-center justify-center no-select" style={{ cursor: 'default' }}>
      <span className="text-sm font-semibold" style={{ letterSpacing: '0.5px' }}>
        {formatTime(time)}
      </span>
      <span className="text-xs text-secondary" style={{ marginTop: '-2px' }}>
        {formatDate(time)}
      </span>
    </div>
  );
}
