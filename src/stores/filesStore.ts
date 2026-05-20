import { create } from 'zustand';
import { storage } from '@/lib/appwrite';
import { BUCKET_FILES } from '@/lib/dbSetup';
import { ID } from 'appwrite';

export interface FileItem {
  $id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
  folderPath: string; // virtuální cesta např. "/" nebo "/Prace"
  createdAt: string;
}

interface FilesState {
  files: FileItem[];
  folders: string[];
  isLoading: boolean;
  uploadProgress: number | null;
  errorMessage: string | null;
  loadFiles: () => Promise<void>;
  uploadFile: (file: File, currentPath: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  createFolder: (folderName: string, currentPath: string) => void;
  setErrorMessage: (msg: string | null) => void;
}

export const useFilesStore = create<FilesState>((set, get) => ({
  files: [],
  folders: ['/Práce', '/Dokumenty', '/Obrázky'],
  isLoading: false,
  uploadProgress: null,
  errorMessage: null,

  setErrorMessage: (msg) => set({ errorMessage: msg }),

  loadFiles: async () => {
    set({ isLoading: true, errorMessage: null });
    try {
      const response = await storage.listFiles(BUCKET_FILES);
      
      const mappedFiles: FileItem[] = response.files.map((file) => {
        const fileUrl = storage.getFileView(BUCKET_FILES, file.$id);
        
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

      set({ files: mappedFiles, isLoading: false });
    } catch (err) {
      console.warn('[Files Store] Nepodařilo se připojit k Appwrite Storage, spouštím s mock daty.', err);
      const mockFiles: FileItem[] = [
        {
          $id: 'mock-file-1',
          name: 'Faktura_Kveten.pdf',
          size: 1450000,
          mimeType: 'application/pdf',
          url: '/sample.pdf',
          folderPath: '/Dokumenty',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          $id: 'mock-file-2',
          name: 'Katalog_Produktu.pdf',
          size: 3200000,
          mimeType: 'application/pdf',
          url: '/sample.pdf',
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
          url: '/sample.pdf',
          folderPath: '/',
          createdAt: new Date().toISOString()
        }
      ];
      set({ files: mockFiles, isLoading: false });
    }
  },

  uploadFile: async (file, currentPath) => {
    // Omezení velikosti: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      set({ errorMessage: 'Velikost souboru překračuje limit 10MB.' });
      return;
    }

    set({ uploadProgress: 0, errorMessage: null });

    const folderPrefix = currentPath === '/' ? '' : currentPath.replace(/\//g, '_') + '___';
    const uploadName = `${folderPrefix}${file.name}`;

    try {
      await storage.createFile(
        BUCKET_FILES,
        ID.unique(),
        file,
        ['role:all'],
        (progress) => {
          const percent = Math.round(progress.progress);
          set({ uploadProgress: percent });
        }
      );

      set({ uploadProgress: null });
      await get().loadFiles();
    } catch (err) {
      console.error('[Files Store] Chyba při nahrávání do Appwrite:', err);
      set({ uploadProgress: null });
      
      // Fallback lokální nahrání
      const newMockFile: FileItem = {
        $id: `mock-${Date.now()}`,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        folderPath: currentPath,
        createdAt: new Date().toISOString()
      };
      
      set((state) => ({
        files: [newMockFile, ...state.files]
      }));
    }
  },

  deleteFile: async (fileId) => {
    if (fileId.startsWith('mock-')) {
      set((state) => ({
        files: state.files.filter((f) => f.$id !== fileId)
      }));
      return;
    }

    try {
      await storage.deleteFile(BUCKET_FILES, fileId);
      await get().loadFiles();
    } catch (err) {
      console.error('[Files Store] Chyba při mazání souboru:', err);
      set({ errorMessage: 'Nepodařilo se smazat soubor z úložiště.' });
    }
  },

  createFolder: (folderName, currentPath) => {
    const parentPath = currentPath === '/' ? '' : currentPath;
    const newPath = `${parentPath}/${folderName.trim()}`;

    const folders = get().folders;
    if (!folders.includes(newPath)) {
      set({ folders: [...folders, newPath] });
    }
  }
}));
