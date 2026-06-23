<div align="center">
  <img src="https://img.icons8.com/color/96/000000/dna-helix.png" alt="DNA Logo"/>
  <h1>🧬 Buscador Avançado de Variantes Genéticas</h1>
  <p><i>Análise Genômica com Upload de VCF, Anotação VEP (hg19) e Geração de Laudos Clínicos por Inteligência Artificial</i></p>

  [![Python](https://img.shields.io/badge/Python-3.12+-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
  [![React](https://img.shields.io/badge/React_19-Vite-61DAFB.svg?logo=react&logoColor=white)](https://reactjs.org/)
  [![Flask](https://img.shields.io/badge/Flask-API_REST-black.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
  [![Gemini](https://img.shields.io/badge/Google_Gemini_2.5-AI_Insights-orange.svg?logo=google&logoColor=white)](https://aistudio.google.com/)
  [![Ensembl](https://img.shields.io/badge/Ensembl_VEP-GRCh37_(hg19)-green.svg)](https://rest.ensembl.org/)

</div>

<hr/>

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Dependências e Tecnologias](#-dependências-e-tecnologias)
- [Como Executar Localmente](#-como-executar-localmente)
- [Guia de Uso Passo a Passo](#-guia-de-uso-passo-a-passo)
- [APIs Externas Utilizadas](#-apis-externas-utilizadas)
- [Sistema de Cores das Classificações](#-sistema-de-cores-das-classificações)
- [Exportação de Laudos](#-exportação-de-laudos)
- [Testes](#-testes-e-qualidade)
- [Avisos Importantes](#%EF%B8%8F-avisos-importantes)

<hr/>

## 🧬 Sobre o Projeto

Este é um sistema **full-stack de Bioinformática** que permite a análise de variantes genéticas humanas de duas formas:

1. **Busca Individual** — por rsID (`rs80357906`) ou notação HGVS (`NM_000546.5:c.215A>G`).
2. **Upload de Arquivo VCF** — envio de um arquivo `.vcf` ou `.gvcf` para análise em lote de até 50 variantes.

O sistema conecta-se diretamente à **API REST do Ensembl VEP** utilizando o genoma de referência **GRCh37 (hg19)** para obter:
- **Frequência populacional** (gnomAD)
- **Tipo de mutação** (missense, nonsense, frameshift, etc.)
- **Classificação clínica** (Patogênica, Provavelmente Patogênica, VUS, Provavelmente Benigna, Benigna)

Além disso, conta com integração de **Inteligência Artificial (Google Gemini 2.5 Flash)** para:
- Gerar **insights clínicos avançados** para variantes individuais.
- Gerar **laudos clínicos completos** no estilo laboratorial, com base nas variantes do VCF, incluindo assinatura do profissional responsável.

> **⚠️ Nota:** Os laudos gerados por IA são para **fins de pesquisa** e devem ser **revisados por um profissional habilitado** antes de qualquer uso clínico.

## ✨ Funcionalidades Principais

| Funcionalidade | Descrição |
|---|---|
| 🔍 **Busca por rsID / HGVS** | Consulta variantes individuais na API do Ensembl. |
| 📁 **Upload de VCF/GVCF** | Envio de arquivos VCF com validação de extensão (front e backend). Limita a 50 variantes. |
| 🌍 **Frequência Populacional** | Dados do gnomAD via Ensembl VEP (GRCh37/hg19). |
| 🧪 **Tipo de Mutação** | Missense, nonsense, frameshift, splice, intron variant, etc. |
| 🏥 **Classificação Clínica** | Com sistema de cores: Patogênica (🔴), Prov. Patogênica (🟠), VUS (🟡), Benigna (🟢). |
| 🧠 **IA - Insights Clínicos** | Gemini gera hipóteses diagnósticas, exames sugeridos e referências bibliográficas. |
| 📄 **IA - Laudo Clínico** | Geração de laudo completo com Material, Resultados, Interpretação e Assinatura. |
| 🔒 **Filtro de Tokens** | Apenas variantes Patogênicas, Prov. Patogênicas e VUS são enviadas à IA (economia de tokens). |
| 📥 **Exportação PDF / Word** | Laudo exportável em PDF (via html2pdf.js) e Word (.docx via docx/file-saver). |
| ⚙️ **Configuração de API Key** | Modal dedicado para configurar/editar a chave da API do Gemini a qualquer momento. |
| 📅 **Data Automática** | O laudo inclui automaticamente a data e hora reais da geração. |
| 📁 **Nome do Arquivo** | O nome do VCF enviado é salvo e incluído no cabeçalho do laudo. |

## 🛠 Arquitetura do Sistema

```
Desafio-Tecnico-Bioinfo-Dasa/
│
├── app.py                        # Ponto de entrada do Backend (Flask)
├── requirements.txt              # Dependências Python
├── test_services.py              # Testes unitários (pytest)
├── Dockerfile                    # Containerização
├── README.md                     # Este arquivo
│
├── app/                          # Módulo principal do Flask
│   ├── __init__.py               # Fábrica da aplicação (create_app, CORS)
│   ├── routes.py                 # Rotas da API REST
│   │   ├── GET  /api/variant/<id>       → Busca individual (rsID ou HGVS)
│   │   ├── POST /api/advanced-search    → Insights IA (Gemini)
│   │   ├── POST /api/vcf-upload         → Upload e parsing de VCF
│   │   └── POST /api/generate-report    → Geração de laudo clínico IA
│   │
│   └── services/                 # Serviços de integração
│       ├── ensembl_service.py    # API Ensembl (Variation + VEP GRCh37)
│       ├── gemini_service.py     # API Google Gemini (Insights + Laudo)
│       ├── omim_service.py       # Stub para OMIM (futuro)
│       └── cgi_service.py        # Stub para CGI (futuro)
│
└── frontend/                     # Frontend React (Vite)
    ├── package.json              # Dependências Node.js
    ├── vite.config.js            # Configuração do Vite
    └── src/
        ├── main.jsx              # Ponto de entrada React
        ├── App.jsx               # Componente raiz (estado global)
        ├── index.css             # Design System (CSS puro)
        └── components/
            ├── SearchBar.jsx          # Barra de busca rsID/HGVS
            ├── ClinicalDashboard.jsx  # Exibição de variante individual
            ├── GeminiAdvancedInsights.jsx  # Insights IA (variante individual)
            ├── VcfUploader.jsx        # Upload de arquivo VCF
            ├── VcfDashboard.jsx       # Tabela de variantes com cores
            ├── AiClinicalReport.jsx   # Laudo IA + Exportação PDF/Word
            └── ApiKeyConfig.jsx       # Modal de configuração da API Key
```

## 📦 Dependências e Tecnologias

### Backend (Python)

| Pacote | Versão | Finalidade |
|---|---|---|
| `Flask` | 3.1.0 | Framework web para a API REST |
| `flask-cors` | 4.0.0 | Permite requisições cross-origin (React ↔ Flask) |
| `requests` | 2.32.3 | Requisições HTTP para APIs externas (Ensembl) |
| `google-genai` | 0.3.0 | SDK oficial do Google Gemini para geração de conteúdo |
| `Jinja2` | 3.1.5 | Motor de templates (dependência do Flask) |
| `gunicorn` | 23.0.0 | Servidor WSGI para produção |
| `python-dotenv` | 1.0.1 | Carregamento de variáveis de ambiente |
| `pytest` | 8.3.4 | Framework de testes |
| `pytest-mock` | 3.14.0 | Mock para testes unitários |

### Frontend (Node.js / React)

| Pacote | Versão | Finalidade |
|---|---|---|
| `react` | 19.x | Biblioteca de interfaces de usuário |
| `react-dom` | 19.x | Renderização React no DOM |
| `vite` | 8.x | Bundler ultrarrápido para desenvolvimento |
| `axios` | 1.17.x | Requisições HTTP ao backend Flask |
| `react-markdown` | 10.x | Renderização de Markdown (insights e laudos) |
| `lucide-react` | 1.17.x | Ícones modernos (SVG) |
| `html2pdf.js` | 0.14.x | Exportação do laudo em formato PDF |
| `docx` | 9.x | Geração de arquivos Word (.docx) programaticamente |
| `file-saver` | 2.x | Gatilho de download de arquivos no navegador |
| `react-router-dom` | 7.x | Roteamento (base para expansões futuras) |

## 🚀 Como Executar Localmente

### Pré-requisitos

- **Python 3.12+** instalado ([download](https://www.python.org/downloads/))
- **Node.js 18+** e **npm** instalados ([download](https://nodejs.org/))
- **Chave da API do Google Gemini** (gratuita em [Google AI Studio](https://aistudio.google.com/apikey))

### Passo 1 — Clonar o Repositório

```bash
git clone https://github.com/Kaneka4850/Desafio-Tecnico-Bioinfo-Dasa.git
cd Desafio-Tecnico-Bioinfo-Dasa
```

### Passo 2 — Instalar e Rodar o Backend (Flask)

Abra um terminal na raiz do projeto:

```bash
# (Opcional, mas recomendado) Criar ambiente virtual
python -m venv venv

# Ativar o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Instalar dependências Python
pip install -r requirements.txt

# Iniciar o servidor Flask
python app.py
```

✅ O backend estará rodando em **`http://localhost:5000`**.

### Passo 3 — Instalar e Rodar o Frontend (React)

Abra **outro terminal** e navegue até a pasta do frontend:

```bash
cd frontend

# Instalar dependências Node
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

✅ O frontend estará rodando em **`http://localhost:5173`** e abrirá automaticamente no seu navegador.

> **Importante:** Ambos os servidores (Flask na porta 5000 e Vite na porta 5173) devem estar rodando simultaneamente para o sistema funcionar.

## 📖 Guia de Uso Passo a Passo

### 1. Configurar a API Key do Gemini (Opcional, necessário para IA)

1. Acesse [Google AI Studio](https://aistudio.google.com/apikey) e gere uma chave gratuita.
2. No canto superior direito da aplicação, clique no botão **"Configurar API Key"** (ícone de engrenagem ⚙️).
3. Cole sua chave no campo e clique em **"Salvar"**.
4. O botão ficará verde indicando que a chave está configurada.

> A chave fica salva na sessão do navegador e será usada tanto para buscas individuais (Insights IA) quanto para geração de laudos clínicos via VCF.

### 2. Busca Individual por rsID ou HGVS

1. No card da esquerda (**"Pesquisar Variante"**), digite um identificador:
   - Exemplo rsID: `rs80357906`
   - Exemplo HGVS: `NM_000546.5:c.215A>G`
2. (Opcional) Ative o toggle **"Ativar Busca Avançada com IA"** para obter insights gerados pelo Gemini.
3. Clique em **"Buscar Variante"**.
4. O sistema exibirá:
   - **Localização Genômica** (cromossomo, posição, alelos)
   - **Anotação Biológica** (gene, consequência, significância clínica)
   - **Insights Clínicos com IA** (se ativada): hipóteses diagnósticas, exames sugeridos e referências.

### 3. Análise por Arquivo VCF

1. No card da direita (**"Upload de Arquivo VCF"**), clique na área pontilhada ou arraste um arquivo `.vcf` ou `.gvcf`.
2. **Validação automática**: Se o arquivo não for `.vcf` ou `.gvcf`, uma mensagem de erro será exibida e o envio será bloqueado.
3. Ao enviar um VCF válido, o sistema:
   - Faz o parsing do arquivo e extrai **até 50 variantes**.
   - Envia as variantes para a **API Ensembl VEP (GRCh37/hg19)**.
   - Retorna a tabela **"Variantes Identificadas"** com:
     - rsID, Posição, Gene(s), Consequência, MAF (gnomAD) e **Classificação com cores**.

### 4. Gerar Laudo Clínico por IA

1. Com as variantes do VCF carregadas na tela, clique no botão **"Gerar Laudo Clínico IA"**.
2. Se a API Key não estiver configurada, o sistema pedirá automaticamente.
3. **Filtro inteligente**: Apenas variantes **Patogênicas**, **Provavelmente Patogênicas** e **VUS** são enviadas ao Gemini (economia de tokens). Se nenhuma variante relevante for encontrada, será exibida uma mensagem informativa.
4. O Gemini gera um laudo estruturado com:
   - 📋 **Cabeçalho** (nome do arquivo VCF + data/hora da emissão)
   - 🔬 **Material**
   - 📝 **Resumo Clínico**
   - ✅ **Resultados**
   - ⚡ **Achado Incidental** (genes ACMG)
   - 📊 **Variantes Identificadas** (tabela com classificação)
   - 🔎 **Interpretação** (OMIM, ClinVar, gnomAD, critérios ACMG)
   - ✍️ **Assinatura**: Cleber Augusto Muniz Cunha — CRBM: 66297
   - ⚠️ **Aviso**: Laudo gerado por IA para pesquisa, deve ser revisado por profissional habilitado.

### 5. Exportar o Laudo

Após a geração do laudo, dois botões aparecem no canto superior:

| Botão | Formato | Tecnologia |
|---|---|---|
| 🔴 **PDF** | `.pdf` (A4, alta qualidade) | html2pdf.js |
| 🔵 **Word** | `.docx` (editável) | docx + file-saver |

O nome do arquivo exportado será baseado no nome do VCF original (ex: `meu_exoma_laudo.pdf`).

## 🌐 APIs Externas Utilizadas

| API | Endpoint Base | Uso |
|---|---|---|
| **Ensembl Variation** | `https://rest.ensembl.org/variation/human/` | Dados básicos da variante (alelos, MAF, significância) |
| **Ensembl VEP** | `https://rest.ensembl.org/vep/human/id/` | Predição de efeito funcional (gene, consequência) |
| **Ensembl VEP GRCh37** | `https://grch37.rest.ensembl.org/vep/human/region` | Anotação em lote de variantes VCF (hg19) |
| **Google Gemini 2.5 Flash** | Via SDK `google-genai` | Geração de insights e laudos clínicos |

> As APIs do Ensembl são **públicas e gratuitas**, com limites de taxa. O sistema limita a 50 variantes por arquivo VCF para respeitar esses limites.

## 🎨 Sistema de Cores das Classificações

| Classificação | Cor | Hex |
|---|---|---|
| **Patogênica** | 🔴 Vermelho | `#e74c3c` |
| **Provavelmente Patogênica** | 🟠 Laranja | `#e67e22` |
| **VUS** (Significado Incerto) | 🟡 Amarelo | `#f1c40f` |
| **Provavelmente Benigna** | 🟢 Verde | `#2ecc71` |
| **Benigna** | 🟢 Verde | `#2ecc71` |
| **Não Reportada** | ⚪ Cinza | `var(--text-light)` |

## 📥 Exportação de Laudos

### PDF
- Utiliza a biblioteca **html2pdf.js**.
- Captura o conteúdo renderizado do laudo no navegador.
- Gera um PDF em formato A4, alta qualidade (escala 2x).

### Word (.docx)
- Utiliza a biblioteca **docx** para criar o documento programaticamente.
- Converte o Markdown do laudo em parágrafos, headings e bullet points.
- Inclui o aviso de IA em destaque na cor amarela.
- Faz o download automático via **file-saver**.

## 🛡 Testes e Qualidade

O backend conta com cobertura em testes unitários. Para executá-los:

```bash
# Na raiz do projeto
pytest test_services.py
```

## ⚠️ Avisos Importantes

> **Este sistema é uma ferramenta de pesquisa e aprendizado.**
>
> Os laudos gerados por Inteligência Artificial são de caráter **exclusivamente informativo e educacional**. Eles **NÃO substituem** a análise de um profissional habilitado.
>
> Qualquer resultado deve ser **revisado e validado** por um geneticista clínico, biomédico ou médico antes de qualquer decisão clínica.

---

<div align="center">
  <p><b>Desenvolvido por Cleber Augusto Muniz Cunha</b></p>
  <p>CRBM: 66297</p>
  <p><i>Sistema de demonstração de capacidade técnica Full-Stack e integração de IA na área de Genômica de Precisão.</i></p>
</div>
