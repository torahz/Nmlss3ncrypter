import pandas as pd
import json
import unicodedata

# Remove acentos e normaliza
def normalize(text):
    if pd.isnull(text):
        return ""
    txt = str(text).strip()
    return unicodedata.normalize("NFKD", txt).encode("ASCII", "ignore").decode("ASCII")

# Mapeamento: nomes originais → nomes limpos
DISPLAY_MAP = {
    "ADVENTO": "ADVENTO",
    "NATAL": "NATAL",
    "EPIFANIA": "EPIFANIA",
    "QUARESMA": "QUARESMA",
    "PASCOA": "PÁSCOA",
    "PENTECOSTES": "PENTECOSTES",
    "TEMPO COMUM": "TEMPO_COMUM",
    "CRIACAO": "CRIAÇÃO",
}

# Caminho
input_file = "Cancioneiro.xlsx"
df = pd.read_excel(input_file, header=0)

# Normalizar cabeçalhos
df.columns = [normalize(col).upper() for col in df.columns]
print("Colunas encontradas:", df.columns.tolist())  # debug

# Nomes esperados para facilitar acesso
col_nome = next((c for c in df.columns if "NOME" in c), None)
col_autor = next((c for c in df.columns if "AUTOR" in c), None)
col_link = next((c for c in df.columns if "LINK" in c), None)
col_vs = next((c for c in df.columns if "VS" in c), None)

dados = []
for _, row in df.iterrows():
    musica = {
        "nome": str(row.get(col_nome, "")).strip(),
        "autor": str(row.get(col_autor, "")).strip(),
        "link": str(row.get(col_link, "")).strip(),
    }

    # VS e cifra
    vs_raw = str(row.get(col_vs, "")).strip().lower()
    musica["vsCifra"] = vs_raw in ["true", "verdadeiro", "1", "sim", "x"]

    # Estações
    estacoes = []
    for original, display in DISPLAY_MAP.items():
        col_key = next((c for c in df.columns if normalize(c) == original), None)
        if col_key:
            valor = str(row.get(col_key, "")).strip().lower()
            if valor not in ["", "falso", "false", "0"]:
                estacoes.append(display)
    musica["estacoes"] = estacoes

    dados.append(musica)

# Exportar
with open("dados.json", "w", encoding="utf-8") as f:
    json.dump(dados, f, ensure_ascii=False, indent=2)

print("✔ dados.json gerado com sucesso.")
