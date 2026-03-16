# GitAgent

An open standard and CLI tool that defines AI agents as version-controlled Git repositories, enabling portability across AI frameworks with built-in audit trails and collaboration.

## One-line Pitch
An open standard and CLI tool that defines AI agents as version-controlled Git repositories, enabling portability across AI frameworks with built-in audit trails and collaboration.

## Features

- **Agent Definition Standard**: YAML-based agent configuration files (`.gitagent/agent.yaml`) defining system prompts, tools, model preferences, and metadata.
- **CLI Tool**: Command-line interface to initialize, validate, run, and export GitAgent repositories with commands like `gitagent init`, `gitagent run`, `gitagent validate`.
- **Framework Adapters**: Plugin system with adapters that translate GitAgent standard to platform-specific formats (OpenAI, LangChain) for portability.
- **Version Control Integration**: Automatic Git operations for agent iterations, branching strategies for agent variants, and commit history as audit trail.
- **Agent Execution Engine**: Local runtime that loads agent definitions, manages conversation state, and executes agent logic with tool calling support.

## Setup

1.  **Clone the repository:**
    
