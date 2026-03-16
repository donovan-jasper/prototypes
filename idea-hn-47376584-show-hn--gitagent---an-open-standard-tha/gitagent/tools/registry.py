from typing import Callable, Dict, Any, List

class ToolRegistry:
    """
    Manages a registry of callable tools that agents can use.
    """
    def __init__(self):
        self._tools: Dict[str, Callable[..., Any]] = {}

    def register_tool(self, name: str, func: Callable[..., Any]):
        """
        Registers a tool function with a given name.
        """
        if name in self._tools:
            raise ValueError(f"Tool with name '{name}' already registered.")
        self._tools[name] = func

    def get_tool(self, name: str) -> Callable[..., Any]:
        """
        Retrieves a registered tool function by name.
        """
        return self._tools.get(name)

    def list_tools(self) -> List[str]:
        """
        Returns a list of all registered tool names.
        """
        return list(self._tools.keys())
