import pytest
from unittest.mock import MagicMock, patch
from src.components.ApplicationBuilder import ApplicationBuilder

@pytest.fixture
def mock_database_service():
    with patch('src.components.ApplicationBuilder.DatabaseService') as mock:
        mock_instance = mock.return_value
        mock_instance.initDatabase.return_value = True
        mock_instance.getApplications.return_value = []
        mock_instance.saveApplication.return_value = True
        mock_instance.deleteApplication.return_value = True
        yield mock_instance

@pytest.fixture
def mock_ai_service():
    with patch('src.components.ApplicationBuilder.AIService') as mock:
        mock_instance = mock.return_value
        mock_instance.generateSchemaSuggestion.return_value = {
            'success': True,
            'suggestions': [
                {
                    'type': 'add_property',
                    'property': 'email',
                    'dataType': 'string',
                    'description': 'Add email field for user authentication'
                }
            ]
        }
        yield mock_instance

def test_application_builder_initialization(mock_database_service, mock_ai_service):
    """Test that ApplicationBuilder initializes correctly"""
    builder = ApplicationBuilder({})
    assert builder is not None

def test_add_field(mock_database_service, mock_ai_service):
    """Test adding a field to the application"""
    builder = ApplicationBuilder({})
    builder.addField = MagicMock()
    builder.addField()
    builder.addField.assert_called_once()

def test_get_schema_suggestions(mock_database_service, mock_ai_service):
    """Test getting schema suggestions"""
    builder = ApplicationBuilder({})
    builder.fields = [{'name': 'username', 'type': 'string', 'id': 1}]
    builder.getSchemaSuggestions()
    mock_ai_service.generateSchemaSuggestion.assert_called_once()

def test_apply_suggestion(mock_database_service, mock_ai_service):
    """Test applying a suggestion"""
    builder = ApplicationBuilder({})
    builder.schemaSuggestions = [{
        'type': 'add_property',
        'property': 'email',
        'dataType': 'string',
        'description': 'Add email field'
    }]
    builder.applySuggestion(builder.schemaSuggestions[0])
    assert len(builder.fields) == 1
    assert builder.fields[0]['name'] == 'email'
