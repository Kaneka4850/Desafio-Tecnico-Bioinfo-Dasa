import os
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # CHAVE ESSENCIAL: Sem isso, o Flask gera erro 500 ao usar flash() ou sessions
    app.config['SECRET_KEY'] = os.urandom(24)

    # Registro das rotas
    from .routes import main
    app.register_blueprint(main)

    return app

app = create_app()