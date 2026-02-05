import requests
import logging
from typing import Dict, Any, Optional, List, Set
from flask import Blueprint, jsonify # Blueprint é o padrão para organizar rotas

# Definindo o Blueprint para as rotas (se estiver em um arquivo separado)
main = Blueprint('main', __name__)

@main.route('/debug/<rsid>')
def debug_json(rsid):
    service = EnsemblService()
    # ✅ Corrigido para bater com o nome do método abaixo
    variant_data = service.get_variant_info(rsid) 
    return jsonify(variant_data)

# Configuração de Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnsemblService:
    """
    Serviço responsável pela comunicação com a API REST do Ensembl.
    """
    VARIATION_URL: str = "https://rest.ensembl.org/variation/human/"
    VEP_URL: str = "https://rest.ensembl.org/vep/human/id/"

    @staticmethod
    def get_variant_info(rsid: str) -> Optional[Dict[str, Any]]:
        headers: Dict[str, str] = {
            "Content-Type": "application/json", 
            "User-Agent": "DasaChallenge-Bioinfo/1.0"
        }
        
        try:
            # 1. API VARIATION: Dados gerais e Clínicos
            var_response = requests.get(
                f"{EnsemblService.VARIATION_URL}{rsid}", 
                headers=headers, 
                timeout=5 
            )
            
            if var_response.status_code != 200:
                logger.warning(f"Variante {rsid} não encontrada.")
                return None

            var_data: Dict[str, Any] = var_response.json()

            # 2. API VEP: Busca o GENE correto
            gene_symbols: Set[str] = set()
            try:
                vep_response = requests.get(
                    f"{EnsemblService.VEP_URL}{rsid}", 
                    headers=headers, 
                    timeout=5
                )
                if vep_response.status_code == 200:
                    for item in vep_response.json():
                        for transcript in item.get('transcript_consequences', []):
                            gene = transcript.get('gene_symbol')
                            if gene:
                                gene_symbols.add(gene)
            except Exception as e:
                logger.error(f"Falha não-bloqueante no VEP: {e}")

            final_genes = sorted(list(gene_symbols)) if gene_symbols else ["Intergenic"]

            # 3. Tratamento de Dados
            mappings = var_data.get('mappings', [])
            main_mapping = mappings[0] if mappings else {}
            
            # Formatação de Alelos
            allele_str = main_mapping.get("allele_string", "")
            if "/" in allele_str:
                parts = allele_str.split("/")
                allele_str = f"{parts[0]} > {'/'.join(parts[1:])}"

            # Limpeza de Significância Clínica
            raw_clinical = var_data.get("clinical_significance", [])
            blacklist = {'not provided', 'other'}
            filtered = {
                term.replace("_", " ") for term in raw_clinical 
                if term.lower().replace("_", " ") not in blacklist
            }
            clinical_clean = sorted(list(filtered)) if filtered else ["Não reportada"]

            # ✅ MAF: Arredondamento e Chave Correta
            raw_maf = var_data.get("MAF")
            final_maf = round(float(raw_maf), 4) if raw_maf is not None else None

            # 4. Retorno Estruturado
            return {
                "rsid": str(var_data.get("name", rsid)),
                "chromosome": str(main_mapping.get("seq_region_name", "N/A")),
                "position": int(main_mapping.get("start", 0)),
                "alleles": allele_str,
                "minor_allele_freq": final_maf,
                "genes": final_genes,
                "consequence": str(var_data.get("most_severe_consequence", "N/A")).replace("_", " "),
                "clinical": clinical_clean
            }

        except Exception as e:
            logger.critical(f"ERRO CRÍTICO ao processar {rsid}: {e}", exc_info=True)
            return None