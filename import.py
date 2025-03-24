import pandas as pd
import json

def convert_cancioneiro_to_json(input_file):
    # Lê o arquivo Excel garantindo que a primeira linha seja o cabeçalho
    df = pd.read_excel(input_file, header=0)

    # Remove espaços dos nomes das colunas
    df.columns = df.columns.str.strip()

    # Lista de colunas de estação
    colunas_estacoes = ['ADVENTO', 'NATAL', 'EPIFANIA', 'QUARESMA', 'PASCOA', 'PENTECOSTES', 'TEMPO COMUM', 'CRIACAO']

    # Processamento dos dados
    dados = []
    for _, row in df.iterrows():
        # Filtrando apenas estações que têm o valor "verdadeiro"
        estacoes = [estacao for estacao in colunas_estacoes if str(row.get(estacao, '')).strip().lower() == 'verdadeiro']

        musica = {
            "nome": row.get('NOME', ''),  # Usa get() para evitar erro caso a coluna não exista
            "autor": row.get('AUTOR', ''),
            "vsCifra": str(row.get('VS E CIFRA', '')).lower(),
            "link": row.get('LINK KIT', ''),
            "estacoes": estacoes,  # Agora só incluirá as estações marcadas como "verdadeiro"
        }
        dados.append(musica)

    return dados

# Convertendo e salvando JSON
dados = convert_cancioneiro_to_json('Cancioneiro.xlsx')
output_file = 'dados.json'

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(dados, f, ensure_ascii=False, indent=2)

print(f"Arquivo JSON salvo com {len(dados)} músicas em {output_file}!")
