# 🏙️ Urbanis — Inteligência Territorial e Análise Urbana

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=Streamlit&logoColor=white)](https://streamlit.io/)
[![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![Plotly](https://img.shields.io/badge/Plotly-3F4F75?style=for-the-badge&logo=plotly&logoColor=white)](https://plotly.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)

---

## 📝 Descrição do Projeto

A **Urbanis AI** é uma plataforma exploratória de inteligência territorial desenvolvida para transformar dados brutos em insights estratégicos sobre o município de São Paulo. Utilizando tecnologias modernas de Ciência de Dados, a ferramenta permite uma imersão profunda na dinâmica urbana, demográfica e criminal da metrópole.

O projeto foi concebido como um **Projeto Integrador acadêmico**, com foco em:

- **Análise Urbana**: Compreensão da infraestrutura e ocupação do solo.
- **Apoio Exploratório**: Suporte visual para decisões territoriais e políticas públicas.
- **Visualização de Indicadores**: Dashboards interativos com métricas consolidadas.
- **Segmentação de Regiões**: Identificação de padrões através de algoritmos de agrupamento.
- **Interpretação de Padrões**: Análise crítica de tendências urbanas contemporâneas.

---

## 🎯 Objetivos do Projeto

- [x] **Visualização Territorial**: Mapeamento dinâmico dos distritos de São Paulo.
- [x] **Análise Exploratória**: Ferramentas para investigar correlações entre diferentes indicadores.
- [x] **Inteligência Urbana**: Cálculo de métricas personalizadas como o UrbanScore.
- [x] **Clustering de Regiões**: Agrupamento inteligente de distritos com perfis semelhantes.
- [x] **Integração de Dados Públicos**: Consolidação de fontes variadas (IBGE, SEADE, SSP).
- [x] **Dashboards Interativos**: Interface intuitiva para usuários técnicos e não-técnicos.

---

## 🛠️ Tecnologias Utilizadas

O projeto utiliza um ecossistema robusto de bibliotecas para processamento e visualização:

- **Linguagem**: ![Python](https://img.shields.io/badge/python-3670A0?style=flat-square&logo=python&logoColor=ffdd54)
- **Interface**: ![Streamlit](https://img.shields.io/badge/streamlit-FF4B4B?style=flat-square&logo=streamlit&logoColor=white)
- **Análise de Dados**: ![Pandas](https://img.shields.io/badge/pandas-%23150458.svg?style=flat-square&logo=pandas&logoColor=white)
- **Gráficos e Mapas**: ![Plotly](https://img.shields.io/badge/Plotly-%233F4F75.svg?style=flat-square&logo=plotly&logoColor=white)
- **Machine Learning**: ![Scikit-Learn](https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=flat-square&logo=scikit-learn&logoColor=white)
- **Geolocalização**: `GeoJSON` para delimitação de distritos.
- **Excel/Data**: `OpenPyXL` para processamento de planilhas.

---

## 📊 Estrutura do Dashboard

### ⚡ UrbanScore

Um indicador exploratório de pontuação urbana que avalia o potencial de cada distrito com base em:

- **Densidade Demográfica**: Concentração de habitantes por área.
- **Indicadores Urbanos**: Proxies de infraestrutura e serviços básicos.

### 🗺️ Mapas Geográficos

Visualizações espaciais interativas utilizando arquivos **GeoJSON** dos distritos de São Paulo, permitindo a identificação visual rápida de zonas de interesse e disparidades regionais.

### 🚔 Criminalidade

Módulo dedicado à análise de segurança pública com dados de **Janeiro de 2025**:

- Dados agregados por distrito administrativo.
- Associação entre Delegacias de Polícia (DP) e distritos realizada por **aproximação nominal**.
- > [!NOTE]
  > Este estudo possui finalidade estritamente acadêmica e exploratória, visando a demonstração de técnicas de análise espacial.

### 🤖 Machine Learning (K-Means)

Utilização do algoritmo **K-Means Clustering** para a segmentação automática do território paulistano.

- **Entrada**: Multi-variáveis demográficas e urbanas.
- **Normalização**: Processamento via `MinMaxScaler` para garantir pesos equilibrados.
- **Clusters**: Geração automática de grupos baseados em similaridade estatística.
- **Perfis**: Identificação de perfis territoriais (ex: Alta Densidade/Alta Renda vs. Baixa Infraestrutura).

---

## 📈 Visualizações Existentes

O dashboard oferece uma gama completa de visualizações:

- 🏆 **Ranking UrbanScore**: Comparativo direto entre distritos.
- 📊 **Histogramas**: Distribuição de frequências de indicadores.
- 📍 **Scatter Plot**: Correlação entre variáveis urbanas.
- 🌍 **Mapa Interativo**: Navegação geográfica por distrito.
- 🔴 **Mapa Criminal**: Heatmaps de ocorrências por região.
- 📉 **Ranking de Criminalidade**: Identificação de áreas críticas.
- 👥 **Idade Média**: Perfil demográfico por distrito.

---

## 🗃️ Fontes de Dados

Os dados foram coletados e processados a partir de fontes oficiais e repositórios públicos:

- **IBGE**: Censo Demográfico e indicadores de base.
- **SEADE**: Estatísticas estaduais e municipais.
- **GeoSampa**: Mapa Digital da Cidade de São Paulo.
- **SSP-SP**: Secretaria de Segurança Pública de São Paulo.
- **Shape de Distritos**: [distritos-sp (GitHub)](https://github.com/codigourbano/distritos-sp/tree/master)

---

## 🚀 Como Executar o Projeto

Siga os passos abaixo para configurar o ambiente e rodar a aplicação em sua máquina local.

### 📋 Pré-requisitos

Antes de começar, você precisará ter instalado:

- [Python 3.8+](https://www.python.org/downloads/)
- [pip](https://pip.pypa.io/en/stable/installation/)

### 🔧 Configuração e Execução

1. **Clone o repositório ou baixe os arquivos**:

   ```bash
   git clone <url-do-repositorio>
   ```

2. **Instale as dependências**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Inicie o Dashboard**:
   ```bash
   streamlit run app.py
   ```

Após o comando, o Streamlit abrirá automaticamente no seu navegador padrão em `http://localhost:8501`.

---

## 📂 Estrutura do Projeto

```bash
Urbanis/
│
├── assets/                 # Dados, GeoJSON e recursos visuais
├── app.py                  # Aplicação principal Streamlit
├── requirements.txt        # Dependências do projeto
├── README.md               # Documentação do projeto
└── IA/                     # Modelos e scripts de inteligência artificial
```

---

Desenvolvido por **FourWave** | 🎓 _Projeto Integrador de Ciência de Dados e Big Data_
