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

    @staticmethod
    def process_vcf_variants(vcf_lines: List[str]) -> List[Dict[str, Any]]:
        """
        Recebe uma lista de strings de VCF (ex: chr pos id ref alt) e
        envia para a API VEP do Ensembl (GRCh37/hg19).
        """
        url = "https://grch37.rest.ensembl.org/vep/human/region"
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "DasaChallenge-Bioinfo/1.0"
        }
        
        # Como o Ensembl VEP aceita VCF, mas as vezes o POST array precisa
        # estar no formato exato deles. Vamos usar o param VCF se possível
        # ou o default deles: "[chr] [start] [end] [allele1/allele2] [strand]"
        # Mas para simplificar, a documentação diz que podemos enviar um json com 
        # {"variants" : ["1 120468259 . C T . . ."], "hgvs": 1} - se formos usar VCF string
        # A forma mais robusta é passar o ID ou só a região. 
        # Vamos passar as linhas cruas de VCF caso a API aceite, ou montar string padrão Ensembl.
        
        ensembl_variants = []
        for line in vcf_lines:
            parts = line.split('\t')
            if len(parts) >= 5:
                chrom = parts[0]
                pos = parts[1]
                var_id = parts[2]
                ref = parts[3]
                alt = parts[4]
                
                # Se for inserção ou deleção complexa, o cálculo de start/end muda.
                # Para simplificar na prova de conceito, enviaremos a string do VCF mesmo.
                # A API VEP suporta POST de VCF strings se os dados estiverem separados por espaço/tab.
                ensembl_variants.append(f"{chrom} {pos} {var_id} {ref} {alt} . . .")

        payload = {
            "variants": ensembl_variants,
            # params para retornar o que precisamos
            "af_gnomad": True,
            "hgvs": True,
            "vcf_string": True
        }

        results = []
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=20)
            if response.status_code == 200:
                data = response.json()
                for item in data:
                    # Extrair informações
                    input_variant = item.get("input", "")
                    colocated = item.get("colocated_variants", [])
                    
                    rsid = "Desconhecido"
                    clin_sig = ["Não reportada"]
                    minor_allele_freq = "N/A"
                    
                    for cv in colocated:
                        if cv.get("id", "").startswith("rs"):
                            rsid = cv.get("id")
                        if "clin_sig" in cv:
                            clin_sig_raw = cv["clin_sig"]
                            if isinstance(clin_sig_raw, list):
                                clin_sig = [cs.replace("_", " ") for cs in clin_sig_raw]
                            else:
                                clin_sig = [clin_sig_raw.replace("_", " ")]
                        if "gnomad_af" in cv or "minor_allele_freq" in cv:
                            minor_allele_freq = cv.get("gnomad_af", cv.get("minor_allele_freq", "N/A"))
                    
                    consequences_set = set()
                    genes_set = set()
                    
                    for tc in item.get("transcript_consequences", []):
                        if "consequence_terms" in tc:
                            for term in tc["consequence_terms"]:
                                consequences_set.add(term.replace("_", " "))
                        if "gene_symbol" in tc:
                            genes_set.add(tc["gene_symbol"])
                            
                    consequences = sorted(list(consequences_set)) if consequences_set else ["N/A"]
                    genes = sorted(list(genes_set)) if genes_set else ["Intergenic"]
                    
                    # Identificar o cromossomo e posição e ref/alt da entrada
                    in_parts = input_variant.split()
                    chrom = in_parts[0] if len(in_parts) > 0 else "N/A"
                    pos = in_parts[1] if len(in_parts) > 1 else 0
                    ref = in_parts[3] if len(in_parts) > 3 else "N/A"
                    alt = in_parts[4] if len(in_parts) > 4 else "N/A"

                    results.append({
                        "variant_id": rsid if rsid != "Desconhecido" else input_variant,
                        "rsid": rsid,
                        "chromosome": chrom,
                        "position": int(pos),
                        "alleles": f"{ref} > {alt}",
                        "minor_allele_freq": round(float(minor_allele_freq), 4) if isinstance(minor_allele_freq, (int, float)) or (isinstance(minor_allele_freq, str) and minor_allele_freq != "N/A" and minor_allele_freq.replace('.', '', 1).isdigit()) else "N/A",
                        "genes": genes,
                        "consequence": ", ".join(consequences),
                        "clinical": clin_sig
                    })
            else:
                logger.error(f"Erro VEP POST: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Falha na consulta VEP POST: {e}")
            
        return results