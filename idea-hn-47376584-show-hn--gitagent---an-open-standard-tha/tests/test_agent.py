import pytest
from pathlib import Path
from gitagent.core.agent import Agent
from gitagent.core.config import AgentConfig, ToolConfig, save_config

@pytest.fixture
def temp_agent_config_path(tmp_path):
    """Provides a temporary path for agent.yaml."""
    gitagent_dir = tmp_path / ".gitagent"
    gitagent_dir.mkdir()
    return gitagent_dir / "agent.yaml"

def test_agent_load_from_path(temp_agent_config_path):
    """Test loading an agent from a valid config file."""
    config_data = {
        "name": "TestAgent",
        "version": "1.0.0",
        "system_prompt": "You are a test agent.",
        "model": "gpt-3.5-turbo",
        "tools": [
            {
                "name": "test_tool",
                "type": "function",
                "description": "A tool for testing.",
                "parameters": {"type": "object", "properties": {}, "required": []}
            }
        ]
    }
    save_config(config_data, temp_agent_config_path)

    agent = Agent.load_from_path(temp_agent_config_path)
    assert agent.config.name == "TestAgent"
    assert agent.config.version == "1.0.0"
    assert agent.config.system_prompt == "You are a test agent."
    assert len(agent.config.tools) == 1
    assert agent.config.tools[0].name == "test_tool"

def test_agent_load_from_nonexistent_path():
    """Test loading an agent from a non-existent path."""
    with pytest.raises(FileNotFoundError):
        Agent.load_from_path(Path("non_existent_path/agent.yaml"))

def test_agent_save_to_path(temp_agent_config_path):
    """Test saving an agent's configuration to a file."""
    initial_config = AgentConfig(
        name="SaveAgent",
        version="0.9.0",
        system_prompt="I save configs.",
        model="gpt-4",
        parameters={"temperature": 0.5}
    )
    agent = Agent(initial_config)
    agent.save_to_path(temp_agent_config_path)

    loaded_agent = Agent.load_from_path(temp_agent_config_path)
    assert loaded_agent.config.name == "SaveAgent"
    assert loaded_agent.config.version == "0.9.0"
    assert loaded_agent.config.system_prompt == "I save configs."
    assert loaded_agent.config.model == "gpt-4"
    assert loaded_agent.config.parameters["temperature"] == 0.5

def test_agent_config_property():
    """Test the config property of the Agent class."""
    config = AgentConfig(name="PropAgent", system_prompt="Test", model="gpt-3.5-turbo")
    agent = Agent(config)
    assert agent.config is config
