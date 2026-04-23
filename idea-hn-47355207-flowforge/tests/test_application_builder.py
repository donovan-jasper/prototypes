import pytest
from unittest.mock import MagicMock, patch
from src.components.ApplicationBuilder import ApplicationBuilder
from src.services.DatabaseService import DatabaseService
from src.services.AIService import AIService

@pytest.fixture
def mock_database_service():
    mock = MagicMock(spec=DatabaseService)
    mock.initDatabase.return_value = None
    mock.getApplications.return_value = []
    mock.saveApplication.return_value = None
    mock.deleteApplication.return_value = None
    return mock

@pytest.fixture
def mock_ai_service():
    mock = MagicMock(spec=AIService)
    mock.generateSchemaSuggestion.return_value = {
        'success': True,
        'suggestions': [],
        'confidence': 0.85
    }
    return mock

def test_application_builder_initial_state(mock_database_service, mock_ai_service):
    with patch('src.components.ApplicationBuilder.DatabaseService', return_value=mock_database_service), \
         patch('src.components.ApplicationBuilder.AIService', return_value=mock_ai_service):

        # Mock the navigation prop
        mock_navigation = MagicMock()

        # Create the component
        component = ApplicationBuilder(navigation=mock_navigation)

        # Verify initial state
        assert component.state['appName'] == ''
        assert component.state['fields'] == []
        assert component.state['fieldName'] == ''
        assert component.state['fieldType'] == ''
        assert component.state['applications'] == []
        assert component.state['schemaSuggestions'] == []
        assert component.state['isLoading'] == False
        assert component.state['showSuggestions'] == False

def test_add_field(mock_database_service, mock_ai_service):
    with patch('src.components.ApplicationBuilder.DatabaseService', return_value=mock_database_service), \
         patch('src.components.ApplicationBuilder.AIService', return_value=mock_ai_service):

        mock_navigation = MagicMock()
        component = ApplicationBuilder(navigation=mock_navigation)

        # Set field name and type
        component.setState({
            'fieldName': 'testField',
            'fieldType': 'string'
        })

        # Call addField
        component.addField()

        # Verify field was added
        assert len(component.state['fields']) == 1
        assert component.state['fields'][0]['name'] == 'testField'
        assert component.state['fields'][0]['type'] == 'string'

        # Verify inputs were cleared
        assert component.state['fieldName'] == ''
        assert component.state['fieldType'] == ''

def test_remove_field(mock_database_service, mock_ai_service):
    with patch('src.components.ApplicationBuilder.DatabaseService', return_value=mock_database_service), \
         patch('src.components.ApplicationBuilder.AIService', return_value=mock_ai_service):

        mock_navigation = MagicMock()
        component = ApplicationBuilder(navigation=mock_navigation)

        # Add a test field
        test_field = {'name': 'testField', 'type': 'string', 'id': 123}
        component.setState({'fields': [test_field]})

        # Remove the field
        component.removeField(123)

        # Verify field was removed
        assert len(component.state['fields']) == 0

def test_save_application(mock_database_service, mock_ai_service):
    with patch('src.components.ApplicationBuilder.DatabaseService', return_value=mock_database_service), \
         patch('src.components.ApplicationBuilder.AIService', return_value=mock_ai_service):

        mock_navigation = MagicMock()
        component = ApplicationBuilder(navigation=mock_navigation)

        # Set application name and fields
        component.setState({
            'appName': 'Test App',
            'fields': [{'name': 'testField', 'type': 'string', 'id': 123}]
        })

        # Save the application
        component.saveApplication()

        # Verify database service was called
        mock_database_service.saveApplication.assert_called_once_with(
            'Test App',
            {
                'name': 'Test App',
                'fields': [{'name': 'testField', 'type': 'string', 'id': 123}]
            }
        )

        # Verify state was reset
        assert component.state['appName'] == ''
        assert component.state['fields'] == []
