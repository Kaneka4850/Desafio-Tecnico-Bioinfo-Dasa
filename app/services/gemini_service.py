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

    def generate_clinical_report(self, variants_data: list, filename: str = "Desconhecido", report_date: str = "") -> Optional[str]:
        """
        Gera um laudo clínico simulado com base nas variantes de um VCF,
        seguindo a assinatura requerida.
        """
        variants_summary = ""
        for v in variants_data:
            variants_summary += f"""
            - Variante: {v.get('variant_id')} (Cromossomo {v.get('chromosome')}:{v.get('position')})
            - Gene(s): {', '.join(v.get('genes', []))}
            - Consequência: {v.get('consequence', 'N/A')}
            - Frequência na população (gnomAD): {v.get('minor_allele_freq', 'N/A')}
            - Significância Clínica: {', '.join(v.get('clinical', []))}
            """

        prompt = f"""
Você é um geneticista clínico e bioinformata de alto nível elaborando um laudo de exoma.
O usuário enviou as seguintes variantes para análise:
{variants_summary}

**Informações do Arquivo:**
- Nome do arquivo analisado: {filename}
- Data de emissão do laudo: {report_date}

Gere um laudo clínico completo em formato Markdown, estritamente estruturado com as seguintes seções (assim como um laudo de laboratório real):
1. **Cabeçalho do Laudo:** Inclua o nome do arquivo analisado ({filename}) e a data de emissão ({report_date}).
2. **Material:** (Ex: Sangue total)
3. **Resumo Clínico:** (Invente um breve resumo clínico coerente com as variantes, se patogênicas, ou genérico).
4. **Resultados:** (Descreva de forma concisa se foram encontradas variantes relevantes).
5. **Achado Incidental:** (Informe se há ou não achados em genes do ACMG).
6. **Variantes Identificadas:** (Liste as variantes relevantes com sua Classificação).
7. **Interpretação:** (Explique tecnicamente o efeito das variantes, associando a doenças conhecidas (OMIM), bancos de dados (ClinVar, gnomAD) e critérios do ACMG).

**REGRAS OBRIGATÓRIAS INEGOCIÁVEIS:**
- Você deve incluir um aviso claro e em destaque (pode ser no início ou fim do laudo) dizendo que este é um **Laudo gerado automaticamente por Inteligência Artificial** para fins de pesquisa, e que **deve ser revisado por um profissional habilitado**.
- O laudo DEVE terminar com a exata assinatura abaixo:
Cleber Augusto Muniz Cunha
CRBM: 66297
"""
        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            return response.text
        except Exception as e:
            logger.error(f"Erro na API do Gemini ao gerar laudo: {e}")
            return None
