from pathlib import Path
from typing import Optional

from gitagent.core.config import AgentConfig, load_config, save_config

class Agent:
    """
    Represents an AI agent, encapsulating its configuration.
    """
    def __init__(self, config: AgentConfig):
        self._config = config

    @property
    def config(self) -> AgentConfig:
        return self._config

    @classmethod
    def load_from_path(cls, config_path: Path) -> 'Agent':
        """
        Loads an Agent from a specified YAML configuration file.
        """
        if not config_path.exists():
            raise FileNotFoundError(f"Agent configuration file not found: {config_path}")
        
        config_data = load_config(config_path)
        agent_config = AgentConfig(**config_data) # Pydantic validation happens here
        return cls(agent_config)

    def save_to_path(self, config_path: Path):
        """
        Saves the Agent's configuration to a specified YAML file.
        """
        config_path.parent.mkdir(parents=True, exist_ok=True)
        save_config(self._config.model_dump(exclude_none=True), config_path)
