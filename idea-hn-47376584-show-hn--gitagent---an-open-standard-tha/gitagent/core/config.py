from pathlib import Path
from typing import List, Dict, Any, Optional
import yaml
from pydantic import BaseModel, Field, ValidationError, model_validator

class ToolConfig(BaseModel):
    """
    Defines the configuration for a tool used by the agent.
    """
    name: str = Field(..., description="Unique name of the tool.")
    type: str = Field(..., description="Type of the tool (e.g., 'function', 'builtin').")
    description: str = Field(..., description="A brief description of what the tool does.")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="JSON schema for the tool's input parameters.")

class AgentConfig(BaseModel):
    """
    Defines the overall configuration for an AI agent.
    """
    name: str = Field(..., description="The name of the agent.")
    version: str = Field("0.1.0", description="Version of the agent configuration.")
    description: Optional[str] = Field(None, description="A brief description of the agent's purpose.")
    model: str = Field("gpt-4o-mini", description="The default AI model to use (e.g., 'gpt-4o-mini', 'gpt-3.5-turbo').")
    system_prompt: str = Field(..., description="The initial system prompt for the agent.")
    tools: List[ToolConfig] = Field(default_factory=list, description="List of tools the agent can use.")
    parameters: Dict[str, Any] = Field(
        default_factory=lambda: {"temperature": 0.7, "max_tokens": 1024},
        description="Model specific parameters (e.g., temperature, max_tokens)."
    )
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata for the agent.")

    @model_validator(mode='after')
    def validate_tool_names(self):
        """Ensure all tool names are unique."""
        tool_names = [tool.name for tool in self.tools]
        if len(tool_names) != len(set(tool_names)):
            raise ValueError("All tool names must be unique.")
        return self

def load_config(config_path: Path) -> Dict[str, Any]:
    """
    Loads a YAML configuration file.
    """
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def save_config(config_data: Dict[str, Any], config_path: Path):
    """
    Saves a dictionary to a YAML configuration file.
    """
    with open(config_path, 'w', encoding='utf-8') as f:
        yaml.safe_dump(config_data, f, sort_keys=False)

def validate_config(config_data: Dict[str, Any]):
    """
    Validates a dictionary against the AgentConfig schema.
    Raises ValidationError if validation fails.
    """
    try:
        AgentConfig(**config_data)
    except ValidationError as e:
        raise ValueError(f"Agent configuration validation failed: {e}")
