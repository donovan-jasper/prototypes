from typing import Any, Dict, List

from gitagent.adapters.base import BaseAdapter
from gitagent.core.config import AgentConfig, ToolConfig

class OpenAIAdapter(BaseAdapter):
    """
    Adapter for translating GitAgent configurations to OpenAI API formats.
    """

    def to_platform_format(self, agent_config: AgentConfig) -> List[Dict[str, Any]]:
        """
        Converts GitAgent's AgentConfig tools into OpenAI API tool format.
        Specifically, it converts ToolConfig objects into tool dictionaries.
        """
        openai_tools: List[Dict[str, Any]] = []
        for tool in agent_config.tools:
            if tool.type == "function":
                openai_tools.append({
                    "type": "function",
                    "function": {
                        "name": tool.name,
                        "description": tool.description,
                        "parameters": tool.parameters
                    }
                })
        return openai_tools

    def from_platform_format(self, platform_data: Any) -> AgentConfig:
        """
        Converts OpenAI API data back into a GitAgent AgentConfig.
        (Placeholder for now, as this is less critical for the initial prototype).
        """
        raise NotImplementedError("Conversion from OpenAI format to GitAgentConfig is not yet implemented.")
