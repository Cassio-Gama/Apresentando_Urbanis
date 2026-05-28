import { useUrbanStore, PROFILES } from "@/store/useUrbanStore";
import { Map, BarChart3, Settings, Target, FolderPlus, Pencil, Trash2, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/urbanis_logo_transparent.png";

interface SidebarProps {
  onNewProject: () => void;
  onEditProject: (id: string) => void;
}

export function Sidebar({ onNewProject, onEditProject }: SidebarProps) {
  const { 
    projects, 
    activeProjectId, 
    selectProject, 
    deleteProject,
    offlineMode,
    signOut,
    setOfflineMode
  } = useUrbanStore();
  const location = useLocation();

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const profileData = activeProject ? PROFILES[activeProject.profile] : null;

  const navItems = [
    { label: "Visão Geral", to: "/dashboard", icon: BarChart3 },
    { label: "Comparar Distritos", to: "/compare", icon: Map },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#101113] text-slate-200 h-screen flex flex-col fixed left-0 top-0 z-[1001] transition-fast">
      <div className="p-8 pb-4 flex justify-start">
        <img src={logo} alt="Urbanis Logo" className="h-13 w-auto object-contain brightness-110" />
      </div>

      <nav className="mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-8 py-3.5 font-medium text-sm transition-fast relative ${isActive
                ? 'bg-primary/10 text-primary border-l-4 border-primary'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Seção de Gestão de Estudos (UX Upgrade) */}
      <div className="flex-1 px-6 py-6 mt-4 border-t border-white/5 flex flex-col min-h-0">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider mb-3 px-2">
          <span>Meus Estudos</span>
          <button 
            onClick={onNewProject}
            className="p-1 text-slate-400 hover:text-primary hover:bg-white/5 rounded transition-fast active:scale-95"
            title="Novo Estudo Territorial"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-1 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-white/5">
          {projects.map((p) => {
            const isActive = p.id === activeProjectId;
            return (
              <div 
                key={p.id}
                onClick={() => selectProject(p.id)}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-fast group ${
                  isActive 
                    ? 'bg-primary/10 border-l-2 border-primary' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex-1 min-w-0 pr-1">
                  <div className={`text-xs truncate font-sans capitalize transition-fast ${
                    isActive ? 'text-white font-bold' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {p.name}
                  </div>
                  <div className={`text-[9px] font-mono uppercase tracking-wider truncate transition-fast ${
                    isActive ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'
                  }`}>
                    {p.segment}
                  </div>
                </div>
                
                {/* Ações Rápidas no Hover */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-fast">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProject(p.id);
                    }}
                    className="p-0.5 hover:text-primary rounded hover:bg-white/5 text-slate-500 transition-fast"
                    title="Editar Estudo"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  {projects.length > 1 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(p.id);
                      }}
                      className="p-0.5 hover:text-red-500 rounded hover:bg-white/5 text-slate-500 transition-fast"
                      title="Excluir Estudo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeProject && (
        <div className="p-6 border-t border-white/5 bg-[#16181B]/40 space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-widest">
              Contexto do Estudo
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Perfil */}
            <div className="space-y-1">
              <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <Target className="w-3 h-3 text-primary" />
                Perfil Ativo
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {profileData?.displayName || "Nenhum"}
              </div>
            </div>

            {/* Objetivo */}
            <div className="space-y-1">
              <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                <Map className="w-3 h-3 text-emerald-500" />
                Objetivo do Estudo
              </div>
              <div className="text-xs font-semibold text-slate-300 line-clamp-2 leading-relaxed" title={activeProject.strategicGoal}>
                {activeProject.strategicGoal}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Simple Logout (Clean UX) */}
      <div className="p-4 border-t border-white/5 bg-[#121316]/50">
        <button 
          onClick={offlineMode ? () => setOfflineMode(false) : signOut}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg border border-transparent hover:border-white/5 hover:bg-white/5 text-slate-400 hover:text-primary transition-fast active:scale-95 text-xs font-semibold"
          title={offlineMode ? "Conectar ao Banco de Dados Nuvem" : "Encerrar Sessão Segura (Logout)"}
        >
          <LogOut className="w-4 h-4" />
          <span>{offlineMode ? "Conectar à Nuvem" : "Sair do Sistema"}</span>
        </button>
      </div>
    </aside>
  );
}
