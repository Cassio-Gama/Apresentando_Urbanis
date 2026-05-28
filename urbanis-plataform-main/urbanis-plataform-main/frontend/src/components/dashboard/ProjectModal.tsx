import React, { useState, useEffect } from 'react';
import { useUrbanStore, PROFILES } from '../../store/useUrbanStore';
import { X, FolderPlus, Compass, Target, Edit3 } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProjectId?: string | null;
}

const SEGMENTS = {
  gym: {
    displayName: "Academia & Wellness",
    profiles: {
      popular: "Consumo de Massa (Popular)",
      premium: "Médio / Alto Padrão (Premium)"
    }
  },
  pharmacy: {
    displayName: "Farmácia & Drogaria",
    profiles: {
      popular: "Consumo de Massa (Popular)",
      premium: "Médio / Alto Padrão (Premium)"
    }
  },
  restaurant: {
    displayName: "Alimentação & Gastronomia",
    profiles: {
      premium: "Médio / Alto Padrão (Premium)"
    }
  },
  retail: {
    displayName: "Varejo & Serviços Gerais",
    profiles: {
      popular: "Consumo de Massa (Popular)"
    }
  },
  logistics: {
    displayName: "Logística & Hub Last-Mile",
    profiles: {
      lastmile: "Last-Mile & Distribuição"
    }
  }
};

const PREDEFINED_GOALS = [
  "Expansão de Capilaridade e Cobertura Territorial",
  "Implantação de Loja Conceito (Flagship Store)",
  "Proximidade e Conveniência Residencial",
  "Otimização de Hub Logístico (Distribuição)",
  "Consolidação de Market Share em Nós Comerciais"
];

export function ProjectModal({ isOpen, onClose, editProjectId }: ProjectModalProps) {
  const { createProject, updateProject, projects } = useUrbanStore();
  
  const [name, setName] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('pharmacy');
  const [selectedEconomicProfile, setSelectedEconomicProfile] = useState('popular');
  const [selectedGoalOption, setSelectedGoalOption] = useState(PREDEFINED_GOALS[0]);
  const [customGoal, setCustomGoal] = useState('');

  const isEditing = !!editProjectId;

  const handleSegmentChange = (segKey: string) => {
    setSelectedSegment(segKey);
    const availableEconProfiles = Object.keys(SEGMENTS[segKey as keyof typeof SEGMENTS].profiles);
    if (!availableEconProfiles.includes(selectedEconomicProfile)) {
      setSelectedEconomicProfile(availableEconProfiles[0]);
    }
  };

  // Pre-populate fields if editing
  useEffect(() => {
    if (isOpen) {
      if (isEditing && editProjectId) {
        const projectToEdit = projects.find(p => p.id === editProjectId);
        if (projectToEdit) {
          setName(projectToEdit.name);
          
          const goal = projectToEdit.strategicGoal || '';
          if (PREDEFINED_GOALS.includes(goal)) {
            setSelectedGoalOption(goal);
            setCustomGoal('');
          } else {
            setSelectedGoalOption('custom');
            setCustomGoal(goal);
          }
          
          const profileKey = projectToEdit.profile || 'pharmacy-popular';
          const parts = profileKey.split('-');
          const seg = parts[0] || 'pharmacy';
          const econ = parts[1] || 'popular';
          
          setSelectedSegment(seg);
          setSelectedEconomicProfile(econ);
        }
      } else {
        // Reset to default on creation
        setName('');
        setSelectedSegment('pharmacy');
        setSelectedEconomicProfile('popular');
        setSelectedGoalOption(PREDEFINED_GOALS[0]);
        setCustomGoal('');
      }
    }
  }, [isOpen, editProjectId, isEditing, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const profileKey = `${selectedSegment}-${selectedEconomicProfile}`;
    const selectedProfile = PROFILES[profileKey];
    
    const finalStrategicGoal = selectedGoalOption === 'custom'
      ? customGoal.trim()
      : selectedGoalOption;

    const payload = {
      name: name.trim(),
      segment: selectedProfile?.displayName || "Geral",
      profile: profileKey,
      strategicGoal: finalStrategicGoal || PREDEFINED_GOALS[0]
    };

    if (isEditing && editProjectId) {
      updateProject(editProjectId, payload);
    } else {
      createProject(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col scale-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-primary/10 text-primary">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <FolderPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-foreground">
                {isEditing ? "Editar Estudo Territorial" : "Novo Estudo Territorial"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditing ? "Atualize as informações do cliente de consultoria" : "Configure a priorização territorial do seu cliente"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-fast"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 bg-card">
          {/* Cliente/Estudo */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Nome do Cliente / Estudo</label>
            <input 
              type="text"
              required
              placeholder="Ex: Drogaria São Paulo - Expansão Centro"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 bg-background border border-border rounded-md text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-fast"
            />
          </div>

          {/* Segmento de Negócio & Perfil Econômico */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Segmento de Negócio</label>
              <div className="relative">
                <select
                  value={selectedSegment}
                  onChange={(e) => handleSegmentChange(e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 bg-background border border-border rounded-md text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-fast appearance-none cursor-pointer"
                >
                  {Object.entries(SEGMENTS).map(([key, val]) => (
                    <option key={key} value={key}>{val.displayName}</option>
                  ))}
                </select>
                <Compass className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Perfil de Consumo Predominante</label>
              <div className="relative">
                <select
                  value={selectedEconomicProfile}
                  onChange={(e) => setSelectedEconomicProfile(e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 bg-background border border-border rounded-md text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-fast appearance-none cursor-pointer"
                >
                  {Object.entries(SEGMENTS[selectedSegment as keyof typeof SEGMENTS].profiles).map(([key, val]) => (
                    <option key={key} value={key}>{val}</option>
                  ))}
                </select>
                <Target className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Objetivo Estrategico */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Objetivo Operacional Estratégico</label>
            <div className="relative">
              <select
                value={selectedGoalOption}
                onChange={(e) => setSelectedGoalOption(e.target.value)}
                className="w-full h-11 px-3.5 pr-10 bg-background border border-border rounded-md text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-fast appearance-none cursor-pointer"
              >
                {PREDEFINED_GOALS.map((g, idx) => (
                  <option key={idx} value={g}>{g}</option>
                ))}
                <option value="custom">Outro (Personalizado)...</option>
              </select>
              <Target className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {selectedGoalOption === 'custom' && (
              <div className="relative animate-in fade-in slide-in-from-top-1 duration-200 mt-2">
                <input 
                  type="text"
                  required
                  placeholder="Digite seu objetivo estratégico personalizado..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="w-full h-11 px-3.5 bg-background border border-border rounded-md text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-fast"
                />
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <footer className="pt-4 border-t border-border flex justify-end gap-3 bg-card mt-2">
            <button 
              type="button"
              onClick={onClose}
              className="h-11 px-5 border border-border bg-background hover:bg-muted text-foreground text-xs font-bold uppercase tracking-widest rounded-md transition-fast active:scale-95"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="h-11 px-6 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-md transition-fast active:scale-95"
            >
              {isEditing ? "Salvar Alterações" : "Confirmar Projeto"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
