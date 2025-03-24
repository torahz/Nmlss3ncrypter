import json
import pandas as pd

def converter_excel_para_json(caminho_excel, caminho_json):
    """
    Converte um arquivo Excel para JSON, corrigindo problemas de formatação.

    Args:
        caminho_excel (str): O caminho para o arquivo Excel (.xlsx).
        caminho_json (str): O caminho para o arquivo JSON de saída.
    """
    try:
        # Ler o arquivo Excel usando pandas
        df = pd.read_excel(caminho_excel)

        # Converter o DataFrame para um formato de lista de dicionários
        data = df.to_dict(orient='records')

        # Função para limpar e corrigir os dados
        def clean_data(item):
            for key, value in item.items():
                # Converter "None" para None (null em JSON)
                if value == "None":
                    item[key] = None
                # Converter valores NaN para None
                if pd.isna(value):
                    item[key] = None
                # Corrigir links inválidos
                if key == "link" and value == "ALINE BARROS":
                    item[key] = None  # Ou substitua por um link válido, se souber

                # Limpar as estações removendo espaços extras
                if key == 'estacoes' and isinstance(value, list):
                    item[key] = [estacao.strip() for estacao in value if isinstance(estacao, str)]

            return item

        # Aplicar a limpeza aos dados
        cleaned_data = [clean_data(item) for item in data]

        # Escrever os dados para um arquivo JSON
        with open(caminho_json, 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, ensure_ascii=False, indent=4)

        print(f"Arquivo Excel convertido para JSON com sucesso e salvo em: {caminho_json}")

    except FileNotFoundError:
        print(f"Erro: Arquivo não encontrado em {caminho_excel}")
    except Exception as e:
        print(f"Ocorreu um erro: {e}")

# Especificar os caminhos dos arquivos
caminho_excel = 'Cancioneiro.xlsx'
caminho_json = 'dados.json'

# Converter o arquivo
converter_excel_para_json(caminho_excel, caminho_json)
