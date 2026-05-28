import { useUrbanStore } from "@/store/useUrbanStore";
import { getUrbanScoreColor } from "@/lib/colors";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface RankingChartProps {
  limit?: number;
}

export function RankingChart({ limit = 10 }: RankingChartProps) {
  const { districts } = useUrbanStore();
  const displayData = districts.slice(0, limit);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={displayData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 30, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-border" opacity={0.5} />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              dataKey="nm_dist"
              type="category"
              axisLine={false}
              tickLine={false}
              width={100}
              tick={{ fill: "currentColor", fontSize: 10, fontWeight: 700, fontFamily: "DM Mono" }}
              className="text-muted-foreground"
            />
            <Tooltip
              cursor={{ fill: "currentColor", opacity: 0.05 }}
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))", 
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "DM Mono",
                boxShadow: "none"
              }}
              formatter={(value: any) => [Number(value).toFixed(1), "ADERÊNCIA (%)"]}
            />
            <Bar
              dataKey="UrbanScore"
              radius={[0, 2, 2, 0]}
              barSize={20}
              label={{ 
                position: 'right', 
                fill: "currentColor", 
                fontSize: 10, 
                fontFamily: "DM Mono",
                formatter: (v: any) => Number(v).toFixed(1) 
              }}
              className="text-foreground"
            >
              {displayData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getUrbanScoreColor(entry.UrbanScore || 0)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
