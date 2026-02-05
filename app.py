import os
import webbrowser
from threading import Timer
from flask import Flask
from app.routes import main

# Inicializa a aplicação
app = Flask(__name__, template_folder='templates')
app.secret_key = 'dasa_bioinfo_challenge_secret_key'

# Registra as rotas
app.register_blueprint(main)

def open_browser():
    """
    Abre o navegador padrão automaticamente.
    A verificação 'WERKZEUG_RUN_MAIN' impede que o navegador abra 2 vezes
    quando o Flask reinicia por causa do modo debug.
    """
    if not os.environ.get("WERKZEUG_RUN_MAIN"):
        webbrowser.open_new('http://127.0.0.1:5000/')

if __name__ == "__main__":
    # Agenda a abertura do navegador para 1 segundo após iniciar o app
    Timer(1, open_browser).start()
    
    # Roda a aplicação (apenas localmente)
    app.run(host="0.0.0.0", port=5000, debug=True)