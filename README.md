# Desafio Técnico - Analista de Bioinformática
Este projeto é um protótipo funcional de uma aplicação web desenvolvida em **Python/Flask** para a consulta rápida de variantes genéticas humanas (rsIDs). A aplicação consome dados em tempo real da **Ensembl REST API**.

[![AWS](https://img.shields.io/badge/Versão_Web-Clique%20Aqui-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](http://100.48.103.67/)

[![YouTube](https://img.shields.io/badge/Vídeo_Demonstração-Clique_Aqui-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/T3RVMzBSX0I)

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

## Preparação do ambiente e instalação de dependencias
Para rodar o buscador, basta seguir o passo a passo. Lembrando que foi testado em uma máquina zerada, sem nenhuma dependencia nativa.
### Passo 1: Preparação do sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### Passo 2: Instalação do Git e do Docker
```bash
sudo apt install git docker.io -y
```

### Passo 3: Configuração de Permissões
```bash
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```
**OBS: Após executar esse comando, feche seu terminal linux e abra novamente**

## Instalação do programa e navegação direta ao diretório correto

### Passo 1: Clonando o projeto
```bash
git clone https://github.com/Kaneka4850/Desafio-Tecnico-Bioinfo-Dasa.git
```
### Passo 2: Entre na pasta

```bash
cd Desafio-Tecnico-Bioinfo-Dasa
```

### Passo 3: Contrução da imagem Docker
```bash
docker build -t bioinfo-dasa .
```
**OBS: Essa etapa pode demorar alguns minutos**

## Colocando o buscador no Ar
### Passo 1: Rodar o buscador
```bash
docker run -d -p 5000:5000 --name app-dasa bioinfo-dasa
```
### Passo 2: Copiar a localhost no seu navegador de preferencia
```web
http://localhost:5000
```

## Testes Unitários
A aplicação conta com uma suíte de testes unitários que validam o consumo da API e o tratamento de dados.

Para rodar os testes via Docker:
```bash
docker exec app-dasa pytest
```
**Resultado esperado: 4 passed. (Nota: Avisos de PytestCacheWarning podem ocorrer devido às permissões de escrita do container, não afetando a integridade dos testes).**

# Exemplos de uso e vizualização do Json
## Segue abaixo os resultados esperados do buscador de variantes, e a explicação de cada um.
### Exemplo 1
<img width="1897" height="909" alt="image" src="https://github.com/user-attachments/assets/9562ff31-52d1-4ea9-83bd-7e61e7bffe26" />
Legenda: Resultado esperado do buscador, note que o MAF ao retornar vazio, ele retorna como N/D


### Exemplo 2
<img width="1919" height="209" alt="image" src="https://github.com/user-attachments/assets/1051bd40-a509-44d8-809c-ff96622cff51" />
Legenda: Json retornado ao pesquisar a variante rs80357906

### Exemplo 3
<img width="1919" height="924" alt="image" src="https://github.com/user-attachments/assets/7b783b27-028d-416c-97f0-cc91bee65a89" />
Legenda: O que aparece caso o usuario digitar algo que não seja uma variante

### Exemplo 4
<img width="1916" height="917" alt="image" src="https://github.com/user-attachments/assets/42c82426-13ff-4d8e-ac77-69a9784f59ba" />
Legenda: O que aparece ao não digitar nada

### Exemplo 5
<img width="1918" height="913" alt="image" src="https://github.com/user-attachments/assets/1428d1d4-c584-49e4-ad00-f289472e3f1c" />
Legenda: O que acontece caso seja digitado uma variante que não existe no banco de dados

**OBS: Caso a API do Ensembl caia, esse erro também pode acontecer, entretanto para diferenciar, o programa ficará rodando por mum espaço de tempo maior e irá retornar esse erro**






