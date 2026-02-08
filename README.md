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
│   .gitattributes
│   .gitignore
│   app.py
│   Dockerfile
│   README.md
│   requirements.txt
│   test_services.py
│   Variantes teste.tsv
│
├───app
│   │   routes.py
│   │   __init__.py
│   │
│   ├───services
│   │       ensembl_service.py
│   │       __init__.py
│   │
│   ├───static
│   │   └───images
│   │           DNA.jpg
│   │
│   └───templates
│           index.html
│
```
## Descrição dos diretórios
`
app/
`
Núcleo da aplicação. Centraliza a lógica de rotas e subpacotes.

``
app/services
``
Camada de serviço. Aqui reside a lógica que "conversa" com a API do Ensembl. Isolar essa lógica facilita a manutenção e testes sem depender da interface web.

``
app/static/images
``
Contém ativos como o favicon e imagens que compõem a identidade visual do buscador.

``
app/templates
``
Contém os arquivos HTML. Utiliza o motor Jinja2 para renderizar os dados das variantes dinamicamente na tela.
