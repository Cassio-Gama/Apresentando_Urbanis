# 📊 Urbanis Dashboard — Frontend Analítico

Este é o diretório da interface **SaaS/BI** do projeto Urbanis. Desenvolvido com uma stack moderna de alta performance para visualização de dados territoriais e inteligência de localização.

---

## 🎨 Design System & UX

A interface foi projetada seguindo os princípios de **Dashboards de Alta Densidade**:
- **Estética Enterprise**: Cores sóbrias, tipografia técnica (`DM Mono` para dados) e headers condensados.
- **Dual Theme**: Suporte total a **Dark Mode** (default para análise) e **Light Mode** (para relatórios e leitura).
- **Semântica Analítica**: Escala de cores `Viridis` e thresholds determinísticos para evitar falsas interpretações de performance.

---

## 🛠️ Stack Tecnológica

- **Core**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **Maps**: [React-Leaflet](https://react-leaflet.js.org/)
- **Charts**: [Recharts](https://recharts.org/)
- **State**: [Zustand](https://github.com/pmndrs/zustand) (Gerenciamento de filtros e temas)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Funcionalidades Principais

### 🗺️ Geo-Intelligence (ChoroplethMap)
Mapa interativo com troca dinâmica de camadas:
- **UrbanScore**: Aderência estratégica (Escala Viridis).
- **Mobilidade**: Fluxo de passageiros e estações (Metrô/Trem 🔵🔴).
- **Segurança**: Calor de ocorrências criminais (Reds).
- **Idade Média**: Perfil demográfico (Blues).

### 📈 Dashboard & Rankings
- Gráficos de barra dinâmicos com suporte a até 30 distritos.
- KPIs em tempo real baseados no segmento de negócio selecionado.
- Recomendações narrativas automatizadas via motor analítico.

### 🔍 Auditoria Cruzada (Compare)
Módulo dedicado para comparação técnica entre dois distritos, com matriz de performance e detalhamento de infraestrutura vs. mercado.

---

## 📂 Estrutura de Pastas

- `src/components/charts`: Componentes Recharts customizados.
- `src/components/dashboard`: Componentes geospaciais e mapa.
- `src/components/layout`: Sidebar, Layout e navegação.
- `src/pages`: Páginas de Dashboard, Comparação e Configurações.
- `src/store`: Estado global via Zustand.
- `src/data`: JSON consolidado gerado pelo motor Python.
- `scripts`: Utilitários para processamento de GeoJSON e coordenadas.

---

## 🔧 Como Iniciar

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Certifique-se de que o arquivo de dados existe**:
   Verifique se `src/data/urbanis_data.json` foi gerado pelo motor principal.

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Build para Produção**:
   ```bash
   npm run build
   ```

---

Desenvolvido por **FourWave** | 🎓 _Urban Intelligence Platform_
