import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/appwrite';
import { BUCKET_FILES } from '@/lib/dbSetup';
import './PdfViewer.css';

interface PdfViewerProps {
  window: {
    id: string;
    params?: {
      fileUrl?: string;
      fileName?: string;
    };
  };
}

interface PdfFileItem {
  id: string;
  name: string;
  url: string;
  size: number;
}

export default function PdfViewer({ window: win }: PdfViewerProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('Prohlížeč PDF');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<PdfFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zpracování vstupních parametrů
  useEffect(() => {
    if (win.params?.fileUrl) {
      setFileUrl(win.params.fileUrl);
      setFileName(win.params.fileName || 'Dokument.pdf');
      setIsPickerOpen(false);
    } else {
      setFileUrl(null);
      setFileName('Prohlížeč PDF');
    }
  }, [win.params]);

  // Načtení PDF souborů z Appwrite Storage pro výběr
  const loadPdfFiles = async () => {
    setIsLoadingFiles(true);
    setError(null);
    try {
      const response = await storage.listFiles(BUCKET_FILES);
      const filtered = response.files
        .filter((file) => file.name.toLowerCase().endsWith('.pdf'))
        .map((file) => {
          const url = storage.getFileView(BUCKET_FILES, file.$id);
          // Vyčistíme případný prefix složky z názvu souboru
          const cleanName = file.name.includes('___') ? file.name.split('___')[1] : file.name;
          return {
            id: file.$id,
            name: cleanName,
            url,
            size: file.sizeOriginal
          };
        });
      setPdfFiles(filtered);
    } catch (err) {
      console.warn('[PdfViewer] Selhalo načtení z Appwrite, načítám mock PDF seznam.', err);
      // Fallback mock soubory pro vývoj
      const mockPdfs: PdfFileItem[] = [
        {
          id: 'mock-pdf-1',
          name: 'Faktura_Kveten.pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          size: 1450000
        },
        {
          id: 'mock-pdf-2',
          name: 'Katalog_Produktu.pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          size: 3200000
        },
        {
          id: 'mock-pdf-3',
          name: 'Prezentace_Projektu.pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          size: 5120000
        }
      ];
      setPdfFiles(mockPdfs);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSelectPdf = (pdf: PdfFileItem) => {
    setFileUrl(pdf.url);
    setFileName(pdf.name);
    setIsPickerOpen(false);
  };

  const handleOpenPicker = () => {
    setIsPickerOpen(true);
    loadPdfFiles();
  };

  const handleCloseDocument = () => {
    setFileUrl(null);
    setFileName('Prohlížeč PDF');
  };

  const handlePrint = () => {
    if (!fileUrl) return;
    // Otevře PDF v novém okně a vyvolá tisk
    const printWindow = window.open(fileUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="pdf-viewer">
      {/* Horní panel s ovládáním */}
      <header className="pdf-header">
        <div className="pdf-header-left">
          <span className="pdf-icon">📕</span>
          <span className="pdf-title" title={fileName}>{fileName}</span>
        </div>
        
        <div className="pdf-header-right">
          {fileUrl ? (
            <>
              <button onClick={handlePrint} className="btn-pdf-action" title="Vytisknout PDF">
                🖨️ Tisk
              </button>
              <button onClick={handleDownload} className="btn-pdf-action" title="Stáhnout PDF">
                📥 Stáhnout
              </button>
              <button onClick={handleCloseDocument} className="btn-pdf-action danger" title="Zavřít PDF">
                × Zavřít
              </button>
            </>
          ) : (
            <button onClick={handleOpenPicker} className="btn-pdf-action primary">
              📂 Otevřít soubor
            </button>
          )}
        </div>
      </header>

      {/* Hlavní obsah / iframe / embed */}
      <main className="pdf-content">
        {fileUrl ? (
          <div className="pdf-embed-wrapper">
            <iframe
              src={`${fileUrl}#toolbar=1`}
              title={fileName}
              width="100%"
              height="100%"
              className="pdf-iframe"
            />
          </div>
        ) : (
          /* Elegantní prázdný stav s výběrem */
          <div className="pdf-empty-state">
            <div className="pdf-empty-graphic">📕</div>
            <h2>Není vybrán žádný PDF dokument</h2>
            <p>Kliknutím na tlačítko níže vyberte PDF z vašeho cloudového úložiště.</p>
            <button onClick={handleOpenPicker} className="btn-open-picker-large">
              Vybrat PDF ze souborů
            </button>
          </div>
        )}
      </main>

      {/* Modal / picker pro výběr PDF ze souborů */}
      {isPickerOpen && (
        <div className="pdf-picker-backdrop" onClick={() => setIsPickerOpen(false)}>
          <div className="pdf-picker-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-picker-header">
              <h3>Vybrat PDF dokument</h3>
              <button onClick={() => setIsPickerOpen(false)} className="btn-picker-close">×</button>
            </div>
            
            <div className="pdf-picker-body">
              {isLoadingFiles ? (
                <div className="pdf-picker-loading">Načítání seznamu souborů...</div>
              ) : error ? (
                <div className="pdf-picker-error">⚠ {error}</div>
              ) : pdfFiles.length === 0 ? (
                <div className="pdf-picker-empty">
                  <span>📂</span>
                  <p>V úložišti nebyly nalezeny žádné soubory typu PDF.</p>
                  <p className="sub">Nahrajte soubory .pdf do Správce souborů.</p>
                </div>
              ) : (
                <div className="pdf-files-list">
                  {pdfFiles.map((pdf) => (
                    <div
                      key={pdf.id}
                      onClick={() => handleSelectPdf(pdf)}
                      className="pdf-picker-item"
                    >
                      <span className="item-icon">📕</span>
                      <div className="item-details">
                        <span className="item-name" title={pdf.name}>{pdf.name}</span>
                        <span className="item-size">{formatBytes(pdf.size)}</span>
                      </div>
                      <span className="item-action">Vybrat →</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pdf-picker-footer">
              <button onClick={() => setIsPickerOpen(false)} className="btn-picker-cancel">
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
