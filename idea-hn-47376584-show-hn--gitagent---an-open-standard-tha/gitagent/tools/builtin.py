import os
from typing import Dict, Any
from gitagent.tools.registry import ToolRegistry

def echo_tool(text: str) -> str:
    """
    Echoes the input text back. Useful for testing tool calls.
    """
    return text

def read_file_tool(path: str) -> str:
    """
    Reads the content of a file from the specified path.
    """
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return f"Error: File not found at {path}"
    except Exception as e:
        return f"Error reading file {path}: {e}"

def write_file_tool(path: str, content: str) -> str:
    """
    Writes content to a file at the specified path.
    If the file exists, it will be overwritten.
    """
    try:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return f"Successfully wrote to file: {path}"
    except Exception as e:
        return f"Error writing to file {path}: {e}"

def register_builtin_tools(registry: ToolRegistry):
    """
    Registers all built-in tools with the provided ToolRegistry.
    """
    registry.register_tool("echo", echo_tool)
    registry.register_tool("read_file", read_file_tool)
    registry.register_tool("write_file", write_file_tool)
