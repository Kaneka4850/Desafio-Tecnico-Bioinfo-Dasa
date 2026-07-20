<div align="center">
  <img src="https://img.icons8.com/color/96/000000/dna-helix.png" alt="DNA Logo"/>
  <h1>Buscador Avançado de Variantes Genéticas</h1>
  <p><i>Análise Genômica com Upload de VCF, Anotação VEP (hg19) e Geração de Laudos Clínicos Automatizados</i></p>

  [![Python](https://img.shields.io/badge/Python-3.12+-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
  [![React](https://img.shields.io/badge/React_19-Vite-61DAFB.svg?logo=react&logoColor=white)](https://reactjs.org/)
  [![Flask](https://img.shields.io/badge/Flask-API_REST-black.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
  [![Ensembl](https://img.shields.io/badge/Ensembl_VEP-GRCh37_(hg19)-green.svg)](https://rest.ensembl.org/)

</div>

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Dependências e Tecnologias](#dependências-e-tecnologias)
- [Como Executar Localmente](#como-executar-localmente)
- [Guia de Uso Passo a Passo](#guia-de-uso-passo-a-passo)
- [APIs Externas Utilizadas](#apis-externas-utilizadas)
- [Sistema de Cores das Classificações](#sistema-de-cores-das-classificações)
- [Exportação de Laudos](#exportação-de-laudos)
- [Testes](#testes-e-qualidade)
- [Avisos Importantes](#avisos-importantes)

---

## Sobre o Projeto

Este é um sistema **full-stack de Bioinformática** que permite a análise de variantes genéticas humanas de duas formas:

1. **Busca Individual** por rsID (`rs80357906`) ou notação HGVS (`NM_000546.5:c.215A>G`).
2. **Upload de Arquivo VCF** para análise em lote de até 50 variantes a partir de um arquivo `.vcf` ou `.gvcf`.

O sistema conecta-se diretamente à **API REST do Ensembl VEP** utilizando o genoma de referência **GRCh37 (hg19)** para obter:

- **Frequência populacional** (gnomAD)
- **Tipo de mutação** (missense, nonsense, frameshift, etc.)
- **Classificação clínica** (Patogênica, Provavelmente Patogênica, VUS, Provavelmente Benigna, Benigna)

Além disso, o sistema oferece:

- **Análises clínicas avançadas** para variantes individuais, com base na literatura médica.
- **Laudos clínicos completos** no estilo laboratorial, com base nas variantes do VCF, incluindo assinatura do profissional responsável.

> **Nota:** Os laudos gerados automaticamente são para **fins de pesquisa** e devem ser **revisados por um profissional habilitado** antes de qualquer uso clínico.

## Funcionalidades Principais

| Funcionalidade | Descrição |
|---|---|
| **Busca por rsID / HGVS** | Consulta variantes individuais na API do Ensembl. |
| **Upload de VCF/GVCF** | Envio de arquivos VCF com validação de extensão (front e backend). Limita a 50 variantes. |
| **Frequência Populacional (gnomAD)** | Frequência alélica integrada nativamente via serviço próprio do gnomAD (r4/GRCh38 mapeado). |
| **Tipo de Mutação** | Missense, nonsense, frameshift, splice, intron variant, etc. |
| **Classificação Clínica** | Sistema de cores padronizado: Patogênica, Prov. Patogênica, VUS, Benigna. |
| **Análise Clínica Avançada** | Hipóteses diagnósticas, exames sugeridos e referências bibliográficas. |
| **Laudo Clínico Automatizado** | Geração de laudo completo com Material, Resultados, Interpretação e Assinatura. |
| **Filtro de Relevância** | Apenas variantes Patogênicas, Prov. Patogênicas e VUS são incluídas no laudo (otimização). |
| **Exportação PDF / Word** | Laudo exportável em PDF (via html2pdf.js) e Word (.docx via docx/file-saver). |
| **Configuração de Acesso** | Modal dedicado para configuração da chave de acesso ao serviço de análise. |
| **Design System e Dark Mode** | Interface premium responsiva com suporte nativo a Temas Claro e Escuro. |

## Arquitetura do Sistema

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
│   │   ├── POST /api/advanced-search    → Análise clínica avançada
│   │   ├── POST /api/vcf-upload         → Upload e parsing de VCF
│   │   └── POST /api/generate-report    → Geração de laudo clínico
│   │
│   └── services/                 # Serviços de integração
│       ├── ensembl_service.py    # API Ensembl (Variation + VEP GRCh37)
│       ├── gemini_service.py     # Serviço de geração de análises e laudos
│       ├── gnomad_service.py     # API gnomAD (Frequências populacionais)
│       ├── omim_service.py       # Integração OMIM
│       └── cgi_service.py        # Integração CGI
│
└── frontend/                     # Frontend React (Vite)
    ├── package.json              # Dependências Node.js
    ├── vite.config.js            # Configuração do Vite
    └── src/
        ├── main.jsx              # Ponto de entrada React
        ├── App.jsx               # Componente raiz (estado global)
        ├── index.css             # Design System Completo (CSS puro, tokens de cor)
        └── components/
            ├── SearchBar.jsx          # Barra de busca rsID/HGVS
            ├── ClinicalDashboard.jsx  # Exibição de variante individual
            ├── GeminiAdvancedInsights.jsx  # Análise clínica avançada
            ├── VcfUploader.jsx        # Upload de arquivo VCF
            ├── VcfDashboard.jsx       # Tabela de variantes com cores
            ├── AiClinicalReport.jsx   # Laudo clínico + Exportação PDF/Word
            └── ApiKeyConfig.jsx       # Modal de configuração de acesso
```

## Dependências e Tecnologias

### Backend (Python)

| Pacote | Versão | Finalidade |
|---|---|---|
| `Flask` | 3.1.0 | Framework web para a API REST |
| `flask-cors` | 4.0.0 | Permite requisições cross-origin (React ↔ Flask) |
| `requests` | 2.32.3 | Requisições HTTP para APIs externas (Ensembl) |
| `google-genai` | 0.3.0 | SDK para geração de conteúdo e análises |
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
| `react-markdown` | 10.x | Renderização de Markdown (análises e laudos) |
| `lucide-react` | 1.17.x | Ícones modernos (SVG) |
| `html2pdf.js` | 0.14.x | Exportação do laudo em formato PDF |
| `docx` | 9.x | Geração de arquivos Word (.docx) programaticamente |
| `file-saver` | 2.x | Gatilho de download de arquivos no navegador |
| `react-router-dom` | 7.x | Roteamento (base para expansões futuras) |

## Como Executar Localmente

### Pré-requisitos

- **Python 3.12+** instalado ([download](https://www.python.org/downloads/))
- **Node.js 18+** e **npm** instalados ([download](https://nodejs.org/))
- **Chave de acesso** para o serviço de análise avançada (gratuita em [Google AI Studio](https://aistudio.google.com/apikey))

### Passo 1 · Clonar o Repositório

```bash
git clone https://github.com/Kaneka4850/Desafio-Tecnico-Bioinfo-Dasa.git
cd Desafio-Tecnico-Bioinfo-Dasa
```

### Passo 2 · Instalar e Rodar o Backend (Flask)

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

O backend estará rodando em **`http://localhost:5000`**.

### Passo 3 · Instalar e Rodar o Frontend (React)

Abra **outro terminal** e navegue até a pasta do frontend:

```bash
cd frontend

# Instalar dependências Node
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em **`http://localhost:5173`** e abrirá automaticamente no seu navegador.

> **Importante:** Ambos os servidores (Flask na porta 5000 e Vite na porta 5173) devem estar rodando simultaneamente para o sistema funcionar.

---

## Guia de Uso Passo a Passo

### 1. Configurar a Chave de Acesso (necessário para análise avançada e laudos)

1. Acesse [Google AI Studio](https://aistudio.google.com/apikey) e gere uma chave gratuita.
2. No canto superior direito da aplicação, clique no botão **"Configurações"** (ícone de chave).
3. No modal que será aberto, cole sua chave no campo **"Cole sua chave de acesso aqui..."** e clique em **"Salvar"**.
4. O botão no cabeçalho ficará **verde** com o texto **"Acesso Configurado"**, indicando que a chave está ativa.

> A chave fica salva na sessão do navegador e será utilizada tanto para análises avançadas de variantes individuais quanto para geração de laudos clínicos via VCF.

---

### 2. Busca Individual por rsID ou HGVS

Esta funcionalidade permite consultar dados clínicos e populacionais de uma variante específica.

**Como usar:**

1. Na tela principal, localize o card **"Buscar Variante"** (lado esquerdo).
2. No campo de texto, digite um identificador de variante:
   - **rsID**: `rs80357906`
   - **HGVS**: `NM_000546.5:c.215A>G`
3. *(Opcional)* Ative o toggle **"Busca Avançada"** para obter uma análise clínica complementar com base na literatura médica.
   - Se a chave de acesso não estiver configurada, um alerta amarelo aparecerá orientando a configuração.
4. Clique no botão **"Buscar Variante"**.
5. Aguarde o carregamento. O sistema exibirá:

   **Painel de Informações da Variante:**
   - **Localização Genômica**: cromossomo, posição e alelos (Ref > Alt)
   - **Anotação Biológica**: gene(s) afetado(s), consequência molecular e frequência (MAF)
   - **Classificação Clínica**: badge colorido com a classificação do ClinVar (Ensembl)
   - **Bases de Dados Adicionais**: informações do OMIM e CGI (quando disponíveis)

   **Análise Clínica Avançada** *(se o toggle foi ativado)*:
   - Hipóteses diagnósticas com base na literatura
   - Exames complementares sugeridos
   - Referências bibliográficas

> **Variantes de exemplo para teste:** `rs80357906` (BRCA1, Patogênica), `rs1333049` (CDKN2B-AS1), `rs334` (HBB, Anemia Falciforme), `rs6025` (F5, Fator V de Leiden).

---

### 3. Análise por Arquivo VCF

Esta funcionalidade permite o envio de um arquivo VCF para análise em lote.

**Como usar:**

1. Na tela principal, localize o card **"Upload de Arquivo VCF"** (lado direito).
2. Clique na área pontilhada com o texto **"Clique para selecionar um arquivo VCF"**.
3. Selecione um arquivo com extensão `.vcf` ou `.gvcf` do seu computador.
   - Se o arquivo não tiver a extensão correta, uma mensagem de erro será exibida e o envio será bloqueado.
4. Aguarde o processamento. O sistema irá:
   - Fazer o parsing do arquivo e extrair **até 50 variantes**
   - Enviar as variantes para a **API Ensembl VEP (GRCh37/hg19)**
   - Exibir a tabela **"Variantes Identificadas"** contendo:

| Coluna | Descrição |
|---|---|
| **Variante (rsID)** | Identificador da variante |
| **Posição** | Cromossomo e posição genômica |
| **Gene(s)** | Gene(s) afetado(s) |
| **Consequência** | Tipo de mutação (missense, frameshift, etc.) |
| **MAF (gnomAD)** | Frequência alélica populacional |
| **Classificação** | Badge colorido com ícone de classificação clínica |

---

### 4. Gerar Laudo Clínico

Após o upload e processamento do VCF, você pode gerar um laudo clínico completo.

**Como usar:**

1. Com as variantes do VCF carregadas na tela, clique no botão **"Gerar Laudo Clínico"**.
2. Se a chave de acesso não estiver configurada, o modal de configuração será aberto automaticamente. Configure e salve a chave.
3. Aguarde a geração. Uma animação de carregamento será exibida com a mensagem **"Analisando variantes e redigindo o laudo clínico..."**.
4. **Filtro de relevância**: apenas variantes **Patogênicas**, **Provavelmente Patogênicas** e **VUS** são incluídas na geração do laudo. Se nenhuma variante relevante for encontrada, uma mensagem informativa será exibida.
5. O laudo gerado incluirá:

| Seção | Conteúdo |
|---|---|
| **Cabeçalho** | Nome do arquivo VCF e data/hora da emissão |
| **Material** | Descrição do material analisado |
| **Resumo Clínico** | Visão geral dos achados |
| **Resultados** | Detalhamento das variantes encontradas |
| **Achado Incidental** | Genes ACMG relevantes (quando aplicável) |
| **Variantes Identificadas** | Tabela com classificação detalhada |
| **Interpretação** | Análise com base em OMIM, ClinVar, gnomAD e critérios ACMG |
| **Assinatura** | Cleber Augusto Muniz Cunha · CRBM: 66297 |
| **Aviso** | Laudo gerado automaticamente para pesquisa, deve ser revisado por profissional habilitado |

> **Atenção:** Um aviso em destaque (fundo amarelo) aparecerá acima do laudo informando que ele deve ser revisado antes de uso clínico.

---

### 5. Exportar o Laudo

Após a geração do laudo, dois botões de exportação aparecem no canto superior do card:

| Botão | Formato | Descrição |
|---|---|---|
| **PDF** | `.pdf` (A4, alta qualidade) | Exporta o laudo renderizado como PDF |
| **Word** | `.docx` (editável) | Gera um documento Word editável |

O nome do arquivo exportado será baseado no nome do VCF original (ex: `meu_exoma_laudo.pdf`).

---

### 6. Alternar Tema (Claro / Escuro)

1. No canto superior direito, clique no ícone de **lua** (tema claro) ou **sol** (tema escuro).
2. A preferência de tema é salva automaticamente no navegador e persistida entre sessões.

---

## APIs Externas Utilizadas

| API | Endpoint Base | Uso |
|---|---|---|
| **Ensembl Variation** | `https://rest.ensembl.org/variation/human/` | Dados básicos da variante (alelos, MAF, significância) |
| **Ensembl VEP** | `https://rest.ensembl.org/vep/human/id/` | Predição de efeito funcional (gene, consequência) |
| **Ensembl VEP GRCh37** | `https://grch37.rest.ensembl.org/vep/human/region` | Anotação em lote de variantes VCF (hg19) |
| **Google GenAI SDK** | Via SDK `google-genai` | Geração de análises clínicas e laudos |

> As APIs do Ensembl são **públicas e gratuitas**, com limites de taxa. O sistema limita a 50 variantes por arquivo VCF para respeitar esses limites.

## Sistema de Cores das Classificações

| Classificação | Cor | Hex |
|---|---|---|
| **Patogênica** | Vermelho | `#DC2626` |
| **Provavelmente Patogênica** | Laranja | `#EA580C` |
| **VUS** (Significado Incerto) | Amarelo | `#D97706` |
| **Provavelmente Benigna** | Verde | `#10B981` |
| **Benigna** | Verde | `#059669` |
| **Não Reportada** | Cinza | `#64748B` |

## Exportação de Laudos

### PDF
- Utiliza a biblioteca **html2pdf.js**.
- Captura o conteúdo renderizado do laudo no navegador.
- Gera um PDF em formato A4, alta qualidade (escala 2x).

### Word (.docx)
- Utiliza a biblioteca **docx** para criar o documento programaticamente.
- Converte o Markdown do laudo em parágrafos, headings e bullet points.
- Inclui o aviso de revisão em destaque na cor amarela.
- Faz o download automático via **file-saver**.

## Testes e Qualidade

O backend conta com cobertura em testes unitários. Para executá-los:

```bash
# Na raiz do projeto, com o ambiente virtual ativado
pytest test_services.py
```

## Avisos Importantes

> **Este sistema é uma ferramenta de pesquisa e aprendizado.**
>
> Os laudos gerados automaticamente são de caráter **exclusivamente informativo e educacional**. Eles **NÃO substituem** a análise de um profissional habilitado.
>
> Qualquer resultado deve ser **revisado e validado** por um geneticista clínico, biomédico ou médico antes de qualquer decisão clínica.

---

<div align="center">
  <p><b>Desenvolvido por Cleber Augusto Muniz Cunha</b></p>
  <p>CRBM: 66297</p>
  <p><i>Sistema de demonstração de capacidade técnica Full-Stack na área de Genômica de Precisão.</i></p>
</div>
