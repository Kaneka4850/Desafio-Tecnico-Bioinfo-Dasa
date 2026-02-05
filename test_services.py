import pytest
from app.services.ensembl_service import EnsemblService

class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code
    def json(self):
        return self.json_data

def test_get_variant_info_success(mocker):
    """Testa fluxo completo, formatação de alelos, MAF e genes via VEP."""
    variation_json = {
        "name": "rs1333049",
        "mappings": [{"seq_region_name": "9", "start": 22125504, "allele_string": "G/C"}],
        "MAF": 0.418564,
        "clinical_significance": ["benign"],
        "most_severe_consequence": "intron_variant"
    }
    vep_json = [{"transcript_consequences": [{"gene_symbol": "CDKN2B-AS1"}]}]

    def api_side_effect(url, **kwargs):
        if "variation/human" in url: return MockResponse(variation_json, 200)
        if "vep/human" in url: return MockResponse(vep_json, 200)
        return MockResponse(None, 404)

    mocker.patch('requests.get', side_effect=api_side_effect)

    result = EnsemblService.get_variant_info("rs1333049")

    assert result is not None
    assert result["alleles"] == "G > C"
    assert result["minor_allele_freq"] == 0.4186 # Valida arredondamento
    assert "CDKN2B-AS1" in result["genes"]

def test_clinical_significance_logic(mocker):
    """
    Garante que:
    1. 'not_provided' e 'other' sejam removidos.
    2. 'uncertain_significance' seja MANTIDA e normalizada para espaço.
    """
    variation_json = {
        "name": "rs123",
        "mappings": [{"seq_region_name": "1", "start": 100, "allele_string": "A/T"}],
        "clinical_significance": ["pathogenic", "not_provided", "uncertain_significance", "other"]
    }
    mocker.patch('requests.get', return_value=MockResponse(variation_json, 200))

    result = EnsemblService.get_variant_info("rs123")
    
    # ✅ VALIDAÇÃO CRÍTICA:
    # 'pathogenic' deve estar lá.
    # 'uncertain significance' deve estar lá (com espaço, não underscore).
    # 'not provided' e 'other' devem ter sumido.
    expected_clinical = ["pathogenic", "uncertain significance"]
    assert sorted(result["clinical"]) == sorted(expected_clinical)
    assert "not provided" not in result["clinical"]

def test_get_variant_info_not_found(mocker):
    """Testa 404 na API principal."""
    mocker.patch('requests.get', return_value=MockResponse({}, 404))
    result = EnsemblService.get_variant_info("rsInvalido")
    assert result is None

def test_vep_failure_fallback(mocker):
    """Testa resiliência: Variation OK, VEP Erro 500."""
    variation_json = {
        "name": "rs123",
        "mappings": [{"seq_region_name": "1", "start": 100, "allele_string": "A/T"}]
    }

    def api_side_effect(url, **kwargs):
        if "variation/human" in url: return MockResponse(variation_json, 200)
        return MockResponse({}, 500)

    mocker.patch('requests.get', side_effect=api_side_effect)

    result = EnsemblService.get_variant_info("rs123")
    assert result is not None
    assert result["genes"] == ["Intergenic"] # Garante que o fallback funciona