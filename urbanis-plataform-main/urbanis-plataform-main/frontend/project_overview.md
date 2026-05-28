# Urbanis — Inteligência Territorial & Geoanalytics

Este documento serve como um guia consolidado e base de contexto técnico/estratégico para a montagem dos slides de apresentação do projeto **Urbanis**. Ele resume todo o percurso de desenvolvimento, problemas resolvidos, stack tecnológica e a arquitetura final.

---

## 1. Visão Geral do Projeto

O **Urbanis** é uma plataforma SaaS de inteligência territorial e geoanalytics voltada para a análise e ranking de distritos da cidade de São Paulo. Seu objetivo é ajudar investidores, planejadores urbanos e gestores a identificar polos de viabilidade e performance com base em dados demográficos, fluxos de transporte, dados de segurança e o indicador proprietário **UrbanScore**.

---

## 2. O Problema (Antes da Evolução)

Anteriormente, o projeto enfrentava três desafios críticos de usabilidade e engenharia:
1. **Desacoplamento e Backend Pesado:** Havia uma dependência de processamento em Python que tornava a hospedagem web complexa, impedindo o deploy simples em plataformas como a Vercel.
2. **Inconsistência Cognitiva de Cores:** 
   - A escala do mapa e dos rankings ignorava padrões analíticos de BI (ex: misturando vermelho como cor de branding e cor de perigo).
   - A escala do indicador UrbanScore era um gradiente automático (Viridis - roxo a amarelo) confuso para usuários corporativos, que estão acostumados ao padrão semântico universal (Vermelho $\rightarrow$ Amarelo $\rightarrow$ Verde).
3. **Falta de Sincronia Real-Time:** Clicar para alternar a visualização do mapa (ex: ver Mobilidade ou Crime) não atualizava o ranking de distritos na lista lateral. Os componentes funcionavam de forma isolada.

---

## 3. A Solução (Dashboard de Alta Densidade Analítica)

Transformamos o Urbanis em uma **plataforma Jamstack de alta performance**, onde toda a lógica foi otimizada para o lado do cliente (Client-Side), garantindo reatividade instantânea.

### Principais Funcionalidades Implementadas:
*   **Dual Theme System (Dark / Light):** Suporte nativo a Dark Mode (default analítico) e Light Mode (leitura, exportação e apresentação).
*   **Sincronização Cruzada por Zustand:** Ao clicar em qualquer camada de dados no mapa (UrbanScore, Mobilidade, Criminalidade ou Idade Média), a lista lateral **Top 10 Polos de Performance** reordena os distritos e altera suas colunas e dados automaticamente para corresponder ao tema do mapa.
*   **Colunas Mutáveis e Inteligentes (Top 10):**
    *   *Mobilidade:* Mostra a coluna de **Estações** (inteiro absoluto) e **Fluxo/Dia** (formatado em milhares, ex: `550 mil`).
    *   *Criminalidade:* Exibe a coluna de **Ocorrências** e **Nível de Risco** com base em uma régua matemática rigorosa (*Risco Crítico*, *Alto Risco*, *Risco Moderado*).
    *   *Idade Média:* Exibe o **Perfil Demográfico** mapeado segundo critérios do Estatuto da Pessoa Idosa adaptados a médias territoriais (*Longevidade Alta*, *Longevidade Média*, *Perfil Jovem*).
*   **Escala Semântica Unificada (Vermelho $\rightarrow$ Verde):** Substituição completa da escala de cores científica (Viridis) por uma escala baseada no círculo cromático onde **Verde Escuro** representa a performance máxima (Ideal) e **Vermelho** representa a performance mínima (Crítico). Essa escala é compartilhada exatamente entre o Mapa, os Rankings e os Cards de status.
*   **Gráfico de Performance Global:** O dashboard agora exibe um gráfico interativo com **todos os 96 distritos de São Paulo** (sem cortes arbitrários), com scroll vertical suave e dimensionamento dinâmico.

---

## 4. Stack Tecnológica & Arquitetura

Para obter custo zero de infraestrutura e portabilidade absoluta, o projeto foi estruturado assim:

```mermaid
graph TD
    A[Dados Brutos SP / Python Engine] -->|Pré-Processamento| B(Arquivos JSON Estáticos)
    B --> C[Vite / React App]
    subgraph Frontend React (Zero Backend)
        C --> D[Zustand Store - useUrbanStore]
        D --> E[Leaflet Map - Choropleth]
        D --> F[Recharts - Ranking Global]
        D --> G[Tabela Dinâmica - Top 10]
    end
    C --> H[Hospedagem Estática - Vercel / Netlify]
```

### Detalhamento da Stack:
*   **Core:** React (TypeScript) + Vite (empacotador ultra-rápido).
*   **Estilização:** Tailwind CSS + Vanilla CSS para transições e controle do mapa.
*   **Estado Global:** Zustand (gerenciador de estado extremamente leve e reativo).
*   **Visualização Espacial:** React-Leaflet (Leaflet.js) manipulando o GeoJSON das fronteiras de São Paulo.
*   **Visualização de Dados (BI):** Recharts (gráficos de barras e pizza interativos com tooltips customizados).
*   **Ícones:** Lucide React.

---

## 5. Portabilidade & Deploy na Vercel

### Por que esta arquitetura é perfeita para a Vercel?
1. **Sem Dependência de Servidores:** Como eliminamos a necessidade de uma API rodando Python/Flask/FastAPI, não há custos mensais com servidores na nuvem ou risco de indisponibilidade.
2. **Carregamento Instantâneo:** Toda a filtragem de dados e cálculo de fórmulas matemáticas acontece no navegador do cliente em microsegundos.
3. **Deploy Automatizado:** Para publicar na internet, basta subir a pasta `frontend` para o GitHub e linkar à Vercel. O deploy demora menos de 1 minuto, rodando o comando `npm run build` padrão.

---

## 6. Sugestões de Roteiro para a Apresentação (Slides)

Seus colegas de grupo podem estruturar os slides seguindo esta sequência de impacto:

1. **Slide 1: Abertura** — *Urbanis SaaS Dashboard: Inteligência Territorial em Alta Densidade Analítica.*
2. **Slide 2: O Desafio** — *A dor de processar geoanalytics pesados e o ruído visual de escalas de cores confusas.*
3. **Slide 3: Stack & Portabilidade** — *A decisão arquitetural de trazer o motor de cálculo para o React (Client-Side) e viabilizar hospedagem Jamstack estática (Vercel) custo zero.*
4. **Slide 4: Sincronização Cruzada (Demonstração)** — *Como o Zustand amarra a troca de camadas no Mapa com a mudança de colunas e métricas no Top 10 em tempo real.*
5. **Slide 5: O Novo Design System** — *A unificação semântica de cores (Verde Forte = Sucesso; Vermelho = Alerta) no mapa, ranking e cards de performance.*
6. **Slide 6: Resultados & Performance** — *Renderização leve de todos os 96 distritos de SP simultaneamente e suporte nativo a Dual Theme (Dark/Light Mode).*
