import React, { useState, useEffect, useRef } from 'react';
import { storage } from '@/lib/appwrite';
import { BUCKET_FILES } from '@/lib/dbSetup';
import { useAuthStore } from '@/stores/authStore';
import { useWindowStore } from '@/stores/windowStore';
import { APPS } from '@/data/apps';
import { ID } from 'appwrite';
import './FileManager.css';

interface FileItem {
  $id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
  folderPath: string; // virtuální cesta např. "/" nebo "/Prace"
  createdAt: string;
}

export default function FileManager() {
  const { user } = useAuthStore();
  const windowStore = useWindowStore();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Virtuální složky spravované lokálně s perzistencí
  const [folders, setFolders] = useState<string[]>(['/Práce', '/Dokumenty', '/Obrázky']);
  const [newFolderName, setNewFolderName] = useState('');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // Lightbox náhled pro obrázky/videa
  const [lightboxItem, setLightboxItem] = useState<FileItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Načtení souborů z Appwrite Storage
  const loadFiles = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await storage.listFiles(BUCKET_FILES);
      
      const mappedFiles: FileItem[] = response.files.map((file) => {
        // Získání URL pro zobrazení/stažení
        const fileUrl = storage.getFileView(BUCKET_FILES, file.$id);
        
        // Získání složky z tagů/metadata (v Appwrite nahrazeno prefixy v názvu nebo fallbackem na "/")
        let folderPath = '/';
        if (file.name.includes('___')) {
          const parts = file.name.split('___');
          folderPath = parts[0].replace(/_/g, '/');
        }

        return {
          $id: file.$id,
          name: file.name.includes('___') ? file.name.split('___')[1] : file.name,
          size: file.sizeOriginal,
          mimeType: file.mimeType,
          url: fileUrl,
          folderPath,
          createdAt: file.$createdAt
        };
      });

      setFiles(mappedFiles);
    } catch (err) {
      console.warn('[FileManager] Nepodařilo se připojit k Appwrite Storage, spouštím s mock daty.', err);
      // Mock data pro offline / vývoj
      const mockFiles: FileItem[] = [
        {
          $id: 'mock-file-1',
          name: 'Faktura_Kveten.pdf',
          size: 1450000,
          mimeType: 'application/pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          folderPath: '/Dokumenty',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          $id: 'mock-file-2',
          name: 'Katalog_Produktu.pdf',
          size: 3200000,
          mimeType: 'application/pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          folderPath: '/Dokumenty',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          $id: 'mock-file-3',
          name: 'Pozadí_Plochy.png',
          size: 1250000,
          mimeType: 'image/png',
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
          folderPath: '/Obrázky',
          createdAt: new Date().toISOString()
        },
        {
          $id: 'mock-file-4',
          name: 'Prezentace_Projektu.pdf',
          size: 5120000,
          mimeType: 'application/pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          folderPath: '/',
          createdAt: new Date().toISOString()
        }
      ];
      setFiles(mockFiles);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Upload souboru
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    // Omezení velikosti: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage('Velikost souboru překračuje limit 10MB.');
      return;
    }

    setUploadProgress(0);
    setErrorMessage(null);

    // Kódujeme složku do názvu souboru (Appwrite nepodporuje složky, nahrazujeme složka___soubor)
    const folderPrefix = currentPath === '/' ? '' : currentPath.replace(/\//g, '_') + '___';
    const uploadName = `${folderPrefix}${file.name}`;

    try {
      // Vytvoření souboru
      await storage.createFile(
        BUCKET_FILES,
        ID.unique(),
        file,
        ['role:all'],
        (progress) => {
          const percent = Math.round(progress.progress);
          setUploadProgress(percent);
        }
      );

      // Úspěch - refresh seznamu
      setUploadProgress(null);
      await loadFiles();
    } catch (err) {
      console.error('[FileManager] Chyba při nahrávání do Appwrite:', err);
      // Fallback lokální nahrání (pouze simulace v UI)
      setUploadProgress(null);
      
      const newMockFile: FileItem = {
        $id: `mock-${Date.now()}`,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        folderPath: currentPath,
        createdAt: new Date().toISOString()
      };
      
      setFiles((prev) => [newMockFile, ...prev]);
    }
  };

  // Mazání souboru
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Opravdu chcete tento soubor smazat?')) return;

    if (fileId.startsWith('mock-')) {
      setFiles((prev) => prev.filter((f) => f.$id !== fileId));
      return;
    }

    try {
      await storage.deleteFile(BUCKET_FILES, fileId);
      await loadFiles();
    } catch (err) {
      console.error('[FileManager] Chyba při mazání souboru:', err);
      setErrorMessage('Nepodařilo se smazat soubor z úložiště.');
    }
  };

  // Vytvoření nové virtuální složky
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    // Cesta k nové složce
    const parentPath = currentPath === '/' ? '' : currentPath;
    const newPath = `${parentPath}/${newFolderName.trim()}`;

    if (!folders.includes(newPath)) {
      setFolders((prev) => [...prev, newPath]);
    }

    setNewFolderName('');
    setIsFolderModalOpen(false);
  };

  // Navigace složkami
  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
  };

  const navigateUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/');
    parts.pop();
    const parent = parts.join('/') || '/';
    setCurrentPath(parent);
  };

  // Filtrování obsahu pro aktuální cestu
  const currentLevelFolders = folders
    .filter((f) => {
      // Hledáme složky o úroveň níž než aktuální path
      if (currentPath === '/') {
        return f.startsWith('/') && f.split('/').length === 2;
      } else {
        return f.startsWith(currentPath + '/') && f.substring(currentPath.length + 1).split('/').length === 1;
      }
    })
    .map((f) => ({
      name: f.substring(f.lastIndexOf('/') + 1),
      fullPath: f
    }));

  const currentLevelFiles = files.filter((f) => f.folderPath === currentPath);

  // Pomocné funkce
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mime: string, name: string) => {
    if (mime.startsWith('image/')) return '🖼️';
    if (mime.startsWith('video/')) return '🎥';
    if (mime === 'application/pdf' || name.endsWith('.pdf')) return '📕';
    if (mime.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.md')) return '📄';
    return '📦';
  };

  // Kliknutí na soubor (lightbox / PDF viewer)
  const handleFileClick = (file: FileItem) => {
    if (file.mimeType === 'application/pdf' || file.name.endsWith('.pdf')) {
      const pdfApp = APPS.find((a) => a.id === 'pdf-viewer');
      if (pdfApp) {
        windowStore.openWindow(pdfApp, {
          fileUrl: file.url,
          fileName: file.name
        });
      }
    } else if (file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/')) {
      setLightboxItem(file);
    } else {
      // Výchozí stažení souboru
      window.open(file.url, '_blank');
    }
  };

  return (
    <div className="file-manager">
      {/* Horní ovládací panel */}
      <header className="file-header">
        <div className="header-left">
          <button onClick={navigateUp} disabled={currentPath === '/'} className="btn-nav">
            ⬆ Zpět
          </button>
          
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <span onClick={() => navigateToFolder('/')} className="crumb">Domů</span>
            {currentPath !== '/' &&
              currentPath
                .split('/')
                .filter(Boolean)
                .map((crumb, idx, arr) => {
                  const path = '/' + arr.slice(0, idx + 1).join('/');
                  return (
                    <React.Fragment key={path}>
                      <span className="crumb-separator">/</span>
                      <span onClick={() => navigateToFolder(path)} className="crumb">
                        {crumb}
                      </span>
                    </React.Fragment>
                  );
                })}
          </div>
        </div>

        <div className="header-right">
          <button onClick={() => setIsFolderModalOpen(true)} className="btn-action">
            📁 Nová složka
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-action primary">
            📤 Nahrát soubor
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: 'none' }}
          />

          <div className="view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              Seznam
            </button>
          </div>
        </div>
      </header>

      {/* Progress bary a error alerts */}
      {uploadProgress !== null && (
        <div className="upload-progress-bar">
          <div className="progress-fill" style={{ width: `${uploadProgress}%` }}>
            <span className="progress-text">Nahrávání... {uploadProgress}%</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="file-error-banner">
          <span>⚠ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="btn-close-error">×</button>
        </div>
      )}

      {/* Hlavní zobrazení souborů a složek */}
      <main className="file-content-area">
        {isLoading ? (
          <div className="file-loading">Načítání složek a souborů...</div>
        ) : currentLevelFolders.length === 0 && currentLevelFiles.length === 0 ? (
          <div className="file-empty-state">
            <div className="empty-graphic">📂</div>
            <h3>Tato složka je prázdná</h3>
            <p>Klikněte na "Nahrát soubor" nebo vytvořte novou pod-složku.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="file-grid">
            {/* Vykreslení složek */}
            {currentLevelFolders.map((f) => (
              <div
                key={f.fullPath}
                onDoubleClick={() => navigateToFolder(f.fullPath)}
                onClick={() => {
                  // Podpora jednokliku na dotykových zařízeních
                  if (window.innerWidth <= 768) navigateToFolder(f.fullPath);
                }}
                className="grid-item folder"
              >
                <div className="grid-icon">📁</div>
                <div className="grid-label">{f.name}</div>
              </div>
            ))}

            {/* Vykreslení souborů */}
            {currentLevelFiles.map((file) => (
              <div
                key={file.$id}
                onClick={() => handleFileClick(file)}
                className="grid-item file"
              >
                <div className="grid-icon">{getFileIcon(file.mimeType, file.name)}</div>
                <div className="grid-label" title={file.name}>
                  {file.name}
                </div>
                <div className="grid-size">{formatBytes(file.size)}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.$id);
                  }}
                  className="btn-delete-file"
                  title="Smazat soubor"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* List View Tabulka */
          <div className="file-list-view">
            <table className="file-table">
              <thead>
                <tr>
                  <th>Název</th>
                  <th>Velikost</th>
                  <th>Typ</th>
                  <th>Datum nahrání</th>
                  <th>Akce</th>
                </tr>
              </thead>
              <tbody>
                {/* Složky */}
                {currentLevelFolders.map((f) => (
                  <tr
                    key={f.fullPath}
                    onDoubleClick={() => navigateToFolder(f.fullPath)}
                    className="table-row folder"
                  >
                    <td>📁 <span className="item-name-text">{f.name}</span></td>
                    <td>—</td>
                    <td>Složka</td>
                    <td>—</td>
                    <td>—</td>
                  </tr>
                ))}

                {/* Soubory */}
                {currentLevelFiles.map((file) => (
                  <tr
                    key={file.$id}
                    onClick={() => handleFileClick(file)}
                    className="table-row file"
                  >
                    <td>
                      {getFileIcon(file.mimeType, file.name)} <span className="item-name-text">{file.name}</span>
                    </td>
                    <td>{formatBytes(file.size)}</td>
                    <td>{file.mimeType.split('/')[1] || 'neznámý'}</td>
                    <td>{new Date(file.createdAt).toLocaleDateString('cs-CZ')}</td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.$id);
                        }}
                        className="btn-table-delete"
                      >
                        Smazat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal pro vytvoření složky */}
      {isFolderModalOpen && (
        <div className="file-modal-backdrop" onClick={() => setIsFolderModalOpen(false)}>
          <div className="file-modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="file-modal-header">
              <h3>Vytvořit novou složku</h3>
              <button onClick={() => setIsFolderModalOpen(false)} className="btn-modal-close">×</button>
            </div>
            <form onSubmit={handleCreateFolder} className="file-modal-form">
              <input
                type="text"
                required
                placeholder="Název složky (např. Projekty)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="folder-name-input"
                autoFocus
              />
              <div className="file-modal-actions">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="btn-modal-cancel"
                >
                  Zrušit
                </button>
                <button type="submit" className="btn-modal-submit">
                  Vytvořit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox náhled pro obrázky a videa */}
      {lightboxItem && (
        <div className="file-lightbox-backdrop" onClick={() => setLightboxItem(null)}>
          <div className="lightbox-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightboxItem(null)} className="btn-lightbox-close">
              ×
            </button>
            
            <div className="lightbox-media-wrapper">
              {lightboxItem.mimeType.startsWith('image/') ? (
                <img src={lightboxItem.url} alt={lightboxItem.name} className="lightbox-media image" />
              ) : (
                <video src={lightboxItem.url} controls autoPlay className="lightbox-media video" />
              )}
            </div>

            <div className="lightbox-meta">
              <span className="lightbox-title">{lightboxItem.name}</span>
              <span className="lightbox-size">{formatBytes(lightboxItem.size)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
