import pytest
from unittest.mock import MagicMock, patch
from src.components.ApplicationBuilder import ApplicationBuilder
from src.services.AIService import AIService

@pytest.fixture
def mock_database_service():
    mock = MagicMock()
    mock.initDatabase.return_value = True
    mock.getApplications.return_value = []
    mock.saveApplication.return_value = True
    mock.deleteApplication.return_value = True
    return mock

@pytest.fixture
def mock_ai_service():
    mock = MagicMock()
    mock.generateSchemaSuggestion.return_value = {
        'success': True,
        'suggestions': [
            {
                'type': 'add_property',
                'property': 'id',
                'description': 'Add an id field for better data management',
                'dataType': 'string'
            }
        ],
        'confidence': 0.85
    }
    return mock

def test_application_builder_initialization(mock_database_service, mock_ai_service):
    with patch('src.components.ApplicationBuilder.DatabaseService', return_value=mock_database_service):
        with patch('src.components.ApplicationBuilder.AIService', return_value=mock_ai_service):
            builder = ApplicationBuilder({})
            assert builder is not None

def test_add_field(mock_database_service, mock_ai_service):
    with patch('src.components.ApplicationBuilder.DatabaseService', return_value=mock_database_service):
        with patch('src.components.ApplicationBuilder.AIService', return_value=mock_ai_service):
            builder = ApplicationBuilder({})
            builder.setFieldName('test_field')
            builder.setFieldType('string')
            builder.addField()
            assert len(builder.fields) == 1
            assert builder.fields[0]['name'] == 'test_field'
            assert builder.fields[0]['type'] == 'string'

def test_get_schema_suggestions(mock_database_service, mock_ai_service):
    with patch('src.components.ApplicationBuilder.DatabaseService', return_value=mock_database_service):
        with patch('src.components.ApplicationBuilder.AIService', return_value=mock_ai_service):
            builder = ApplicationBuilder({})
            builder.setFieldName('test_field')
            builder.setFieldType('string')
            builder.addField()
            builder.getSchemaSuggestions()
            assert len(builder.schemaSuggestions) > 0
            assert builder.schemaSuggestions[0]['property'] == 'id'

def test_apply_suggestion(mock_database_service, mock_ai_service):
    with patch('src.components.ApplicationBuilder.DatabaseService', return_value=mock_database_service):
        with patch('src.components.ApplicationBuilder.AIService', return_value=mock_ai_service):
            builder = ApplicationBuilder({})
            builder.setFieldName('test_field')
            builder.setFieldType('string')
            builder.addField()
            builder.getSchemaSuggestions()
            builder.applySuggestion(builder.schemaSuggestions[0])
            assert len(builder.fields) == 2  # Original field + suggested field
            assert any(field['name'] == 'id' for field in builder.fields)
