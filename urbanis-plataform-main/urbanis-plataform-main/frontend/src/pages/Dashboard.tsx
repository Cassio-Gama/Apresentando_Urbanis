import { useUrbanStore } from "@/store/useUrbanStore";
import { StrategicNarrative } from "@/components/dashboard/StrategicNarrative";
import { RankingChart } from "@/components/charts/RankingChart";
import { CompositionChart } from "@/components/charts/CompositionChart";
import { ChoroplethMap } from "@/components/dashboard/ChoroplethMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MapPin, Users, Activity, Target, ArrowUpRight, Printer, Info } from "lucide-react";
import { getUrbanScoreColor } from "@/lib/colors";

export function Dashboard() {
  const { districts, activeProjectId, projects, activeMapLayer } = useUrbanStore();

  if (!districts || districts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Iniciando Motor de Dados...</p>
        </div>
      </div>
    );
  }

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];


  const topDistrict = districts[0];
  const totalPop = districts.reduce((acc, d) => acc + (d.populacao || 0), 0);
  const avgDens = districts.reduce((acc, d) => acc + (d.dens_demog || 0), 0) / districts.length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 print:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:border-b print:pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 print:hidden">
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded border border-primary/20 uppercase tracking-wider">
              Análise Contextual Territorial
            </span>
          </div>
          <h1 className="text-3xl font-heading text-foreground tracking-tight leading-none uppercase font-black">
            {activeProject ? activeProject.name : "Estudo de Aderência"}
          </h1>
          {activeProject && (
            <div className="text-muted-foreground font-medium text-xs flex flex-wrap gap-x-4 gap-y-1.5 items-center pt-1">
              <span>Segmento: <b className="text-foreground uppercase">{activeProject.segment}</b></span>
              <span className="opacity-20">|</span>
              <span>Objetivo: <b className="text-foreground">{activeProject.strategicGoal}</b></span>
            </div>
          )}
        </div>

        <div className="flex gap-3 print:hidden">
          <button 
            onClick={handlePrint}
            className="h-10 px-4 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-md hover:brightness-110 transition-fast active:scale-95 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Salvar Estudo (PDF)
          </button>
        </div>
      </div>

      {/* Strategic Box */}
      <div className="print:break-inside-avoid">
        <StrategicNarrative topDistrict={topDistrict} segment={activeProject?.segment || "Geral"} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4 print:break-inside-avoid">
        <StatCard
          title="Distritos Analisados"
          value={districts.length.toString()}
          icon={MapPin}
          trend="+0.0%"
        />
        <StatCard
          title="População Total"
          value={totalPop.toLocaleString('pt-BR')}
          icon={Users}
          trend="+2.1%"
        />
        <StatCard
          title="Densidade Média"
          value={Math.round(avgDens).toLocaleString('pt-BR')}
          unit="hab/km²"
          icon={Activity}
          trend="-0.4%"
        />
        <StatCard
          title="Top Aderência"
          value={topDistrict.UrbanScore?.toFixed(1) || "0"}
          unit="%"
          icon={Target}
          trend="+1.2%"
          primary
        />
      </div>

      {/* Map & Top 10 Table */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 print:grid-cols-1 print:gap-4">
        <div className="lg:col-span-3 print:hidden">
          <Card className="h-full">
            <CardHeader className="border-b border-border bg-muted/20 py-4">
              <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Distribuição Territorial de Aderência</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[600px]">
              <ChoroplethMap />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 print:break-inside-avoid">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b border-border bg-muted/20 py-4">
              <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Top 10 Polos de Aderência</CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Distrito</th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {activeMapLayer === 'mobility' ? 'Fluxo/Dia' : activeMapLayer === 'crime' ? 'Ocorrências' : activeMapLayer === 'age' ? 'Idade Média' : 'Aderência'}
                    </th>
                    <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                      {activeMapLayer === 'mobility' ? 'Nº Estações' : activeMapLayer === 'crime' ? 'Nível de Risco' : activeMapLayer === 'age' ? 'Perfil' : 'Status'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {[...districts].sort((a, b) => {
                    if (activeMapLayer === 'mobility') return (b.n_mob || 0) - (a.n_mob || 0);
                    if (activeMapLayer === 'crime') return (b.n_crime || 0) - (a.n_crime || 0);
                    if (activeMapLayer === 'age') return (b.id_media || 0) - (a.id_media || 0);
                    return (b.UrbanScore || 0) - (a.UrbanScore || 0);
                  }).slice(0, 10).map((d) => (
                    <tr key={d.nm_dist} className="hover:bg-muted/30 transition-fast group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-fast">{d.nm_dist}</span>
                          <span className="text-[10px] text-muted-foreground font-mono uppercase">Zona {d.nm_dist.substring(0, 2)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-foreground">
                          {activeMapLayer === 'mobility'
                            ? (d.n_mob ? `${Math.round(Math.exp(d.n_mob) - 1)} mil` : '0')
                            : activeMapLayer === 'crime'
                              ? d.n_crime?.toLocaleString('pt-BR') || 0
                              : activeMapLayer === 'age'
                                ? `${d.id_media?.toFixed(1)} anos`
                                : `${d.UrbanScore?.toFixed(1)}%`
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {activeMapLayer === 'score' ? (
                          <span
                            className="text-[9px] font-bold px-2 py-1 rounded uppercase tracking-tighter"
                            style={{
                              backgroundColor: `${getUrbanScoreColor(d.UrbanScore || 0).replace('rgb', 'rgba').replace(')', ', 0.15)')}`,
                              color: getUrbanScoreColor(d.UrbanScore || 0),
                              border: `1px solid ${getUrbanScoreColor(d.UrbanScore || 0).replace('rgb', 'rgba').replace(')', ', 0.3)')}`
                            }}
                          >
                            {d.UrbanScore! >= 80 ? 'Ideal' :
                              d.UrbanScore! >= 70 ? 'Excelente' :
                                d.UrbanScore! >= 60 ? 'Muito Bom' :
                                  d.UrbanScore! >= 50 ? 'Bom' :
                                    d.UrbanScore! >= 40 ? 'Moderado' :
                                      d.UrbanScore! >= 30 ? 'Regular' :
                                        d.UrbanScore! >= 20 ? 'Atenção' : 'Crítico'}
                          </span>
                        ) : activeMapLayer === 'mobility' ? (
                          <span className="font-mono text-sm font-bold text-foreground">
                            {d.n_stations || 0}
                          </span>
                        ) : activeMapLayer === 'crime' ? (
                          <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-tighter ${(d.n_crime || 0) > 800 ? 'bg-red-600/10 text-red-600 border border-red-600/20' :
                            (d.n_crime || 0) > 400 ? 'bg-red-400/10 text-red-400 border border-red-400/20' :
                              'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                            {(d.n_crime || 0) > 800 ? 'Risco Crítico' : (d.n_crime || 0) > 400 ? 'Alto Risco' : 'Risco Moderado'}
                          </span>
                        ) : (
                          <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-tighter ${(d.id_media || 0) >= 60 ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                            (d.id_media || 0) >= 30 ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                              'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                            }`}>
                            {(d.id_media || 0) >= 60 ? 'Sênior' : (d.id_media || 0) >= 30 ? 'Adulto' : 'Jovem'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-4 print:break-inside-avoid">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-border bg-muted/20 py-4">
            <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Ranking de Aderência por Distrito</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[500px] overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div style={{ height: `${districts.length * 35}px` }}>
              <RankingChart limit={districts.length} />
            </div>
          </CardContent>
        </Card>

        <Card className="print:break-inside-avoid">
          <CardHeader className="border-b border-border bg-muted/20 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Matriz de Ponderação Lógica</CardTitle>
            <div className="relative group/info">
              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
              <div className="absolute right-0 bottom-6 hidden group-hover/info:block w-48 bg-background border border-border p-2.5 rounded shadow-lg text-[9px] leading-relaxed text-muted-foreground z-10">
                Ponderadores fixados com base no perfil operacional metodológico de segmento, impossibilitando arbitrariedade de sliders manuais.
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 h-[500px]">
            <CompositionChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, unit, icon: Icon, trend, primary }: any) {
  return (
    <Card className={`relative overflow-hidden transition-fast group hover:border-primary/50 ${primary ? 'border-primary/30 bg-primary/5' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4 print:mb-2">
          <div className={`p-2 rounded ${primary ? 'bg-primary text-white' : 'bg-muted text-muted-foreground group-hover:text-primary transition-fast'}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-bold font-mono ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'} print:hidden`}>
            <ArrowUpRight className={`w-3 h-3 ${trend.startsWith('+') ? '' : 'rotate-90'}`} />
            {trend}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-bold tracking-tighter">{value}</span>
            {unit && <span className="text-xs text-muted-foreground font-medium">{unit}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
