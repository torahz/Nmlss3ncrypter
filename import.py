import pandas as pd
import json

def convert_cancioneiro_to_json(input_file):
    # Read the Excel file
    df = pd.read_excel(input_file)
    
    # Processamento dos dados
    dados = []
    colunas_estacoes = ['ADVENTO', 'NATAL', 'EPIFANIA', 'QUARESMA', 'PБSCOA', 'PENTECOSTES', 'TEMPO COMUM', 'CRIAЗГO']
    
    for _, row in df.iterrows():
        estacoes = []
        
        for estacao in colunas_estacoes:
            # Check if the season is True and exists in the row
            if estacao in row.index and pd.notna(row[estacao]) and row[estacao] == 'VERDADEIRO':
                estacoes.append(estacao.upper().replace(' ', '_'))
        
        musica = {
            "nome": row['AUTOR'],
            "autor": row['AUTOR'],
            "vsCifra": str(row.get('VS E CIFRA', '')).lower(),
            "link": row.get('LINK KIT', ''),
            "estacoes": estacoes
        }
        dados.append(musica)
    
    return dados

# Convert and save JSON
dados = convert_cancioneiro_to_json('Cancioneiro.xlsx')
with open('dados.json', 'w', encoding='utf-8') as f:
    json.dump(dados, f, ensure_ascii=False, indent=2)

print(f"Converted {len(dados)} songs to JSON!")
