import pandas as pd
import json
import openpyxl

def convert_cancioneiro_to_json(input_file):
    # Carrega o arquivo Excel usando openpyxl para ler as fórmulas
    workbook = openpyxl.load_workbook(input_file, data_only=False)
    sheet = workbook.active

    # Converte a planilha em uma lista de listas (linhas)
    data = list(sheet.values)

    # Define o cabeçalho
    header = [str(cell).strip() for cell in data[0]]

    # Lista de colunas de estação
    colunas_estacoes = ['ADVENTO', 'NATAL', 'EPIFANIA', 'QUARESMA', 'PASCOA', 'PENTECOSTES', 'TEMPO COMUM', 'CRIACAO']

    # Processamento dos dados
    dados = []

    # Itera sobre as linhas, começando da segunda linha (índice 1)
    for row in data[1:]:
        # Cria um dicionário para cada linha, usando o cabeçalho como chaves
        row_dict = {header[i]: row[i] for i in range(len(header))}

        estacoes = []
        for estacao in colunas_estacoes:
            valor = str(row_dict.get(estacao, '')).strip().upper()
            if valor == '=VERDADEIRO()':
                estacoes.append(estacao)

        musica = {
            "nome": str(row_dict.get('NOME', '')).strip(),
            "autor": str(row_dict.get('AUTOR', '')).strip(),
            "vsCifra": str(row_dict.get('VS E CIFRA', '')).strip().lower(),
            "link": str(row_dict.get('LINK KIT', '')).strip(),
            "estacoes": estacoes
        }

        dados.append(musica)

    return dados

# Convertendo e salvando JSON
dados = convert_cancioneiro_to_json('Cancioneiro.xlsx')

output_file = 'dados.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(dados, f, ensure_ascii=False, indent=2)

print(f"Arquivo JSON salvo com {len(dados)} músicas em {output_file}!")
