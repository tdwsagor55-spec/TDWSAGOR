import React, { createContext, useContext, useState, useEffect } from 'react';
import { SavedProject, TemplateItem } from '../types';

interface ProjectContextType {
  projects: SavedProject[];
  savedPhotos: SavedProject[];
  savedVideos: SavedProject[];
  saveProject: (project: Omit<SavedProject, 'id' | 'createdAt'>) => SavedProject;
  deleteProject: (id: string) => void;
  selectedTemplate: TemplateItem | null;
  setSelectedTemplate: (template: TemplateItem | null) => void;
}

const defaultProjects: SavedProject[] = [
  {
    id: 'p_1',
    title: 'Neon Cyber Portrait',
    type: 'photo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    createdAt: '2 hours ago',
    sizeMB: 3.2,
  },
  {
    id: 'p_2',
    title: 'Cinematic Sunset Drone',
    type: 'video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    createdAt: 'Yesterday',
    sizeMB: 8.5,
  },
  {
    id: 'p_3',
    title: 'Anime Girl Transformation',
    type: 'ai',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    createdAt: '3 days ago',
    sizeMB: 2.8,
  },
  {
    id: 'p_4',
    title: 'Dhaka City Street Beat',
    type: 'video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
    createdAt: '5 days ago',
    sizeMB: 14.1,
  },
];

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<SavedProject[]>(() => {
    const saved = localStorage.getItem('magic_editor_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultProjects;
      }
    }
    return defaultProjects;
  });

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);

  useEffect(() => {
    localStorage.setItem('magic_editor_projects', JSON.stringify(projects));
  }, [projects]);

  const saveProject = (item: Omit<SavedProject, 'id' | 'createdAt'>): SavedProject => {
    const newProject: SavedProject = {
      ...item,
      id: 'proj_' + Date.now(),
      createdAt: 'Just now',
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const savedPhotos = projects.filter((p) => p.type === 'photo' || p.type === 'ai');
  const savedVideos = projects.filter((p) => p.type === 'video');

  return (
    <ProjectContext.Provider
      value={{
        projects,
        savedPhotos,
        savedVideos,
        saveProject,
        deleteProject,
        selectedTemplate,
        setSelectedTemplate,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within a ProjectProvider');
  return context;
};
