import re
from datetime import datetime
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

@main.route('/api/vcf-upload', methods=['POST'])
def vcf_upload():
    """
    Rota para receber upload de arquivo VCF, extrair as variantes (limitadas a 50) e 
    consultar o Ensembl VEP usando o genoma de referência hg19 (GRCh37).
    """
    if 'file' not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nenhum arquivo selecionado"}), 400
        
    if not (file.filename.endswith('.vcf') or file.filename.endswith('.gvcf')):
        return jsonify({"error": "O arquivo não é um VCF válido. Por favor envie um arquivo com extensão .vcf ou .gvcf."}), 400

    try:
        content = file.read().decode('utf-8')
        lines = content.splitlines()
        
        variants = []
        for line in lines:
            if line.startswith('#'):
                continue
            parts = line.strip().split('\t')
            # VCF format: CHROM POS ID REF ALT QUAL FILTER INFO
            if len(parts) >= 5:
                chrom = parts[0]
                pos = parts[1]
                var_id = parts[2]
                ref = parts[3]
                alt_alleles = parts[4].split(',')
                
                # Ignorar chromossomos não padrão para simplificar ou processar o primeiro alt
                for alt in alt_alleles:
                    # Ensembl VEP format: [chr] [start] [end] [allele1/allele2] [strand]
                    # Format for POST region is typically just space separated
                    # Also handles VCF format if string looks like VCF
                    vcf_line = f"{chrom}\t{pos}\t{var_id}\t{ref}\t{alt}\t.\t.\t."
                    variants.append(vcf_line)
                    
                    if len(variants) >= 50:
                        break
            if len(variants) >= 50:
                break
                
        if not variants:
            return jsonify({"error": "Nenhuma variante encontrada no arquivo."}), 400
            
        results = EnsemblService.process_vcf_variants(variants)
        return jsonify({"variants": results, "filename": file.filename}), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao processar o arquivo: {str(e)}"}), 500

@main.route('/api/generate-report', methods=['POST'])
def generate_report():
    """
    Rota que gera um laudo clínico simulado com base nas variantes de um VCF.
    Filtra apenas variantes Patogênicas, Provavelmente Patogênicas e VUS para economizar tokens.
    """
    data = request.json
    api_key = data.get("api_key")
    variants_data = data.get("variants_data")
    filename = data.get("filename", "Arquivo desconhecido")

    if not api_key:
        return jsonify({"error": "Gemini API Key is required"}), 400
    
    if not variants_data:
        return jsonify({"error": "Variants data is required"}), 400

    # Filtrar apenas variantes clinicamente relevantes para economizar tokens
    relevant_keywords = ['pathogenic', 'likely pathogenic', 'uncertain', 'vus', 'conflicting']
    filtered_variants = []
    for v in variants_data:
        clin = ' '.join(v.get('clinical', [])).lower()
        if any(kw in clin for kw in relevant_keywords):
            filtered_variants.append(v)
    
    if not filtered_variants:
        return jsonify({"error": "Nenhuma variante Patogênica, Provavelmente Patogênica ou VUS encontrada para gerar o laudo."}), 400

    report_date = datetime.now().strftime("%d/%m/%Y %H:%M")

    service = GeminiService(api_key)
    report = service.generate_clinical_report(filtered_variants, filename, report_date)

    if report:
        return jsonify({"report": report, "report_date": report_date, "filename": filename}), 200
    else:
        return jsonify({"error": "Failed to generate report"}), 500