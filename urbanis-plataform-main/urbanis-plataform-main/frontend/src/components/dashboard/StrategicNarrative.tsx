import type { DistrictData } from "@/types";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface StrategicNarrativeProps {
  topDistrict: DistrictData;
  segment: string;
}

export function StrategicNarrative({ topDistrict, segment }: StrategicNarrativeProps) {
  const score = topDistrict.UrbanScore || 0;
  
  let boxColor, statusLabel, Icon, boxBgClass;
  // Thresholds aligned with app.py
  if (score >= 75) {
    boxColor = "text-[#22C55E]";
    boxBgClass = "bg-[#22C55E]/5";
    statusLabel = "ALTA ADERÊNCIA";
    Icon = CheckCircle2;
  } else if (score >= 50) {
    boxColor = "text-[#EAB308]";
    boxBgClass = "bg-[#EAB308]/5";
    statusLabel = "ADERÊNCIA MODERADA";
    Icon = AlertTriangle;
  } else {
    boxColor = "text-[#EF4444]";
    boxBgClass = "bg-[#EF4444]/5";
    statusLabel = "BAIXA ADERÊNCIA";
    Icon = XCircle;
  }

  const cDesc = topDistrict.central_norm > 0.7 ? "Alta Centralidade Econômica" : topDistrict.central_norm > 0.3 ? "Centralidade em Consolidação" : "Baixa Influência Econômica";
  const mDesc = topDistrict.mob_norm > 0.6 ? "Elevado Fluxo Urbano" : "Fluxo Urbano Localizado";
  const rDesc = (topDistrict.RiskScore || 0) < 0.4 ? "Risco Operacional Controlado" : "⚠️ Alerta de Risco Estrutural";
  const dDesc = topDistrict.dens_norm > 0.6 ? "Alta Densidade de Público" : "Baixa Densidade Populacional";

  return (
    <div 
      className={`p-10 rounded-xl border border-border flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 transition-fast ${boxBgClass}`}
      style={{ borderLeftWidth: '8px', borderLeftColor: 'currentColor' }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Icon className={`w-5 h-5 ${boxColor}`} />
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${boxColor}`}>
            {statusLabel}
          </span>
        </div>
        
        <h2 className="text-5xl md:text-6xl font-heading text-foreground tracking-tighter uppercase leading-none mb-4">
          {topDistrict.nm_dist}
        </h2>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-border flex-1"></div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em]">Auditoria de Performance</span>
          <div className="h-px bg-border flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <NarrativeItem label="Eixo Econômico" value={cDesc} />
          <NarrativeItem label="Índice de Mobilidade" value={mDesc} />
          <NarrativeItem label="Perfil de Segurança" value={rDesc} warning={(topDistrict.RiskScore || 0) >= 0.4} />
          <NarrativeItem label="Demografia" value={dDesc} />
        </div>
      </div>

      <div className="min-w-[240px] bg-background p-8 rounded-lg border border-border text-center flex flex-col items-center shadow-sm">
        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2">
          UrbanScore
        </span>
        <div className={`text-7xl font-mono font-bold tracking-tighter mb-2 ${boxColor}`}>
          {score.toFixed(1)}
        </div>
        <div className="px-3 py-1 rounded bg-muted border border-border text-[9px] font-bold text-muted-foreground tracking-widest uppercase">
          ESTRATÉGIA: {segment}
        </div>
      </div>
    </div>
  );
}

function NarrativeItem({ label, value, warning }: { label: string, value: string, warning?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${warning ? 'bg-red-500' : 'bg-primary'}`}></div>
      <div>
        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm font-medium ${warning ? 'text-red-500' : 'text-foreground'}`}>{value}</p>
      </div>
    </div>
  );
}
