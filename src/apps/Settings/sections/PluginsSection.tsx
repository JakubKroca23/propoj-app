import React, { useState } from 'react';
import { useBentoStore } from '@/stores/bentoStore';
import { useAuthStore } from '@/stores/authStore';

export default function PluginsSection() {
  const { user } = useAuthStore();
  const { plugins, installPlugin, togglePlugin, uninstallPlugin, isLoading } = useBentoStore();
  
  const [manifestUrl, setManifestUrl] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);

  const handleInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manifestUrl.trim() || !user?.$id) return;

    setInstalling(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await installPlugin(manifestUrl.trim(), user.$id);
      setActionSuccess('Plugin byl úspěšně nainstalován a přidán na plochu!');
      setManifestUrl('');
      
      // Skryje úspěch po 4 sekundách
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Nepodařilo se nainstalovat plugin. Ověřte URL adresu a formát manifestu.');
    } finally {
      setInstalling(false);
    }
  };

  const handleToggle = async (pluginId: string, currentStatus: boolean) => {
    if (!user?.$id) return;
    setActionError(null);
    setActionSuccess(null);
    
    try {
      await togglePlugin(pluginId, !currentStatus, user.$id);
    } catch (err: any) {
      setActionError('Nepodařilo se změnit stav pluginu.');
    }
  };

  const handleUninstall = async (pluginId: string) => {
    if (!user?.$id) return;
    setActionError(null);
    setActionSuccess(null);
    
    if (confirm('Opravdu chcete tento plugin odinstalovat? Všechna lokální data aplikace budou ztracena.')) {
      try {
        await uninstallPlugin(pluginId, user.$id);
        setActionSuccess('Plugin byl úspěšně odinstalován.');
        setTimeout(() => setActionSuccess(null), 3000);
      } catch (err: any) {
        setActionError('Nepodařilo se odinstalovat plugin.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6" style={{ width: '100%' }}>
      {/* Sekce pro instalaci nového pluginu */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-primary">Instalovat nový plugin</h3>
        <p className="text-xs text-secondary">
          Zadejte přímou URL adresu k souboru <code>manifest.json</code> externího pluginu.
        </p>

        <form onSubmit={handleInstall} className="flex gap-2" style={{ marginTop: '8px', width: '100%' }}>
          <input
            type="url"
            value={manifestUrl}
            onChange={(e) => setManifestUrl(e.target.value)}
            placeholder="https://example.com/plugins/calculator/manifest.json"
            required
            className="glass"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          />
          <button
            type="submit"
            disabled={installing || isLoading}
            className="glass font-bold"
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'opacity var(--transition-fast)',
              opacity: installing || isLoading ? 0.6 : 1,
            }}
          >
            {installing ? 'Instaluji...' : 'Instalovat'}
          </button>
        </form>

        {actionError && (
          <div
            style={{
              marginTop: '8px',
              padding: '10px 14px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              fontSize: '0.8rem',
            }}
          >
            ⚠️ {actionError}
          </div>
        )}

        {actionSuccess && (
          <div
            style={{
              marginTop: '8px',
              padding: '10px 14px',
              borderRadius: '6px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22C55E',
              fontSize: '0.8rem',
            }}
          >
            ✓ {actionSuccess}
          </div>
        )}
      </div>

      {/* Seznam instalovaných pluginů */}
      <div className="flex flex-col gap-2" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
        <h3 className="text-sm font-semibold text-primary">Instalované pluginy</h3>
        <p className="text-xs text-secondary">Správa stávajících doplňků a jejich oprávnění v systému.</p>

        {plugins.length === 0 ? (
          <div
            style={{
              marginTop: '12px',
              padding: '30px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
            }}
          >
            🔌 Žádné externí pluginy nejsou nainstalovány.
          </div>
        ) : (
          <div className="flex flex-col gap-3" style={{ marginTop: '12px' }}>
            {plugins.map((plugin) => {
              let perms: string[] = [];
              try {
                perms = JSON.parse(plugin.permissions);
              } catch (e) {}

              return (
                <div
                  key={plugin.$id}
                  className="flex items-center justify-between"
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-subtle)',
                    gap: '16px',
                  }}
                >
                  <div className="flex items-start gap-3" style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '1.75rem',
                        padding: '8px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {plugin.icon || '🧩'}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {plugin.name}
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            background: plugin.enabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: plugin.enabled ? '#22C55E' : 'var(--text-secondary)',
                            fontWeight: 'bold',
                          }}
                        >
                          {plugin.enabled ? 'Aktivní' : 'Neaktivní'}
                        </span>
                      </span>
                      <span className="text-xs text-secondary">{plugin.description || 'Bez popisu.'}</span>
                      {perms.length > 0 && (
                        <span className="text-xs" style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          Oprávnění:
                          {perms.map((p) => (
                            <code
                              key={p}
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                color: 'var(--text-primary)',
                                fontSize: '0.7rem',
                              }}
                            >
                              {p}
                            </code>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(plugin.$id, plugin.enabled)}
                      className="glass font-bold"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: plugin.enabled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        color: plugin.enabled ? '#EF4444' : '#22C55E',
                        border: `1px solid ${plugin.enabled ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {plugin.enabled ? 'Zakázat' : 'Povolit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUninstall(plugin.$id)}
                      className="glass font-bold"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Odinstalovat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
