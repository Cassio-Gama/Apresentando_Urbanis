import { useEffect, useState, useMemo } from "react";
import { useUrbanStore } from "@/store/useUrbanStore";
import { getUrbanScoreColor } from "@/lib/colors";
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker, Tooltip as LeafletTooltip } from "react-leaflet";
import L from "leaflet";
import { Shield, Users, Target, Plus, Minus, TrainFront } from "lucide-react";

// Fix for default Leaflet icon issue in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});



interface Station {
  name: string;
  lat: number;
  lng: number;
  type: string;
}

export function ChoroplethMap() {
  const { districts, theme, activeMapLayer, setActiveMapLayer, activeProjectId } = useUrbanStore();
  const [geoData, setGeoData] = useState<any>(null);
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    fetch("/distritos-sp.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Erro ao carregar GeoJSON", err));

    fetch("/stations.json")
      .then((res) => res.json())
      .then((data) => setStations(data))
      .catch((err) => console.error("Erro ao carregar estações", err));
  }, []);

  const districtMap = useMemo(() => {
    const map = new Map();
    districts.forEach(d => map.set(d.nm_dist.toUpperCase(), d));
    districts.forEach(d => map.set(d.nm_dist, d));
    return map;
  }, [districts]);

  const getLayerColor = (dData: any) => {
    if (!dData) return theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

    switch (activeMapLayer) {
      case 'score':
        return getUrbanScoreColor(dData.UrbanScore || 0);
      case 'crime':
        const crimeValue = dData.n_crime || 0;
        const crimeT = Math.min(1, crimeValue / 1200); 
        return `rgba(239, 68, 68, ${Math.max(0.2, crimeT)})`;
      case 'age':
        const ageValue = dData.id_media || 35;
        const ageT = Math.max(0, Math.min(1, (ageValue - 30) / 18));
        return `rgba(37, 99, 235, ${Math.max(0.2, ageT)})`;
      case 'mobility':
        const flowValue = dData.n_mob || 0;
        const flowT = Math.min(1, flowValue / 10); // Flow is log1p in data
        return `rgba(16, 185, 129, ${Math.max(0.1, flowT)})`;
      default:
        return "#ccc";
    }
  };

  const mapStyle = (feature: any) => {
    const districtName = feature.properties.ds_nome || feature.properties.NOME_DIST || "";
    const dData = districtMap.get(districtName.toUpperCase()) || districtMap.get(districtName);

    return {
      fillColor: getLayerColor(dData),
      weight: 1,
      opacity: 1,
      color: theme === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      fillOpacity: activeMapLayer === 'mobility' ? 0.4 : 0.8,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const districtName = feature.properties.ds_nome || feature.properties.NOME_DIST || "";
    const dData = districtMap.get(districtName.toUpperCase()) || districtMap.get(districtName);

    if (dData) {
      const score = dData.UrbanScore;
      layer.bindTooltip(
        `<div style="font-family: 'DM Mono', monospace; font-size: 11px; padding: 4px;">
          <b style="font-size: 12px; color: ${theme === 'dark' ? '#fff' : '#000'}">${dData.nm_dist}</b><br/>
          <span style="opacity: 0.7">URBANSCORE:</span> <b style="color: ${getUrbanScoreColor(score || 0)}">${score?.toFixed(1)}</b><br/>
          <hr style="margin: 4px 0; border: 0; border-top: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}" />
          <span style="opacity: 0.7">FLUXO (Diário):</span> ${dData.n_mob ? Math.round(Math.exp(dData.n_mob) - 1) + 'k' : '0'}<br/>
          <span style="opacity: 0.7">ESTAÇÕES:</span> ${dData.n_stations || 0}<br/>
          <span style="opacity: 0.7">CRIME:</span> ${dData.n_crime || 0}
        </div>`,
        { sticky: true, className: 'leaflet-custom-tooltip' }
      );
    }

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: activeMapLayer === 'mobility' ? 0.6 : 1, weight: 2, color: "hsl(var(--primary))" });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: activeMapLayer === 'mobility' ? 0.4 : 0.8, weight: 1, color: theme === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" });
      },
    });
  };

  if (!geoData) return null;

  return (
    <div className="w-full h-full relative group">
      <MapContainer
        key={`${theme}-${activeMapLayer}`}
        center={[-23.5505, -46.6333]}
        zoom={11}
        style={{ width: "100%", height: "100%", background: theme === 'dark' ? "#101113" : "#f8fafc" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url={theme === 'dark' 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
        />
        <GeoJSON
          key={`${theme}-${activeMapLayer}-${activeProjectId}`}
          data={geoData}
          style={mapStyle}
          onEachFeature={onEachFeature}
        />
        
        {/* MOBILITY DOTS (Pontinhos Azuis e Vermelhos) */}
        {activeMapLayer === 'mobility' && stations.map((st, i) => (
          <CircleMarker
            key={`st-${i}`}
            center={[st.lat, st.lng]}
            radius={4}
            fillColor={st.type === 'Metrô' ? '#2563EB' : '#EF4444'}
            color={theme === 'dark' ? '#fff' : '#000'}
            weight={1}
            fillOpacity={1}
          >
            <LeafletTooltip sticky>
              <div className="font-mono text-[10px]">
                <b className="uppercase">{st.name}</b><br/>
                <span className="opacity-70">{st.type.toUpperCase()}</span>
              </div>
            </LeafletTooltip>
          </CircleMarker>
        ))}

        <ZoomHandler />
      </MapContainer>

      {/* Layer Switcher */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
        <LayerButton 
          active={activeMapLayer === 'score'} 
          onClick={() => setActiveMapLayer('score')} 
          icon={Target} 
          label="UrbanScore" 
        />
        <LayerButton 
          active={activeMapLayer === 'mobility'} 
          onClick={() => setActiveMapLayer('mobility')} 
          icon={TrainFront} 
          label="Mobilidade" 
        />
        <LayerButton 
          active={activeMapLayer === 'crime'} 
          onClick={() => setActiveMapLayer('crime')} 
          icon={Shield} 
          label="Criminalidade" 
        />
        <LayerButton 
          active={activeMapLayer === 'age'} 
          onClick={() => setActiveMapLayer('age')} 
          icon={Users} 
          label="Idade Média" 
        />
      </div>
      
      {/* Dynamic Legend */}
      <div className="absolute bottom-6 right-6 bg-card p-5 rounded-lg border border-border z-[1000] min-w-[200px] transition-fast shadow-xl">
        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4">
          {activeMapLayer === 'mobility' ? 'Infraestrutura Metroferroviária' : 'Escala Territorial'}
        </p>
        
        {activeMapLayer === 'mobility' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#2563EB]"></div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Metrô (Pontos Azuis)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">Trem (Pontos Vermelhos)</span>
            </div>
            <div className="pt-2 border-t border-border mt-2">
              <div className="h-2 w-full rounded-sm bg-emerald-500/50"></div>
              <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold mt-1 block">Intensidade de Fluxo</span>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="h-32 w-5 rounded-sm" style={{
              background: activeMapLayer === 'score' 
                ? "linear-gradient(to top, #dc2626, #ea580c, #eab308, #22c55e, #166534)"
                : activeMapLayer === 'crime'
                  ? "linear-gradient(to top, #fee2e2, #ef4444, #991b1b)"
                  : "linear-gradient(to top, #dbeafe, #2563eb, #1e3a8a)"
            }}></div>
            <div className="flex flex-col justify-between text-[10px] font-mono font-bold text-muted-foreground">
              <span>Máx</span>
              <span>Méd</span>
              <span>Mín</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Controls */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
        <MapControls />
      </div>
    </div>
  );
}

function ZoomHandler() {
  const map = useMap();
  useEffect(() => {
    (window as any).leafletMap = map;
  }, [map]);
  return null;
}

function MapControls() {
  const handleZoomIn = () => {
    (window as any).leafletMap?.zoomIn();
  };
  const handleZoomOut = () => {
    (window as any).leafletMap?.zoomOut();
  };

  return (
    <div className="bg-card border border-border p-1 rounded flex flex-col gap-1 shadow-md">
      <button onClick={handleZoomIn} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-fast hover:bg-muted rounded">
        <Plus className="w-4 h-4" />
      </button>
      <div className="h-px bg-border w-full"></div>
      <button onClick={handleZoomOut} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-fast hover:bg-muted rounded">
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
}

function LayerButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`h-10 px-4 rounded-md border flex items-center gap-3 transition-fast shadow-sm ${
        active 
          ? 'bg-primary border-primary text-white' 
          : 'bg-card border-border text-muted-foreground hover:border-primary/50'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
