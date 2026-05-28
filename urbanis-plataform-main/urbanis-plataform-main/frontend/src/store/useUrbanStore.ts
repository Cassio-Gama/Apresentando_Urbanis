import { create } from 'zustand';
import type { DistrictData } from '../types';
import rawData from '../data/urbanis_data.json';
import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

// Import raw Segment Profiles JSON (Standard MCDA / WLC configs)
import restaurantPremium from '../config/profiles/restaurant-premium.json';
import retailPopular from '../config/profiles/retail-popular.json';
import logisticsLastmile from '../config/profiles/logistics-lastmile.json';
import pharmacyPopular from '../config/profiles/pharmacy-popular.json';
import pharmacyPremium from '../config/profiles/pharmacy-premium.json';
import gymPopular from '../config/profiles/gym-popular.json';
import gymPremium from '../config/profiles/gym-premium.json';

export interface Project {
  id: string;
  name: string;
  segment: string;
  profile: string;
  strategicGoal: string;
}

export const PROFILES: Record<string, {
  profile: string;
  displayName: string;
  weights: {
    infra: { dens: number; mob: number };
    market: { central: number; pop: number; idade: number };
    risk: { crime: number; socio: number };
    balance: { infra: number; market: number };
    alpha: number;
  }
}> = {
  "restaurant-premium": restaurantPremium,
  "retail-popular": retailPopular,
  "logistics-lastmile": logisticsLastmile,
  "pharmacy-popular": pharmacyPopular,
  "pharmacy-premium": pharmacyPremium,
  "gym-popular": gymPopular,
  "gym-premium": gymPremium
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "default-1",
    name: "Estudo de Aderência — Drogaria Popular Centro",
    segment: "Farmácia Popular",
    profile: "pharmacy-popular",
    strategicGoal: "Capilaridade e Proximidade Residencial em São Paulo"
  }
];

interface UrbanStore {
  projects: Project[];
  activeProjectId: string;
  districts: DistrictData[];
  theme: 'dark' | 'light';
  activeMapLayer: 'score' | 'crime' | 'age' | 'mobility';
  
  // Authentication & Supabase States
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  offlineMode: boolean;

  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setOfflineMode: (enabled: boolean) => void;
  fetchSupabaseProjects: (userId: string) => Promise<void>;
  
  createProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, project: Omit<Project, 'id'>) => Promise<void>;
  selectProject: (id: string) => void;
  deleteProject: (id: string) => Promise<void>;
  setActiveMapLayer: (layer: 'score' | 'crime' | 'age' | 'mobility') => void;
  calculateScores: () => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

// Load saved data or fallback to defaults (Offline Mode)
const loadSavedProjects = (): Project[] => {
  const saved = localStorage.getItem('urbanis-projects');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasValidProfiles = parsed.every(p => p && p.profile && PROFILES[p.profile]);
        if (hasValidProfiles) return parsed;
        
        console.warn("Limpando projetos legados incompatíveis do localStorage.");
        localStorage.removeItem('urbanis-projects');
        localStorage.removeItem('urbanis-active-project-id');
      }
    } catch (e) {
      console.error("Erro ao carregar projetos do localStorage", e);
    }
  }
  return DEFAULT_PROJECTS;
};

const loadSavedActiveProjectId = (projects: Project[]): string => {
  const savedActive = localStorage.getItem('urbanis-active-project-id');
  if (savedActive && projects.some(p => p.id === savedActive)) {
    return savedActive;
  }
  return projects.length > 0 ? projects[0].id : "";
};

export const useUrbanStore = create<UrbanStore>((set, get) => ({
  projects: [], // starts empty, loaded during initAuth
  activeProjectId: "",
  districts: [],
  theme: (localStorage.getItem('urbanis-theme') as 'dark' | 'light') || 'dark',
  activeMapLayer: 'score',

  // Authentication & Supabase state initializations
  user: null,
  session: null,
  authLoading: true,
  offlineMode: false,

  initAuth: async () => {
    if (!isSupabaseConfigured) {
      set({ 
        offlineMode: true, 
        authLoading: false,
        projects: loadSavedProjects() 
      });
      set({ activeProjectId: loadSavedActiveProjectId(get().projects) });
      get().calculateScores();
      return;
    }

    try {
      // 1. Recover existing active session
      const { data: { session } } = await supabase.auth.getSession();
      
      // 2. Set up reactive auth state change listener
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        set({ 
          session: newSession,
          user: newSession?.user ?? null,
          offlineMode: false,
          authLoading: false
        });

        if (newSession) {
          await get().fetchSupabaseProjects(newSession.user.id);
        } else {
          // Revert to localStorage if logged out
          const localProjs = loadSavedProjects();
          set({ 
            projects: localProjs,
            activeProjectId: loadSavedActiveProjectId(localProjs)
          });
          get().calculateScores();
        }
      });

      if (session) {
        set({ 
          session, 
          user: session.user, 
          offlineMode: false,
          authLoading: false 
        });
        await get().fetchSupabaseProjects(session.user.id);
      } else {
        const localProjs = loadSavedProjects();
        set({ 
          offlineMode: false, 
          authLoading: false,
          projects: localProjs,
          activeProjectId: loadSavedActiveProjectId(localProjs)
        });
        get().calculateScores();
      }
    } catch (e) {
      console.error("Erro na inicialização do Supabase Auth:", e);
      const localProjs = loadSavedProjects();
      set({ 
        offlineMode: false, 
        authLoading: false,
        projects: localProjs,
        activeProjectId: loadSavedActiveProjectId(localProjs)
      });
      get().calculateScores();
    }
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session && data.user) {
      set({ session: data.session, user: data.user, offlineMode: false });
      await get().fetchSupabaseProjects(data.user.id);
    }
    return { error };
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.session && data.user) {
      set({ session: data.session, user: data.user, offlineMode: false });
      await get().fetchSupabaseProjects(data.user.id);
    }
    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, offlineMode: true });
    // Callback triggers state change, resetting to localStorage projects
  },

  setOfflineMode: (enabled) => {
    set({ offlineMode: enabled });
    if (enabled) {
      const localProjs = loadSavedProjects();
      set({ 
        projects: localProjs,
        activeProjectId: loadSavedActiveProjectId(localProjs)
      });
      get().calculateScores();
    }
  },

  fetchSupabaseProjects: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: Project[] = data.map(row => ({
          id: row.id,
          name: row.name,
          segment: row.segment,
          profile: row.profile,
          strategicGoal: row.strategic_goal
        }));
        set({ 
          projects: mapped,
          activeProjectId: loadSavedActiveProjectId(mapped)
        });
      } else {
        // Automatically provision a default study for new accounts to keep dashboard filled
        const defaultProj = DEFAULT_PROJECTS[0];
        const { data: inserted, error: insertError } = await supabase
          .from('projects')
          .insert({
            user_id: userId,
            name: defaultProj.name,
            segment: defaultProj.segment,
            profile: defaultProj.profile,
            strategic_goal: defaultProj.strategicGoal
          })
          .select()
          .single();

        if (insertError) throw insertError;

        if (inserted) {
          const mappedProj: Project = {
            id: inserted.id,
            name: inserted.name,
            segment: inserted.segment,
            profile: inserted.profile,
            strategicGoal: inserted.strategic_goal
          };
          set({ 
            projects: [mappedProj],
            activeProjectId: mappedProj.id 
          });
        }
      }
    } catch (e) {
      console.error("Erro ao buscar projetos do Supabase:", e);
      // Fallback local caso dê erro de conexão
      const localProjs = loadSavedProjects();
      set({ 
        projects: localProjs,
        activeProjectId: loadSavedActiveProjectId(localProjs)
      });
    } finally {
      get().calculateScores();
    }
  },

  createProject: async (projData) => {
    const { user, offlineMode } = get();

    if (isSupabaseConfigured && !offlineMode && user) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            name: projData.name,
            segment: projData.segment,
            profile: projData.profile,
            strategic_goal: projData.strategicGoal
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const newProject: Project = {
            id: data.id,
            name: data.name,
            segment: data.segment,
            profile: data.profile,
            strategicGoal: data.strategic_goal
          };
          set({ 
            projects: [...get().projects, newProject],
            activeProjectId: newProject.id 
          });
        }
      } catch (e) {
        console.error("Erro ao criar projeto no Supabase:", e);
      }
    } else {
      // LocalStorage Offline Fallback
      const newProject: Project = {
        ...projData,
        id: "proj-" + Date.now()
      };
      const updatedProjects = [...get().projects, newProject];
      localStorage.setItem('urbanis-projects', JSON.stringify(updatedProjects));
      localStorage.setItem('urbanis-active-project-id', newProject.id);
      
      set({ 
        projects: updatedProjects,
        activeProjectId: newProject.id 
      });
    }
    
    get().calculateScores();
  },

  updateProject: async (id, projData) => {
    const { user, offlineMode } = get();

    if (isSupabaseConfigured && !offlineMode && user) {
      try {
        const { error } = await supabase
          .from('projects')
          .update({
            name: projData.name,
            segment: projData.segment,
            profile: projData.profile,
            strategic_goal: projData.strategicGoal
          })
          .eq('id', id);

        if (error) throw error;

        const updatedProjects = get().projects.map(p => 
          p.id === id ? { ...p, ...projData } : p
        );
        set({ projects: updatedProjects });
      } catch (e) {
        console.error("Erro ao atualizar projeto no Supabase:", e);
      }
    } else {
      // LocalStorage Offline Fallback
      const updatedProjects = get().projects.map(p => p.id === id ? { ...p, ...projData } : p);
      localStorage.setItem('urbanis-projects', JSON.stringify(updatedProjects));
      set({ projects: updatedProjects });
    }
    
    get().calculateScores();
  },

  selectProject: (id) => {
    if (!get().projects.some(p => p.id === id)) return;
    localStorage.setItem('urbanis-active-project-id', id);
    set({ activeProjectId: id });
    get().calculateScores();
  },

  deleteProject: async (id) => {
    const { user, offlineMode } = get();
    if (get().projects.length <= 1) return;
    
    const updatedProjects = get().projects.filter(p => p.id !== id);
    let nextActiveId = get().activeProjectId;
    
    if (get().activeProjectId === id) {
      nextActiveId = updatedProjects[0].id;
    }
    
    if (isSupabaseConfigured && !offlineMode && user) {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set({
          projects: updatedProjects,
          activeProjectId: nextActiveId
        });
      } catch (e) {
        console.error("Erro ao deletar projeto no Supabase:", e);
      }
    } else {
      // LocalStorage Offline Fallback
      localStorage.setItem('urbanis-projects', JSON.stringify(updatedProjects));
      localStorage.setItem('urbanis-active-project-id', nextActiveId);
      
      set({
        projects: updatedProjects,
        activeProjectId: nextActiveId
      });
    }
    
    get().calculateScores();
  },

  setActiveMapLayer: (layer) => {
    set({ activeMapLayer: layer });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('urbanis-theme', newTheme);
    set({ theme: newTheme });
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  },

  initTheme: () => {
    const theme = get().theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },

  calculateScores: () => {
    const { projects, activeProjectId } = get();
    const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
    if (!activeProject) return;

    const profileData = PROFILES[activeProject.profile || "pharmacy-popular"] || PROFILES["pharmacy-popular"];

    const { weights } = profileData;
    const { infra, market, risk, balance, alpha } = weights;

    const scoredDistricts = (rawData as DistrictData[]).map((d) => {
      // 1. Pilar de Infraestrutura
      const infraScore = d.dens_norm * infra.dens + d.mob_norm * infra.mob;

      // 2. Pilar de Potencial de Mercado
      const marketScore =
        d.central_norm * market.central +
        d.pop_norm * market.pop +
        d.idade_norm * market.idade;

      // 3. Cruzamento e Balanceamento de Oportunidades (MCDA - Multi-Criteria Decision Analysis)
      const opportunityScore =
        infraScore * balance.infra + marketScore * balance.market;

      // 4. Pilar de Risco Operacional Ponderado
      const riskScore = d.crime_norm * risk.crime + d.vulner_norm * risk.socio;

      // 5. Cálculo do Score de Aderência Territorial (WLC - Weighted Linear Combination com atenuação de Risco)
      let urbanScore = opportunityScore * (1 - alpha * riskScore);
      urbanScore = Math.max(0, Math.min(1, urbanScore)) * 100;

      return {
        ...d,
        InfraScore: infraScore,
        MarketScore: marketScore,
        OpportunityScore: opportunityScore,
        RiskScore: riskScore,
        UrbanScore: urbanScore,
      };
    });

    // Ordenação decrescente por Aderência Territorial (UrbanScore)
    scoredDistricts.sort((a, b) => (b.UrbanScore || 0) - (a.UrbanScore || 0));
    set({ districts: scoredDistricts });
  },
}));

// Initialize active projectId and scores (Triggers initAuth asynchronously)
useUrbanStore.getState().initAuth();
useUrbanStore.getState().initTheme();

