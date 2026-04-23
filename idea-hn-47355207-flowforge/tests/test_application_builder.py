import pytest
from unittest.mock import MagicMock, patch
from src.services.DatabaseService import DatabaseService

@pytest.fixture
def mock_db():
    with patch('src.services.DatabaseService.SQLite') as mock_sqlite:
        mock_db = MagicMock()
        mock_sqlite.openDatabase.return_value = mock_db
        yield mock_db

def test_database_service_initialization(mock_db):
    db_service = DatabaseService()
    assert db_service.db is not None

def test_init_database(mock_db):
    db_service = DatabaseService()
    mock_db.transaction = MagicMock()

    # Test successful initialization
    async def test_init():
        await db_service.initDatabase()
        mock_db.transaction.assert_called_once()

    # Run the async test
    import asyncio
    asyncio.run(test_init())

def test_get_applications(mock_db):
    db_service = DatabaseService()
    mock_db.transaction = MagicMock()

    # Mock the result of the query
    mock_result = MagicMock()
    mock_result.rows.length = 1
    mock_result.rows.item.return_value = {
        'id': 1,
        'name': 'Test App',
        'schema': '{"type": "object"}',
        'version': 1,
        'created_at': '2023-01-01',
        'updated_at': '2023-01-01'
    }

    mock_db.transaction.side_effect = lambda tx: tx.executeSql(
        'SELECT * FROM applications ORDER BY updated_at DESC',
        [],
        lambda tx, results: results,
        lambda tx, error: None
    )

    # Test successful retrieval
    async def test_get():
        apps = await db_service.getApplications()
        assert len(apps) == 1
        assert apps[0]['name'] == 'Test App'

    # Run the async test
    import asyncio
    asyncio.run(test_get())

def test_save_application(mock_db):
    db_service = DatabaseService()
    mock_db.transaction = MagicMock()

    # Test successful save
    async def test_save():
        app_id = await db_service.saveApplication('Test App', {'type': 'object'})
        assert app_id is not None

    # Run the async test
    import asyncio
    asyncio.run(test_save())

def test_detect_schema_changes():
    db_service = DatabaseService()

    old_schema = {
        'type': 'object',
        'properties': {
            'name': {'type': 'string'},
            'age': {'type': 'integer'}
        },
        'required': ['name']
    }

    new_schema = {
        'type': 'object',
        'properties': {
            'name': {'type': 'string'},
            'age': {'type': 'string'},  # Changed type
            'email': {'type': 'string'}  # Added field
        },
        'required': ['name', 'email']  # Changed required fields
    }

    changes = db_service.detectSchemaChanges(old_schema, new_schema)

    assert len(changes) == 3
    assert any(change['type'] == 'change_type' for change in changes)
    assert any(change['type'] == 'add_field' for change in changes)
    assert any(change['type'] == 'make_required' for change in changes)
