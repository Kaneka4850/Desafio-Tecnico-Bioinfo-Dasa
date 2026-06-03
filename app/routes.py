import re
from flask import Blueprint, request, jsonify
from app.services.ensembl_service import EnsemblService
from app.services.gemini_service import GeminiService
from app.services.omim_service import OmimService
from app.services.cgi_service import CgiService

main = Blueprint('main', __name__)

def is_valid_variant(variant_id):
    """
    Valida se o formato é 'rs' seguido de números, ou notação HGVS.
    Ex HGVS: NM_000546.5:c.215A>G
    """
    variant_id = variant_id.strip()
    is_rsid = bool(re.match(r'^rs\d+$', variant_id))
    is_hgvs = bool(re.match(r'^[a-zA-Z0-9_.]+:[cgp]\..+$', variant_id))
    return is_rsid or is_hgvs, is_rsid

@main.route('/api/variant/<path:variant_id>', methods=['GET'])
def get_variant_json(variant_id):
    """
    Rota para buscar dados da variante no Ensembl, OMIM e CGI.
    """
    clean_id = variant_id.strip()
    is_valid, is_rsid = is_valid_variant(clean_id)

    if not is_valid:
        return jsonify({
            "error": "Invalid format", 
            "message": "Variant ID must be an rsID (e.g. rs1333049) or HGVS notation (e.g. NM_000546.5:c.215A>G)"
        }), 400

    # Busca no Ensembl
    data = EnsemblService.get_variant_info(clean_id, is_rsid)
    
    if data:
        # Integração OMIM e CGI (usando stubs no momento)
        rsid_for_others = data.get("rsid", clean_id)
        omim_data = OmimService.get_variant_data(rsid_for_others)
        cgi_data = CgiService.get_variant_data(rsid_for_others)
        
        data["omim"] = omim_data
        data["cgi"] = cgi_data
        
        return jsonify(data), 200
    else:
        return jsonify({
            "error": "Variant not found", 
            "variant_id": clean_id
        }), 404

@main.route('/api/advanced-search', methods=['POST'])
def advanced_search():
    """
    Rota que usa a API do Gemini para gerar insights clínicos baseados na variante.
    """
    data = request.json
    api_key = data.get("api_key")
    variant_data = data.get("variant_data")

    if not api_key:
        return jsonify({"error": "Gemini API Key is required"}), 400
    
    if not variant_data:
        return jsonify({"error": "Variant data is required"}), 400

    service = GeminiService(api_key)
    insights = service.generate_clinical_insights(variant_data)

    if insights:
        return jsonify({"insights": insights}), 200
    else:
        return jsonify({"error": "Failed to generate insights"}), 500