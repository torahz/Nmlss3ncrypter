import pandas as pd
import json
import unicodedata

def normalize_header(h):
    """Remove acentos e espaços, retorna em UPPERCASE sem acentos."""
    if pd.isnull(h):
        return ""
    s = str(h).strip()
    s = unicodedata.normalize("NFKD", s).encode("ASCII", "ignore").decode("ASCII")
    return s.upper()

def parse_bool(val):
    """Interpreta vários formatos de verdadeiro como True."""
    if pd.isnull(val):
        return False
    s = str(val).strip().lower()
    return s in {"true", "verdadeiro", "1", "sim", "x"}

# 1) Leitura e normalização de cabeçalhos
df = pd.read_excel("Cancioneiro.xlsx", header=0)
orig_cols = list(df.columns)
df.columns = [normalize_header(c) for c in orig_cols]

# 2) Deteção flexível das colunas básicas
def find_col(keywords):
    """Retorna a primeira coluna que contenha qualquer keyword."""
    for col in df.columns:
        for kw in keywords:
            if kw in col:
                return col
    return None

col_nome      = find_col(["MUSICA", "NOME"])
col_autor     = find_col(["AUTOR"])
col_link      = find_col(["LINK"])
col_vsecfira  = find_col(["VS", "CIFRA"])

if not col_nome or not col_autor or not col_vsecfira:
    raise RuntimeError(
        f"Não foi possível detectar colunas básicas:\n"
        f"  nome={col_nome}, autor={col_autor}, vsEcfira={col_vsecfira}"
    )

# 3) Map de estações (normalizado → rótulo JSON)
EST_LABEL = {
    "ADVENTO":     "ADVENTO",
    "NATAL":       "NATAL",
    "EPIFANIA":    "EPIFANIA",
    "QUARESMA":    "QUARESMA",
    "PASCOA":      "PÁSCOA",
    "PENTECOSTES": "PENTECOSTES",
    "TEMPO COMUM": "TEMPO_COMUM",
    "CRIACAO":     "CRIAÇÃO",
}

# Filtra apenas as colunas de estação presentes no DF
est_cols = {col: label for col,label in EST_LABEL.items() if col in df.columns}

# 4) Montagem da lista de músicas
musicas = []
for _, row in df.iterrows():
    nome = row[col_nome]
    if pd.isnull(nome) or str(nome).strip() == "":
        continue  # ignora linhas sem nome

    autor = row[col_autor]   if pd.notnull(row[col_autor])   else ""
    link  = row[col_link]    if col_link and pd.notnull(row[col_link]) else ""
    vs    = parse_bool(row[col_vsecfira])

    ests = []
    for col,label in est_cols.items():
        if parse_bool(row[col]):
            ests.append(label)

    musicas.append({
        "nome":     str(nome).strip(),
        "autor":    str(autor).strip(),
        "link":     str(link).strip(),
        "vsCifra":  vs,
        "estacoes": ests
    })

# 5) Exporta JSON
with open("dados.json", "w", encoding="utf-8") as f:
    json.dump(musicas, f, ensure_ascii=False, indent=2)

print(f"{len(musicas)} músicas exportadas em 'dados.json'.")
