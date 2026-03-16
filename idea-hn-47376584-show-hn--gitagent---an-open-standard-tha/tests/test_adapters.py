import pytest
from pydantic import ValidationError
from gitagent.core.config import AgentConfig, ToolConfig
from gitagent.adapters.openai_adapter import OpenAIAdapter

@pytest.fixture
def sample_agent_config():
    return AgentConfig(
        name="TestAgent",
        version="1.0.0",
        system_prompt="You are a helpful assistant.",
        model="gpt-4o-mini",
        tools=[
            ToolConfig(
                name="get_current_weather",
                type="function",
                description="Get the current weather in a given location",
                parameters={
                    "type": "object",
                    "properties": {
                        "location": {"type": "string", "description": "The city and state, e.g. San Francisco, CA"},
                        "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
                    },
                    "required": ["location"]
                }
            ),
            ToolConfig(
                name="get_n_day_weather_forecast",
                type="function",
                description="Get N-day weather forecast",
                parameters={
                    "type": "object",
                    "properties": {
                        "location": {"type": "string", "description": "The city and state, e.g. San Francisco, CA"},
                        "num_days": {"type": "integer", "description": "Number of days to forecast"}
                    },
                    "required": ["location", "num_days"]
                }
            ),
            ToolConfig(
                name="internal_log",
                type="internal",
                description="Logs a message internally.",
                parameters={"type": "object", "properties": {"message": {"type": "string"}}, "required": ["message"]}
            )
        ]
    )

def test_openai_adapter_to_platform_format(sample_agent_config):
    adapter = OpenAIAdapter()
    openai_tools = adapter.to_platform_format(sample_agent_config)

    assert isinstance(openai_tools, list)
    assert len(openai_tools) == 2

    tool1 = openai_tools[0]
    assert isinstance(tool1, dict)
    assert tool1["type"] == "function"
    assert tool1["function"]["name"] == "get_current_weather"
    assert tool1["function"]["description"] == "Get the current weather in a given location"
    assert tool1["function"]["parameters"] == {
        "type": "object",
        "properties": {
            "location": {"type": "string", "description": "The city and state, e.g. San Francisco, CA"},
            "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
        },
        "required": ["location"]
    }

    tool2 = openai_tools[1]
    assert isinstance(tool2, dict)
    assert tool2["type"] == "function"
    assert tool2["function"]["name"] == "get_n_day_weather_forecast"
    assert tool2["function"]["description"] == "Get N-day weather forecast"
    assert tool2["function"]["parameters"] == {
        "type": "object",
        "properties": {
            "location": {"type": "string", "description": "The city and state, e.g. San Francisco, CA"},
            "num_days": {"type": "integer", "description": "Number of days to forecast"}
        },
        "required": ["location", "num_days"]
    }

def test_openai_adapter_no_tools():
    config_no_tools = AgentConfig(
        name="NoToolAgent",
        system_prompt="No tools here.",
        model="gpt-3.5-turbo",
        tools=[]
    )
    adapter = OpenAIAdapter()
    openai_tools = adapter.to_platform_format(config_no_tools)
    assert openai_tools == []

def test_openai_adapter_from_platform_format_not_implemented():
    adapter = OpenAIAdapter()
    with pytest.raises(NotImplementedError, match="Conversion from OpenAI format to GitAgentConfig is not yet implemented."):
        adapter.from_platform_format({})
