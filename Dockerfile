# Utilizando a versão solicitada (slim para ser leve e seguro)
FROM python:3.13.0-slim

# Evita que o Python gere arquivos .pyc e permite logs em tempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instala dependências de compilação essenciais
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instala as dependências do projeto
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código fonte para o container
COPY . .

# Cria um usuário para não rodar como root (Segurança Sênior)
RUN useradd -m myuser
USER myuser

# Exposição da porta do Flask
EXPOSE 5000

# Comando para rodar em produção com Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
