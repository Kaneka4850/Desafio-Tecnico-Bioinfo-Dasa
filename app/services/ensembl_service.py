import requests
import logging
from typing import Dict, Any, Optional, List, Set
from flask import Blueprint, jsonify

# Configuração de Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnsemblService:
    """
    Serviço responsável pela comunicação com a API REST do Ensembl.
    """
    VARIATION_URL: str = "https://rest.ensembl.org/variation/human/"
    HGVS_URL: str = "https://rest.ensembl.org/variation/human/hgvs/"
    VEP_URL: str = "https://rest.ensembl.org/vep/human/id/"
    VEP_HGVS_URL: str = "https://rest.ensembl.org/vep/human/hgvs/"

    @staticmethod
    def get_variant_info(variant_id: str, is_rsid: bool = True) -> Optional[Dict[str, Any]]:
        headers: Dict[str, str] = {
            "Content-Type": "application/json", 
            "User-Agent": "DasaChallenge-Bioinfo/1.0"
        }
        
        try:
            # 1. API VARIATION: Dados gerais e Clínicos
            url = f"{EnsemblService.VARIATION_URL}{variant_id}" if is_rsid else f"{EnsemblService.HGVS_URL}{variant_id}"
            var_response = requests.get(url, headers=headers, timeout=5)
            
            if var_response.status_code != 200:
                logger.warning(f"Variante {variant_id} não encontrada.")
                return None

            var_data: Dict[str, Any] = var_response.json()

            # Para HGVS, as vezes a estrutura vem como array ou dict contendo a variante na chave. 
            # A API HGVS pode retornar um dicionário ou lista, dependendo de como é chamada. 
            # Em python request, se for dict e tiver chave com a variante, extrai os dados.
            if not is_rsid and isinstance(var_data, list):
                var_data = var_data[0]
            elif not is_rsid and variant_id in var_data:
                var_data = var_data[variant_id]

            rsid_found = str(var_data.get("name", variant_id))

            # 2. API VEP: Busca o GENE correto
            gene_symbols: Set[str] = set()
            try:
                vep_url = f"{EnsemblService.VEP_URL}{rsid_found}" if rsid_found.startswith("rs") else f"{EnsemblService.VEP_HGVS_URL}{variant_id}"
                vep_response = requests.get(vep_url, headers=headers, timeout=5)
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

            # MAF: Arredondamento e Chave Correta
            raw_maf = var_data.get("MAF")
            final_maf = round(float(raw_maf), 4) if raw_maf is not None else None

            # 4. Retorno Estruturado
            return {
                "variant_id": variant_id,
                "rsid": rsid_found,
                "chromosome": str(main_mapping.get("seq_region_name", "N/A")),
                "position": int(main_mapping.get("start", 0)),
                "alleles": allele_str,
                "minor_allele_freq": final_maf,
                "genes": final_genes,
                "consequence": str(var_data.get("most_severe_consequence", "N/A")).replace("_", " "),
                "clinical": clinical_clean
            }

        except Exception as e:
            logger.critical(f"ERRO CRÍTICO ao processar {variant_id}: {e}", exc_info=True)
            return None