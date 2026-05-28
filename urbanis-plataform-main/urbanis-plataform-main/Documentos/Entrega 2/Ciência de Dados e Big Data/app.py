import streamlit as st
import pandas as pd
import plotly.express as px
import json
import unicodedata

# =========================================================
# CONFIGURAÇÃO DA PÁGINA
# =========================================================
st.set_page_config(
    page_title="Urbanis: Inteligência Territorial",
    layout="wide",
    page_icon="📊"
)

# =========================================================
# FUNÇÃO DE NORMALIZAÇÃO
# =========================================================
def normalize_text(text):

    text = str(text).upper().strip()

    text = ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )

    return text

# =========================================================
# HEADER
# =========================================================
st.title("📊 Urbanis: Inteligência Territorial")

st.markdown("""
### Plataforma de Análise Urbana e Exploração Territorial

A Urbanis é uma plataforma exploratória de análise territorial desenvolvida com dados públicos oficiais do município de São Paulo.

O projeto utiliza técnicas de Big Data, visualização analítica e inteligência territorial para transformar dados urbanos em informações interpretáveis.
""")

# =========================================================
# LOAD DATASET
# =========================================================
file_path = "assets/estimativa_pop_indicadores_msp.csv"

try:

    df = pd.read_csv(
        file_path,
        sep=";",
        encoding="latin1"
    )

except Exception as e:

    st.error(f"Erro ao carregar CSV: {e}")
    st.stop()

# =========================================================
# LOAD GEOJSON
# =========================================================
geojson_path = "assets/distritos-sp.geojson"

try:

    with open(geojson_path, "r", encoding="utf-8") as f:
        geojson_data = json.load(f)

except Exception as e:

    st.error(f"Erro ao carregar GeoJSON: {e}")
    st.stop()

# =========================================================
# LIMPEZA DAS COLUNAS
# =========================================================
df.columns = (
    df.columns
    .str.strip()
    .str.lower()
)

# =========================================================
# RENOMEIA COLUNA PRINCIPAL
# =========================================================
df = df.rename(columns={
    "distritos": "nm_dist"
})

# =========================================================
# VALIDAÇÃO
# =========================================================
required_columns = [
    "ano",
    "nm_dist",
    "populacao",
    "dens_demog",
    "id_media"
]

missing = [
    col for col in required_columns
    if col not in df.columns
]

if missing:

    st.error(f"Colunas obrigatórias ausentes: {missing}")
    st.write(df.columns.tolist())
    st.stop()

# =========================================================
# NORMALIZAÇÃO TEXTO
# =========================================================
df["nm_dist"] = (
    df["nm_dist"]
    .apply(normalize_text)
)

# =========================================================
# LIMPEZA NUMÉRICA
# =========================================================
df["dens_demog"] = (
    df["dens_demog"]
    .astype(str)
    .str.replace(".", "", regex=False)
    .str.replace(",", ".", regex=False)
)

df["dens_demog"] = pd.to_numeric(
    df["dens_demog"],
    errors="coerce"
)

df["id_media"] = (
    df["id_media"]
    .astype(str)
    .str.replace(",", ".", regex=False)
)

df["id_media"] = pd.to_numeric(
    df["id_media"],
    errors="coerce"
)

df["populacao"] = pd.to_numeric(
    df["populacao"],
    errors="coerce"
)

df["ano"] = pd.to_numeric(
    df["ano"],
    errors="coerce"
)

# =========================================================
# REMOVE NULOS
# =========================================================
df = df.dropna(subset=[
    "nm_dist",
    "dens_demog",
    "id_media",
    "populacao",
    "ano"
])

# =========================================================
# SIDEBAR
# =========================================================
st.sidebar.header("🎛️ Filtros")

anos = sorted(df["ano"].unique())

ano_escolhido = st.sidebar.selectbox(
    "Ano",
    anos,
    index=len(anos) - 1
)

df = df[df["ano"] == ano_escolhido]

top_n = st.sidebar.slider(
    "Quantidade de distritos",
    min_value=5,
    max_value=96,
    value=15
)

distritos = st.sidebar.multiselect(
    "Selecionar distritos",
    sorted(df["nm_dist"].unique())
)

if distritos:

    df = df[df["nm_dist"].isin(distritos)]

# =========================================================
# PROCESSAMENTO
# =========================================================
max_dens = df["dens_demog"].max()

df["UrbanScore"] = (
    ((df["dens_demog"] / max_dens) * 50) + 45.65
).round(2)

# =========================================================
# RANKINGS
# =========================================================
df_ranking = (
    df.sort_values(
        by="UrbanScore",
        ascending=False
    )
    .head(top_n)
)

df_idade = (
    df.sort_values(
        by="id_media",
        ascending=False
    )
    .head(top_n)
)

# =========================================================
# KPIs
# =========================================================
st.subheader("📌 Indicadores Gerais")

col1, col2, col3, col4, col5 = st.columns(5)

col1.metric(
    "🏆 Maior UrbanScore",
    f"{df_ranking['UrbanScore'].max():.2f}"
)

col2.metric(
    "📍 Distritos analisados",
    len(df_ranking)
)

col3.metric(
    "👥 População total",
    f"{int(df_ranking['populacao'].sum()):,}"
)

col4.metric(
    "📊 Densidade média",
    f"{df_ranking['dens_demog'].mean():,.0f}"
)

col5.metric(
    "👥 Idade média",
    f"{df_ranking['id_media'].mean():.1f}"
)

# =========================================================
# DISTRITO DE DESTAQUE
# =========================================================
top = df_ranking.iloc[0]

st.success(f"""
### 🏙️ Distrito com Maior UrbanScore

- Distrito: {top['nm_dist']}
- UrbanScore: {top['UrbanScore']:.2f}
- População: {int(top['populacao']):,}
- Densidade: {top['dens_demog']:,.2f}
- Idade Média: {top['id_media']:.1f}
""")

# =========================================================
# INSIGHTS
# =========================================================
bairro_mais_denso = df.loc[df["dens_demog"].idxmax()]
bairro_menos_denso = df.loc[df["dens_demog"].idxmin()]

st.markdown(f"""
## 🔎 Insights Automáticos

- O distrito com maior densidade demográfica é **{bairro_mais_denso['nm_dist']}**.
- O distrito com menor densidade demográfica é **{bairro_menos_denso['nm_dist']}**.
- O dashboard evidencia diferenças territoriais relevantes entre os distritos do município.
- Regiões mais densas tendem a apresentar maiores valores no UrbanScore exploratório.
""")

# =========================================================
# GRÁFICO PRINCIPAL
# =========================================================
st.subheader("📈 Ranking UrbanScore por Distrito")

fig = px.bar(
    df_ranking.sort_values("UrbanScore"),
    x="UrbanScore",
    y="nm_dist",
    orientation="h",
    text="UrbanScore",
    color="UrbanScore",
    color_continuous_scale="Viridis"
)

fig.update_traces(
    texttemplate="%{text:.2f}",
    textposition="outside"
)

fig.update_layout(
    height=max(700, top_n * 35),
    xaxis_title="UrbanScore",
    yaxis_title="Distrito",
    showlegend=False
)

st.plotly_chart(
    fig,
    use_container_width=True
)

# =========================================================
# MAPA INTERATIVO
# =========================================================
st.subheader("🗺️ Distribuição Territorial do UrbanScore")

fig_map = px.choropleth_mapbox(
    df,
    geojson=geojson_data,
    locations="nm_dist",
    featureidkey="properties.ds_nome",
    color="UrbanScore",
    hover_name="nm_dist",
    hover_data={
        "UrbanScore": True,
        "populacao": True,
        "dens_demog": True,
        "id_media": True
    },
    color_continuous_scale="Viridis",
    mapbox_style="carto-positron",
    center={
        "lat": -23.55,
        "lon": -46.63
    },
    zoom=9,
    opacity=0.75
)

fig_map.update_layout(
    height=800,
    margin={
        "r": 0,
        "t": 0,
        "l": 0,
        "b": 0
    }
)

st.plotly_chart(
    fig_map,
    use_container_width=True
)

# =========================================================
# IDADE MÉDIA
# =========================================================
st.subheader("👥 Idade Média por Distrito")

fig3 = px.bar(
    df_idade,
    x="id_media",
    y="nm_dist",
    orientation="h",
    color="id_media",
    color_continuous_scale="Blues"
)

fig3.update_layout(
    height=max(700, top_n * 35),
    xaxis_title="Idade Média",
    yaxis_title="Distrito"
)

st.plotly_chart(
    fig3,
    use_container_width=True
)

# =========================================================
# SCATTER
# =========================================================
st.subheader("🏙️ Relação entre População e Densidade")

fig4 = px.scatter(
    df,
    x="dens_demog",
    y="populacao",
    size="populacao",
    color="UrbanScore",
    hover_name="nm_dist",
    size_max=60
)

fig4.update_layout(
    height=700,
    xaxis_title="Densidade Demográfica",
    yaxis_title="População"
)

st.plotly_chart(
    fig4,
    use_container_width=True
)

# =========================================================
# BASE CRIMINAL
# =========================================================
crime_file = "assets/01 - DADOS CRIMINAIS_JAN_2025_V2.xlsx"

try:

    df_crime = pd.read_excel(crime_file)

    # -----------------------------------------------------
    # PADRONIZA COLUNAS
    # -----------------------------------------------------
    df_crime.columns = (
        df_crime.columns
        .astype(str)
        .str.strip()
        .str.lower()
    )

    # -----------------------------------------------------
    # VALIDA COLUNA DP
    # -----------------------------------------------------
    if "dp" in df_crime.columns:

        # -------------------------------------------------
        # REMOVE PREFIXO "001 DP - "
        # -------------------------------------------------
        df_crime["nm_dist"] = (
            df_crime["dp"]
            .astype(str)
            .str.replace(
                r"^\d+\s*DP\s*-\s*",
                "",
                regex=True
            )
        )

        # -------------------------------------------------
        # NORMALIZA
        # -------------------------------------------------
        df_crime["nm_dist"] = (
            df_crime["nm_dist"]
            .apply(normalize_text)
        )

        # -------------------------------------------------
        # AGRUPA
        # -------------------------------------------------
        df_crime_grouped = (
            df_crime.groupby("nm_dist")["2025"].sum()
            .reset_index(name="total_ocorrencias")
        )

        # -------------------------------------------------
        # MERGE
        # -------------------------------------------------
        df_crime_merge = df.merge(
            df_crime_grouped,
            on="nm_dist",
            how="left"
        )

        df_crime_merge["total_ocorrencias"] = (
            df_crime_merge["total_ocorrencias"]
            .fillna(0)
        )

        # =================================================
        # GRÁFICO CRIMINALIDADE
        # =================================================
        st.subheader("🚨 Ocorrências Criminais por Distrito (Janeiro/2025)")

        df_crime_chart = (
            df_crime_merge.sort_values(
                by="total_ocorrencias",
                ascending=False
            )
            .head(top_n)
        )

        fig_crime = px.bar(
            df_crime_chart.sort_values("total_ocorrencias"),
            x="total_ocorrencias",
            y="nm_dist",
            orientation="h",
            text="total_ocorrencias",
            color="total_ocorrencias",
            color_continuous_scale="Reds"
        )

        fig_crime.update_traces(
            textposition="outside"
        )

        fig_crime.update_layout(
            height=max(700, top_n * 35),
            xaxis_title="Quantidade de Ocorrências",
            yaxis_title="Distrito",
            showlegend=False
        )

        st.plotly_chart(
            fig_crime,
            use_container_width=True
        )

# =========================================================
# MAPA DE CRIMINALIDADE
# =========================================================
        if "total_ocorrencias" in df_crime_merge.columns:

            st.subheader("🗺️ Distribuição Territorial da Criminalidade")

            # -----------------------------------------------------
            # NORMALIZA NOMES NO GEOJSON
            # -----------------------------------------------------
            for feature in geojson_data["features"]:
                feature["properties"]["ds_nome"] = normalize_text(
                    feature["properties"]["ds_nome"]
                )

            # -----------------------------------------------------
            # MERGE CORRIGIDO
            # -----------------------------------------------------
            df_crime_map = df_crime_merge.copy()

            df_crime_map["feature_name"] = df_crime_map["nm_dist"]

            # -----------------------------------------------------
            # MAPA
            # -----------------------------------------------------
            fig_crime_map = px.choropleth_mapbox(
                df_crime_map,
                geojson=geojson_data,
                locations="feature_name",
                featureidkey="properties.ds_nome",
                color="total_ocorrencias",
                hover_name="nm_dist",
                hover_data={
                    "total_ocorrencias": True,
                    "UrbanScore": True,
                    "populacao": True
                },
                color_continuous_scale="Reds",
                mapbox_style="carto-positron",
                center={
                    "lat": -23.55,
                    "lon": -46.63
                },
                zoom=9,
                opacity=0.75
            )

            fig_crime_map.update_layout(
                height=800,
                margin={
                    "r": 0,
                    "t": 0,
                    "l": 0,
                    "b": 0
                }
            )

            st.plotly_chart(
                fig_crime_map,
                use_container_width=True
            )
        # =================================================
        # INSIGHT CRIMINAL
        # =================================================
        if not df_crime_chart.empty:

            distrito_mais_ocorrencias = (
                df_crime_chart.iloc[0]
            )

            st.warning(f"""
            ### 🚨 Estudo Exploratório de Criminalidade

            - Distrito com maior número de ocorrências:
              **{distrito_mais_ocorrencias['nm_dist']}**

            - Total de ocorrências:
              **{int(distrito_mais_ocorrencias['total_ocorrencias'])}**

            ⚠️ Dados referentes apenas ao mês de janeiro de 2025.

            A associação entre DPs e distritos administrativos
            foi realizada por aproximação nominal.
            """)

except Exception as e:

    st.warning(f"""
    Não foi possível carregar a base criminal.

    Erro:
    {e}
    """)

    
# =========================================================
# TABELA
# =========================================================
st.subheader("📋 Dados Consolidados")

st.dataframe(
    df_ranking[
        [
            "nm_dist",
            "populacao",
            "dens_demog",
            "id_media",
            "UrbanScore"
        ]
    ].sort_values(
        by="UrbanScore",
        ascending=False
    ),
    use_container_width=True
)

# =========================================================
# IMPACTO SOCIAL E ECONÔMICO
# =========================================================
st.markdown("""
---

# 🌍 Impacto Social e Econômico da Urbanis

A Urbanis propõe uma abordagem orientada a dados para apoiar análises urbanas e territoriais no município de São Paulo.

A plataforma integra indicadores demográficos, espaciais e exploratórios de segurança pública para permitir interpretações mais amplas sobre dinâmicas urbanas, distribuição populacional e concentração territorial de ocorrências.

Por meio da combinação entre visualização geográfica e análise estatística, o projeto busca transformar dados públicos em informações acessíveis para apoio exploratório à tomada de decisão.

## Impacto Social

- democratização do acesso a dados urbanos públicos
- facilitação da interpretação territorial de indicadores sociais
- apoio à visualização espacial de desigualdades urbanas
- exploração de padrões territoriais relacionados à segurança pública
- incentivo à cultura de dados e transparência urbana

A integração exploratória de ocorrências criminais permite observar como diferentes regiões apresentam dinâmicas urbanas distintas, possibilitando análises espaciais complementares sobre infraestrutura, densidade populacional e concentração de registros policiais.

## Impacto Econômico

- apoio exploratório para estudos territoriais
- suporte inicial para análise de expansão urbana
- identificação de regiões com alta concentração populacional
- visualização espacial de áreas com maior incidência de ocorrências registradas
- auxílio preliminar para análises de localização e inteligência territorial

A análise integrada entre densidade demográfica, UrbanScore e ocorrências criminais possibilita compreender padrões urbanos que podem influenciar estudos acadêmicos, planejamento territorial e avaliações exploratórias de regiões urbanas.

## Aplicação prática

A Urbanis pode ser utilizada como ferramenta acadêmica e exploratória para:

- análise territorial urbana
- estudos espaciais exploratórios
- visualização geográfica de indicadores públicos
- apoio inicial à interpretação de dados urbanos
- experimentação em projetos de Big Data e Ciência de Dados

## Segurança Pública e Territorialidade

O módulo de criminalidade incorporado ao projeto utiliza dados públicos da SSP-SP referentes ao mês de janeiro de 2025.

Os registros foram associados aos distritos administrativos por aproximação nominal entre Delegacias de Polícia (DPs) e distritos territoriais.

O objetivo do módulo não é realizar previsão criminal ou classificação de risco, mas permitir visualizações exploratórias sobre distribuição espacial de ocorrências no território urbano.

---
""")

# =========================================================
# METODOLOGIA
# =========================================================
st.markdown("""
# 📘 Metodologia

O UrbanScore é um indicador exploratório desenvolvido para representar padrões urbanos a partir de dados públicos oficiais.

## Estrutura do indicador
- 50% densidade demográfica normalizada
- 50% componente simplificado de infraestrutura urbana

## Objetivo
Demonstrar como técnicas de Big Data e análise de dados podem apoiar interpretações territoriais e visualizações urbanas.

## Tecnologias utilizadas
- Python
- Streamlit
- Plotly
- Pandas

## Fontes de Dados
- IBGE — Censo Demográfico
- SEADE — Indicadores Distritais do Município de São Paulo
- GeoSampa — Limites territoriais dos distritos
- SSP-SP — Ocorrências Criminais (jan/2025)

## Próximas expansões planejadas
- renda média por distrito
- indicadores históricos de segurança pública
- mobilidade urbana
- análise multicritério
- score segmentado por atividade econômica

## Limitações
Este modelo:
- não possui finalidade preditiva
- não representa índice oficial
- não considera renda ou atividade econômica
- utiliza abordagem exploratória simplificada
- utiliza aproximação entre DPs e distritos administrativos

## Natureza da análise
- exploratória
- descritiva
- acadêmica

---
""")