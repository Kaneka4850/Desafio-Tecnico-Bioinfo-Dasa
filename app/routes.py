import re
from flask import Blueprint, render_template, request, flash, jsonify
from app.services.ensembl_service import EnsemblService

main = Blueprint('main', __name__)

def is_valid_rsid(rsid):
    """
    Valida se o formato é estritamente 'rs' seguido de números.
    Melhora a segurança e evita chamadas inúteis à API externa.
    """
    # Usando raw string (r'') para evitar SyntaxWarning com \d
    return bool(re.match(r'^rs\d+$', rsid))

# --- ROTA DA INTERFACE (HTML) ---
@main.route('/', methods=['GET', 'POST'])
def index():
    """
    Rota para usuários humanos. Retorna HTML renderizado.
    Atende ao requisito: "3. Interface Web"[cite: 29, 30].
    """
    variant_data = None
    rsid_query = None

    if request.method == 'POST':
        # Remove espaços em branco acidentais
        rsid_query = request.form.get('rsid', '').strip()
        
        if rsid_query:
            # Validação com Regex para segurança e performance
            if is_valid_rsid(rsid_query):
                variant_data = EnsemblService.get_variant_info(rsid_query)
                
                # Tratamento de erro se a variante não existir na API 
                if not variant_data:
                    flash(f"Variante {rsid_query} não encontrada na base do Ensembl.", "warning")
            else:
                flash(r"Formato inválido! O ID deve começar com 'rs' seguido de números (ex: rs1333049).", "danger")
                variant_data = None 
        else:
            flash("Por favor, digite um rsID.", "info")

    return render_template('index.html', variant=variant_data, query=rsid_query)

# --- ROTA DA API (JSON) ---
@main.route('/api/<rsid>', methods=['GET'])
def get_variant_json(rsid):
    """
    Rota para máquinas/sistemas. Retorna JSON puro.
    Atende ao requisito: "2. Backend... Retorne um JSON padronizado"[cite: 14, 17].
    """
    clean_rsid = rsid.strip()

    if not is_valid_rsid(clean_rsid):
        return jsonify({
            "error": "Invalid format", 
            "message": r"rsID must match format ^rs\d+$"
        }), 400

    data = EnsemblService.get_variant_info(clean_rsid)
    
    if data:
        return jsonify(data), 200
    else:
        return jsonify({
            "error": "Variant not found", 
            "rsid": clean_rsid
        }), 404