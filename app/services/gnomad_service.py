import requests
import logging
import time
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

GNOMAD_API_URL = "https://gnomad.broadinstitute.org/api"

# Populações de interesse para exibição detalhada
POPULATION_LABELS = {
    "afr": "Africana/Afro-americana",
    "amr": "Latina/Americana",
    "asj": "Judaica Ashkenazi",
    "eas": "Leste Asiático",
    "fin": "Finlandesa",
    "nfe": "Europeia (não-finlandesa)",
    "sas": "Sul Asiático",
    "oth": "Outras",
}

VARIANT_QUERY = """
query GnomadVariant($variantId: String!, $datasetId: DatasetId!) {
  variant(variantId: $variantId, dataset: $datasetId) {
    variant_id
    rsids
    genome {
      ac
      an
      af
      homozygote_count
      populations {
        id
        ac
        an
        homozygote_count
      }
    }
    exome {
      ac
      an
      af
      homozygote_count
      populations {
        id
        ac
        an
        homozygote_count
      }
    }
  }
}
"""


class GnomadService:
    """
    Serviço responsável pela comunicação com a API GraphQL do gnomAD
    para obter frequências alélicas populacionais.
    """

    @staticmethod
    def _build_variant_id(chromosome: str, position: int, ref: str, alt: str) -> str:
        """
        Constrói o ID da variante no formato esperado pelo gnomAD: chrom-pos-ref-alt
        Remove prefixos 'chr' se presentes.
        """
        chrom = str(chromosome).replace("chr", "").replace("Chr", "")
        return f"{chrom}-{position}-{ref}-{alt}"

    @staticmethod
    def get_variant_frequency(
        chromosome: str,
        position: int,
        ref: str,
        alt: str,
        dataset: str = "gnomad_r2_1",
    ) -> Optional[Dict[str, Any]]:
        """
        Consulta a API GraphQL do gnomAD para obter frequências alélicas
        de uma variante específica.

        Args:
            chromosome: Cromossomo (ex: '1', 'chr1', 'X')
            position: Posição genômica
            ref: Alelo de referência
            alt: Alelo alternativo
            dataset: Dataset do gnomAD (default: gnomad_r2_1 para GRCh37)

        Returns:
            Dicionário com frequências populacionais ou None se não encontrado.
        """
        variant_id = GnomadService._build_variant_id(chromosome, position, ref, alt)

        try:
            response = requests.post(
                GNOMAD_API_URL,
                json={
                    "query": VARIANT_QUERY,
                    "variables": {
                        "variantId": variant_id,
                        "datasetId": dataset,
                    },
                },
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "DasaChallenge-Bioinfo/1.0",
                },
                timeout=15,
            )

            if response.status_code != 200:
                logger.warning(
                    f"gnomAD API retornou status {response.status_code} para {variant_id}"
                )
                return None

            data = response.json()

            # Verificar erros GraphQL
            if "errors" in data:
                logger.warning(f"gnomAD GraphQL errors para {variant_id}: {data['errors']}")
                return None

            variant_data = data.get("data", {}).get("variant")
            if not variant_data:
                logger.info(f"Variante {variant_id} não encontrada no gnomAD.")
                return None

            # Priorizar exome (mais amostras), com fallback para genome
            exome = variant_data.get("exome")
            genome = variant_data.get("genome")

            # Escolher a fonte primária de dados
            primary = exome if exome and exome.get("an", 0) > 0 else genome
            secondary = genome if primary == exome else exome

            if not primary or primary.get("an", 0) == 0:
                logger.info(f"Variante {variant_id} sem dados de frequência no gnomAD.")
                return None

            # Extrair frequência global
            global_af = primary.get("af", 0)
            global_ac = primary.get("ac", 0)
            global_an = primary.get("an", 0)
            homozygote_count = primary.get("homozygote_count", 0)

            # Extrair frequências populacionais
            populations = {}
            for pop in primary.get("populations", []):
                pop_id = pop.get("id", "").lower()
                # Filtrar apenas populações principais (ignorar sub-populações como XX, XY)
                if pop_id in POPULATION_LABELS:
                    pop_ac = pop.get("ac", 0)
                    pop_an = pop.get("an", 0)
                    pop_af = pop_ac / pop_an if pop_an > 0 else 0
                    populations[pop_id] = {
                        "label": POPULATION_LABELS[pop_id],
                        "af": round(pop_af, 6),
                        "ac": pop_ac,
                        "an": pop_an,
                        "homozygote_count": pop.get("homozygote_count", 0),
                    }

            result = {
                "variant_id": variant_data.get("variant_id", variant_id),
                "rsids": variant_data.get("rsids", []),
                "source": "exome" if primary == exome else "genome",
                "global_af": round(global_af, 6) if global_af else 0,
                "global_ac": global_ac,
                "global_an": global_an,
                "homozygote_count": homozygote_count,
                "populations": populations,
            }

            # Se houver dados secundários, incluir para referência
            if secondary and secondary.get("an", 0) > 0:
                result["secondary_source"] = "genome" if primary == exome else "exome"
                result["secondary_af"] = round(secondary.get("af", 0), 6)

            return result

        except requests.exceptions.Timeout:
            logger.error(f"Timeout ao consultar gnomAD para {variant_id}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro de rede ao consultar gnomAD para {variant_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao consultar gnomAD para {variant_id}: {e}")
            return None

    @staticmethod
    def enrich_variants(variants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Enriquece uma lista de variantes com dados de frequência do gnomAD.
        Atualiza o campo minor_allele_freq quando possível e adiciona dados
        populacionais detalhados.

        Args:
            variants: Lista de dicionários de variantes (formato do EnsemblService)

        Returns:
            A mesma lista, com campos gnomad_data e minor_allele_freq atualizados.
        """
        for i, variant in enumerate(variants):
            chrom = str(variant.get("chromosome", ""))
            pos = variant.get("position", 0)

            # Extrair ref e alt do campo alleles (formato: "REF > ALT")
            alleles_str = variant.get("alleles", "")
            ref, alt = "", ""
            if ">" in alleles_str:
                parts = alleles_str.split(">")
                ref = parts[0].strip()
                alt = parts[1].strip().split("/")[0].strip()  # Pegar só o primeiro alt
            
            if not (chrom and pos and ref and alt):
                logger.warning(
                    f"Variante {variant.get('variant_id', '?')} sem dados suficientes "
                    f"para consulta gnomAD (chrom={chrom}, pos={pos}, ref={ref}, alt={alt})"
                )
                continue

            gnomad_data = GnomadService.get_variant_frequency(chrom, pos, ref, alt)

            if gnomad_data:
                variant["gnomad_data"] = gnomad_data

                # Atualizar minor_allele_freq se ainda estiver como "N/A"
                current_maf = variant.get("minor_allele_freq")
                if current_maf == "N/A" or current_maf is None:
                    variant["minor_allele_freq"] = gnomad_data["global_af"]

                logger.info(
                    f"gnomAD enriqueceu variante {variant.get('variant_id', '?')}: "
                    f"AF={gnomad_data['global_af']}"
                )
            else:
                variant["gnomad_data"] = None

            # Rate limiting entre requisições para ser educado com o servidor
            if i < len(variants) - 1:
                time.sleep(0.1)

        return variants
