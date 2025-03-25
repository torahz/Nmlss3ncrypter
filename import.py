import pandas as pd
import json

# Lê a planilha "Cancioneiro.xlsx" considerando que a primeira linha contém os títulos.
df = pd.read_excel("Cancioneiro.xlsx", header=0)

# Exibe as colunas encontradas para conferência
print("Colunas encontradas:", df.columns.tolist())

dados = []
for index, row in df.iterrows():
    musica = {}
    
    # Mapeamento dos campos básicos:
    # Coluna A: NOME => "nome"
    musica["nome"] = str(row["NOME"]).strip() if pd.notnull(row["NOME"]) else ""
    
    # Coluna B: AUTOR => "autor"
    musica["autor"] = str(row["AUTOR"]).strip() if pd.notnull(row["AUTOR"]) else ""
    
    # Coluna C: LINK KIT => "link"
    musica["link"] = str(row["LINK KIT"]).strip() if pd.notnull(row["LINK KIT"]) else ""
    
    # Coluna D: VS E CIFRA => vsCifra (verdadeiro ou falso)
    vs_val = row["VS E CIFRA"]
    if pd.isnull(vs_val):
        musica["vsCifra"] = False
    else:
        # Se for booleano, usa o valor; se for texto, considera "verdadeiro", "true" ou "1" como True.
        if isinstance(vs_val, bool):
            musica["vsCifra"] = vs_val
        else:
            musica["vsCifra"] = str(vs_val).strip().lower() in ["verdadeiro", "true", "1"]
    
    # Processamento das estações (colunas E a L)
    # Colunas: ADVENTO, NATAL, EPIFANIA, QUARESMA, PASCOA, PENTECOSTES, TEMPO COMUM, CRIACAO
    estacoes = []
    station_columns = ["ADVENTO", "NATAL", "EPIFANIA", "QUARESMA", "PASCOA", "PENTECOSTES", "TEMPO COMUM", "CRIACAO"]
    for col in station_columns:
        val = row[col]
        if pd.notnull(val):
            # Se o valor for booleano e True, ou se for texto indicando verdade
            is_true = False
            if isinstance(val, bool):
                is_true = val
            else:
                is_true = str(val).strip().lower() in ["verdadeiro", "true", "1"]
            if is_true:
                # Ajusta o nome "TEMPO COMUM" para "TEMPO_COMUM" conforme o layout do site
                if col == "TEMPO COMUM":
                    estacoes.append("TEMPO_COMUM")
                else:
                    estacoes.append(col)
    musica["estacoes"] = estacoes
    
    dados.append(musica)

# Salva os dados extraídos em um arquivo JSON com identação e codificação UTF-8
with open("dados.json", "w", encoding="utf-8") as f:
    json.dump(dados, f, ensure_ascii=False, indent=2)

print("Conversão concluída! Verifique o arquivo 'dados.json'.")
