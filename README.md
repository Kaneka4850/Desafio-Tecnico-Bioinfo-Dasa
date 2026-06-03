<div align="center">
  <img src="https://img.icons8.com/color/96/000000/dna-helix.png" alt="DNA Logo"/>
  <h1>Buscador Avançado de Variantes Genéticas</h1>
  <p><i>Análise Genômica Potencializada por Inteligência Artificial Integrada</i></p>

  [![Python](https://img.shields.io/badge/Python-3.13-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
  [![React](https://img.shields.io/badge/React-Vite-61DAFB.svg?logo=react&logoColor=white)](https://reactjs.org/)
  [![Flask](https://img.shields.io/badge/Flask-API-black.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
  [![Gemini](https://img.shields.io/badge/Google_Gemini-AI_Insights-orange.svg?logo=google&logoColor=white)](https://aistudio.google.com/)

</div>

<hr/>

## 🧬 Sobre o Projeto
Este é um protótipo robusto de **Bioinformática e Engenharia de Software**. O que antes era uma interface HTML básica evoluiu para uma aplicação *full-stack* completa, onde o **Backend em Flask** atua como uma API REST poderosa e o **Frontend em React** garante uma experiência de usuário visualmente moderna e responsiva (Glassmorphism, Tailwind/CSS focado em azul e branco).

O grande diferencial deste projeto é a integração direta com **Inteligência Artificial (Google Gemini)** para a geração dinâmica de insights clínicos com base em grandes bancos de dados de literatura médica.

## ✨ Funcionalidades Principais

* 🔍 **Suporte Expandido a Nomenclaturas**: Consulta direta de variantes não apenas por **rsID** (`rs1333049`), mas também via **HGVS** (`NM_000546.5:c.215A>G`).
* 🧠 **Integração IA (Gemini)**: "Busca Avançada" que ativa um agente clínico alimentado pelo Google Gemini 1.5/2.5. O modelo correlaciona achados de bancos de dados da literatura (PubMed, NCBI, OncoKB, Scielo) para gerar **Hipóteses Diagnósticas** e recomendar os **Exames Comprobatórios** apropriados.
* 🌐 **Ecossistema de APIs Genômicas**:
  * Consumo central da **Ensembl REST API** para dados básicos, alelos e frequências (MAF).
  * Arquitetura base implementada para **OMIM** (Online Mendelian Inheritance in Man) e **CGI** (Cancer Genome Interpreter).
* 🎨 **Design System Premium**: Frontend refeito do zero, abandonando Jinja2 em prol do React + Vite, apresentando componentes modulares, carregamentos assíncronos dinâmicos e UI polida.

## 🛠 Arquitetura do Sistema

```bash
.
├── backend/                  # (Diretório Root)
│   ├── app/                  # Lógica Central Flask
│   │   ├── routes.py         # Roteamento e unificação da API (REST)
│   │   └── services/         # Handlers de Integração (Ensembl, Gemini, OMIM, CGI)
│   ├── app.py                # Ponto de entrada do Backend
│   └── requirements.txt      # Dependências (google-genai, flask-cors, etc)
│
└── frontend/                 # Ponto de entrada do Frontend React (Vite)
    ├── src/
    │   ├── components/       # Componentes Inteligentes (SearchBar, ClinicalDashboard)
    │   ├── App.jsx           # Componente Root
    │   └── index.css         # UI Design System
    └── package.json
```

## 🚀 Como Executar Localmente

### 1. Preparação do Ambiente
Faça o clone do repositório:
```bash
git clone https://github.com/Kaneka4850/Desafio-Tecnico-Bioinfo-Dasa.git
cd Desafio-Tecnico-Bioinfo-Dasa
```

### 2. Rodando o Backend (Flask / API)
Em um terminal, configure seu ambiente Python e rode:
```bash
# Recomendado usar um virtualenv
pip install -r requirements.txt
python app.py
```
*A API estará ouvindo na porta **5000**.*

### 3. Rodando o Frontend (React / UI)
Em outro terminal, acesse a pasta do frontend e instale as dependências Node:
```bash
cd frontend
npm install
npm run dev
```
*O sistema abrirá automaticamente em seu navegador, normalmente em `http://localhost:5173/`.*

## 🧪 Como Testar a IA

1. Na tela principal, ative a opção **"Ativar Busca Avançada com IA"**.
2. Cole sua `API_KEY` do **Google AI Studio**.
3. Faça a busca por uma variante patogênica famosa, como **`rs80357906`** (ligada ao gene BRCA1).
4. O sistema processará os dados via Ensembl e repassará a bio-assinatura ao Gemini, que renderizará instantaneamente as correlações com a literatura, hipóteses e protocolos médicos!

## 🛡 Testes e Qualidade

O backend conta com cobertura em testes unitários. Para executá-los, utilize o `pytest` no diretório raiz:
```bash
pytest test_services.py
```

<hr/>

<div align="center">
  <p>Desenvolvido para demonstração de capacidade técnica Full-Stack e integração AI na área de Genômica de Precisão.</p>
</div>
