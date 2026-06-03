import logging
from typing import Dict, Any, Optional
from google import genai

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self, api_key: str):
        # A nova biblioteca utiliza client-based instantiation
        self.client = genai.Client(api_key=api_key)

    def generate_clinical_insights(self, variant_data: Dict[str, Any]) -> Optional[str]:
        """
        Receives variant data and returns advanced clinical insights formatting in Markdown.
        """
        prompt = f"""
Você é um geneticista clínico e bioinformata de alto nível.
O usuário está consultando a seguinte variante genética humana:
- ID: {variant_data.get('variant_id', variant_data.get('rsid', 'Desconhecido'))}
- Gene(s): {', '.join(variant_data.get('genes', []))}
- Consequência: {variant_data.get('consequence', 'N/A')}
- Frequência na população (MAF): {variant_data.get('minor_allele_freq', 'N/A')}
- Significância Clínica reportada: {', '.join(variant_data.get('clinical', []))}

Sua tarefa é acessar seu vasto conhecimento acadêmico (treinado em base de dados como PubMed, ClinVar, OncoKB, OMIM, Scielo) e fornecer um laudo estruturado:
1. Resumo da variante e impacto funcional conhecido.
2. Hipóteses Diagnósticas mais prováveis (se for patogênica ou provavelmente patogênica). Caso seja benigna, tranquilize e explique.
3. Exames clínicos e complementares sugeridos para confirmação fenotípica (ex: se afeta BRCA1, sugerir mamografia, ressonância magnética, etc).
4. Principais referências bibliográficas relevantes (cite de forma acadêmica).

Responda em linguagem técnica, porém clara (em português), formatada elegantemente em Markdown. Utilize bullet points e negritos para destacar os pontos chaves.
"""
        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            return response.text
        except Exception as e:
            logger.error(f"Erro na API do Gemini: {e}")
            return None
