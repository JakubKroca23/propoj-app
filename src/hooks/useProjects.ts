import { useState, useEffect } from 'react';
import { databases, storage } from '@/lib/appwrite';
import { Query, ImageGravity } from 'appwrite';

export interface Project {
  $id: string;
  title: string;
  description: string;
  thumbnail: string; // This will be the full URL
  tags: string[];
  demo_url?: string;
  github_url?: string;
  featured: boolean;
  order: number;
}

const DATABASE_ID = 'propoj-main';
const COLLECTION_ID = 'projects';
const BUCKET_ID = 'projects-thumbnails'; // Assuming this bucket name

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.orderAsc('order')]
      );

      const projectsWithUrls = response.documents.map((doc: any) => {
        let thumbnailUrl = doc.thumbnail;
        try {
           thumbnailUrl = storage.getFilePreview(
            BUCKET_ID,
            doc.thumbnail,
            800, 0, ImageGravity.Center, 90, 0, '', 0, 1, 0, '', 'webp'
          ).toString();
        } catch (e) {
          console.warn('Failed to generate preview URL for', doc.thumbnail);
        }

        return { ...doc, thumbnail: thumbnailUrl, thumbnail_id: doc.thumbnail } as Project;
      });

      setProjects(projectsWithUrls);
      setError(null);
    } catch (err: any) {
      console.error('Fetch Projects Error:', err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const addProject = async (data: Omit<Project, '$id' | 'thumbnail'>, file: File) => {
    try {
      // 1. Upload image
      const upload = await storage.createFile(BUCKET_ID, 'unique()', file);
      
      // 2. Create document
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        'unique()',
        {
          ...data,
          thumbnail: upload.$id
        }
      );
      
      await fetchProjects();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add project');
    }
  };

  const updateProject = async (projectId: string, data: Partial<Project>, newFile?: File) => {
    try {
      let thumbnailId = data.thumbnail;

      if (newFile) {
        // 1. Upload new image
        const upload = await storage.createFile(BUCKET_ID, 'unique()', newFile);
        thumbnailId = upload.$id;
        
        // 2. Optional: Delete old image if it exists
        if ((data as any).thumbnail_id) {
          try {
            await storage.deleteFile(BUCKET_ID, (data as any).thumbnail_id);
          } catch (e) {
            console.warn('Failed to delete old thumbnail', e);
          }
        }
      }

      // 3. Update document
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        projectId,
        {
          ...data,
          thumbnail: thumbnailId,
          thumbnail_id: undefined // Remove helper field before saving
        }
      );
      
      await fetchProjects();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update project');
    }
  };

  const deleteProject = async (projectId: string, fileId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, projectId);
      await storage.deleteFile(BUCKET_ID, fileId);
      await fetchProjects();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete project');
    }
  };

  return { projects, loading, error, addProject, updateProject, deleteProject, refresh: fetchProjects };
};
