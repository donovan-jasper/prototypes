from abc import ABC, abstractmethod
from typing import Any, Dict, List

from gitagent.core.config import AgentConfig

class BaseAdapter(ABC):
    """
    Abstract base class for framework adapters.
    Adapters translate GitAgent's standard agent definition to platform-specific formats.
    """

    @abstractmethod
    def to_platform_format(self, agent_config: AgentConfig) -> Any:
        """
        Converts a GitAgent AgentConfig into a format specific to the target platform.
        """
        pass

    @abstractmethod
    def from_platform_format(self, platform_data: Any) -> AgentConfig:
        """
        Converts platform-specific data back into a GitAgent AgentConfig.
        (May not be fully implemented for all adapters in initial prototypes).
        """
        pass
