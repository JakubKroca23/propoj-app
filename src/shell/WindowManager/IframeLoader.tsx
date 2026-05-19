import React from 'react';

interface IframeLoaderProps {
  url: string;
  windowId: string;
  token: string;
}

/**
 * Komponenta pro bezpečné spouštění pluginů v sandboxed iframe.
 * sandbox="allow-scripts" zaručuje, že plugin nemůže přistupovat k cookies, local storage ani tokenům hostitele
 * (chybějící "allow-same-origin" vynutí origin "null" pro iframe).
 */
export default function IframeLoader({ url, windowId, token }: IframeLoaderProps) {
  let targetUrl = '';
  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set('origin', window.location.origin);
    parsedUrl.searchParams.set('windowId', windowId);
    parsedUrl.searchParams.set('token', token);
    targetUrl = parsedUrl.toString();
  } catch (error) {
    console.error('[IframeLoader] Neplatná URL adresa pluginu:', url, error);
    targetUrl = url; // Fallback
  }

  return (
    <iframe
      src={targetUrl}
      title="Plugin Sandbox"
      sandbox="allow-scripts"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        background: 'transparent',
      }}
    />
  );
}
