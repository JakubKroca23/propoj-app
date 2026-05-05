import { useState, useEffect } from 'react';

export interface Project {
  $id: string;
  title: string;
  description: string;
  thumbnail: string;
  demo_url?: string;
  order: number;
  featured: boolean;
  tags: string[];
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock projects for the landing page
    const mockProjects: Project[] = [
      {
        $id: '1',
        title: 'Project Alpha',
        description: 'Advanced industrial management system with real-time data visualization.',
        thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
        demo_url: 'https://example.com',
        order: 1,
        featured: true,
        tags: ['Industrial', 'Real-time', 'React']
      },
      {
        $id: '2',
        title: 'Cyber HUD',
        description: 'Next-generation user interface for autonomous vehicle monitoring.',
        thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
        demo_url: 'https://example.com',
        order: 2,
        featured: true,
        tags: ['HUD', 'Design', 'Next.js']
      }
    ];

    setProjects(mockProjects);
    setLoading(false);
  }, []);

  return { projects, loading };
};
