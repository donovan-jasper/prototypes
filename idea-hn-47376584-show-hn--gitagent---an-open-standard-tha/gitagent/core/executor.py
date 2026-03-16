import os
import json
from typing import List, Dict, Any, Optional

from openai import OpenAI

from gitagent.core.agent import Agent
from gitagent.adapters.openai_adapter import OpenAIAdapter
from gitagent.tools.registry import ToolRegistry

class AgentExecutor:
    """
    Executes an agent's logic, managing conversation state and tool calling.
    """
    def __init__(self, agent: Agent, adapter: OpenAIAdapter, tool_registry: ToolRegistry):
        self.agent = agent
        self.adapter = adapter
        self.tool_registry = tool_registry
        self.openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        self.conversation_history: List[Dict[str, Any]] = []

        self._initialize_conversation()

    def _initialize_conversation(self):
        """Initializes the conversation history with the agent's system prompt."""
        self.conversation_history = [
            {"role": "system", "content": self.agent.config.system_prompt}
        ]

    def run_conversation(self, user_input: str) -> str:
        """
        Runs a single turn of conversation with the agent, including tool calls.
        """
        self.conversation_history.append({"role": "user", "content": user_input})

        openai_tools = self.adapter.to_platform_format(self.agent.config)

        try:
            response = self.openai_client.chat.completions.create(
                model=self.agent.config.model,
                messages=self.conversation_history,
                tools=openai_tools if openai_tools else None,
                tool_choice="auto" if openai_tools else None,
                temperature=self.agent.config.parameters.get("temperature", 0.7),
                max_tokens=self.agent.config.parameters.get("max_tokens", 1024),
            )

            response_message = response.choices[0].message
            
            message_dict = {
                "role": response_message.role,
                "content": response_message.content
            }
            
            if response_message.tool_calls:
                message_dict["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": tc.type,
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in response_message.tool_calls
                ]
            
            self.conversation_history.append(message_dict)

            if response_message.tool_calls:
                for tool_call in response_message.tool_calls:
                    tool_name = tool_call.function.name
                    tool_args = json.loads(tool_call.function.arguments)
                    
                    print(f"Calling tool: {tool_name} with args: {tool_args}")

                    tool_output = self._call_tool(tool_name, tool_args)

                    self.conversation_history.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": tool_name,
                        "content": tool_output,
                    })
                
                second_response = self.openai_client.chat.completions.create(
                    model=self.agent.config.model,
                    messages=self.conversation_history,
                    temperature=self.agent.config.parameters.get("temperature", 0.7),
                    max_tokens=self.agent.config.parameters.get("max_tokens", 1024),
                )
                final_response_message = second_response.choices[0].message
                
                final_message_dict = {
                    "role": final_response_message.role,
                    "content": final_response_message.content
                }
                
                self.conversation_history.append(final_message_dict)
                return final_response_message.content or "No response after tool execution."
            else:
                return response_message.content or "No response from agent."

        except Exception as e:
            return f"An error occurred during conversation: {e}"

    def _call_tool(self, tool_name: str, tool_args: Dict[str, Any]) -> str:
        """
        Executes a registered tool with the given arguments.
        """
        tool_func = self.tool_registry.get_tool(tool_name)
        if tool_func:
            try:
                result = tool_func(**tool_args)
                print(f"Tool Output: {result}")
                return str(result)
            except Exception as e:
                return f"Error executing tool '{tool_name}': {e}"
        else:
            return f"Tool '{tool_name}' not found in registry."
