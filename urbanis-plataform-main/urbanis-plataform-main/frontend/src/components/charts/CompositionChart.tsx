import { useUrbanStore, PROFILES } from "@/store/useUrbanStore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export function CompositionChart() {
  const { projects, activeProjectId } = useUrbanStore();
  
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  if (!activeProject) return null;

  const profileData = PROFILES[activeProject.profile];
  if (!profileData) return null;

  const { weights } = profileData;
  const { infra, market, balance, alpha } = weights;

  const data = [
    { name: "INFRAESTRUTURA", value: (infra.dens + infra.mob) * balance.infra * 100, color: "hsl(var(--viz-infra))" },
    { name: "POTENCIAL MERCADO", value: (market.central + market.pop + market.idade) * balance.market * 100, color: "hsl(var(--viz-market))" },
    { name: "PERFIL DE RISCO (α)", value: alpha * 100, color: "hsl(var(--viz-risk))" }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="hsl(var(--card))"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))", 
                borderRadius: "8px",
                fontSize: "10px",
                fontFamily: "DM Mono",
                boxShadow: "none"
              }}
              formatter={(value: any) => [`${Number(value).toFixed(1)}%`, "PESO"]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={45} 
              iconType="circle"
              formatter={(value) => <span className="text-[10px] font-bold text-muted-foreground font-mono">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
