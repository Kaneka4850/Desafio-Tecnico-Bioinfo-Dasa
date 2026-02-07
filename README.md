# Desafio Técnico - Analista de Bioinformática
Este projeto é um protótipo funcional de uma aplicação web desenvolvida em **Python/Flask** para a consulta rápida de variantes genéticas humanas (rsIDs). A aplicação consome dados em tempo real da **Ensembl REST API**.

**Versão Web:** [![AWS](https://img.shields.io/badge/AWS-Clique%20Aqui-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](http://100.48.103.67/)

## Funcionalidades
A aplicação atua como um buscador que padroniza e exibe informações críticas de variantes genéticas. Através de uma interface amigável, o usuário pode consultar:

* **Identificação:** rsID e Alelos.
* **Localização Genômica:** Cromossomo e posição exata.
* **Anotação Biológica:** Genes afetados e consequência molecular.
* **Frequência Populacional:** Minor Allele Frequency (MAF).
* **Link Externo:** Redirecionamento direto para o portal do Ensembl para consulta detalhada.

## Estrutura do projeto
```bash
.
├── app.py
├── Dockerfile
├── README.md
├── requirements.txt
├── test_services.py
├── Variantes teste.tsv
├── .gitattributes
├── .gitignore
│
├── app/
│   ├── __init__.py
│   ├── routes.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   └── ensembl_service.py
│   │
│   ├── templates/
│   │   └── index.html
│   │
│   └── static/
│       └── images/
│           └── DNA.jpg
│
├── tests/
│
├── .vscode/
│   └── settings.json
│
├── .pytest_cache/
│   └── v/
│       └── cache/
│           ├── lastfailed
│           ├── nodeids
│           └── stepwise
│
└── __pycache__/
```
