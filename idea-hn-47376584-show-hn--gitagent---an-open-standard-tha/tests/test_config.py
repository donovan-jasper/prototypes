import pytest
from pathlib import Path
from pydantic import ValidationError
from gitagent.core.config import AgentConfig, ToolConfig, load_config, save_config, validate_config

@pytest.fixture
def valid_agent_config_data():
    return {
        "name": "TestAgent",
        "version": "1.0.0",
        "description": "A test agent.",
        "model": "gpt-3.5-turbo",
        "system_prompt": "You are a helpful assistant.",
        "tools": [
            {
                "name": "tool1",
                "type": "function",
                "description": "Description for tool1",
                "parameters": {"type": "object", "properties": {"arg1": {"type": "string"}}, "required": ["arg1"]}
            }
        ],
        "parameters": {"temperature": 0.7},
        "metadata": {"author": "test"}
    }

@pytest.fixture
def temp_yaml_path(tmp_path):
    return tmp_path / "test_config.yaml"

def test_tool_config_valid():
    tool = ToolConfig(
        name="my_tool",
        type="function",
        description="Does something.",
        parameters={"type": "object", "properties": {"param1": {"type": "string"}}, "required": ["param1"]}
    )
    assert tool.name == "my_tool"
    assert tool.type == "function"

def test_tool_config_missing_required_fields():
    with pytest.raises(ValidationError):
        ToolConfig(name="my_tool") # Missing type, description, parameters

def test_agent_config_valid(valid_agent_config_data):
    config = AgentConfig(**valid_agent_config_data)
    assert config.name == "TestAgent"
    assert config.model == "gpt-3.5-turbo"
    assert len(config.tools) == 1
    assert config.tools[0].name == "tool1"

def test_agent_config_missing_required_fields():
    invalid_data = {
        "name": "InvalidAgent",
        "model": "gpt-3.5-turbo",
        # Missing system_prompt
    }
    with pytest.raises(ValidationError):
        AgentConfig(**invalid_data)

def test_agent_config_default_values():
    minimal_data = {
        "name": "MinimalAgent",
        "system_prompt": "Hello",
        "model": "gpt-3.5-turbo"
    }
    config = AgentConfig(**minimal_data)
    assert config.version == "0.1.0"
    assert config.tools == []
    assert config.parameters["temperature"] == 0.7
    assert config.metadata == {}

def test_agent_config_unique_tool_names():
    invalid_data = {
        "name": "DuplicateToolAgent",
        "system_prompt": "Hello",
        "model": "gpt-3.5-turbo",
        "tools": [
            {
                "name": "tool_a",
                "type": "function",
                "description": "Desc A",
                "parameters": {"type": "object", "properties": {}, "required": []}
            },
            {
                "name": "tool_a", # Duplicate name
                "type": "function",
                "description": "Desc B",
                "parameters": {"type": "object", "properties": {}, "required": []}
            }
        ]
    }
    with pytest.raises(ValidationError, match="All tool names must be unique."):
        AgentConfig(**invalid_data)

def test_load_config(temp_yaml_path, valid_agent_config_data):
    with open(temp_yaml_path, 'w') as f:
        import yaml
        yaml.safe_dump(valid_agent_config_data, f)
    
    loaded_data = load_config(temp_yaml_path)
    assert loaded_data == valid_agent_config_data

def test_save_config(temp_yaml_path, valid_agent_config_data):
    save_config(valid_agent_config_data, temp_yaml_path)
    
    with open(temp_yaml_path, 'r') as f:
        import yaml
        loaded_data = yaml.safe_load(f)
    assert loaded_data == valid_agent_config_data

def test_validate_config_success(valid_agent_config_data):
    try:
        validate_config(valid_agent_config_data)
    except ValueError:
        pytest.fail("validate_config raised ValueError unexpectedly!")

def test_validate_config_failure():
    invalid_data = {
        "name": "InvalidAgent",
        "model": "gpt-3.5-turbo",
        # Missing system_prompt
    }
    with pytest.raises(ValueError, match="Agent configuration validation failed"):
        validate_config(invalid_data)
