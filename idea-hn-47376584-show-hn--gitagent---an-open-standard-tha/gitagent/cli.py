import click
import os
import shutil
from pathlib import Path

from gitagent.core.agent import Agent
from gitagent.core.config import load_config, validate_config
from gitagent.core.git_ops import GitAgentRepo
from gitagent.core.executor import AgentExecutor
from gitagent.adapters.openai_adapter import OpenAIAdapter
from gitagent.tools.registry import ToolRegistry
from gitagent.tools.builtin import register_builtin_tools

@click.group()
def cli():
    """GitAgent CLI tool for managing AI agents."""
    pass

@cli.command()
@click.argument('path', type=click.Path(exists=False, file_okay=False, dir_okay=True), default='.')
def init(path):
    """
    Initializes a new GitAgent repository.
    Creates a .gitagent/agent.yaml and initializes a Git repository.
    """
    repo_path = Path(path).resolve()
    gitagent_dir = repo_path / '.gitagent'
    agent_config_path = gitagent_dir / 'agent.yaml'

    if agent_config_path.exists():
        click.echo(f"GitAgent repository already initialized at {repo_path}", err=True)
        return

    click.echo(f"Initializing GitAgent repository at {repo_path}...")

    try:
        # Create .gitagent directory
        gitagent_dir.mkdir(parents=True, exist_ok=True)

        # Copy template agent.yaml
        template_path = Path(__file__).parent / 'templates' / 'agent.yaml.template'
        shutil.copy(template_path, agent_config_path)
        click.echo(f"Created default agent configuration at {agent_config_path}")

        # Initialize Git repository
        git_repo = GitAgentRepo(repo_path)
        if not git_repo.is_git_repo():
            git_repo.init_repo()
            click.echo(f"Initialized Git repository at {repo_path}")
            git_repo.add_and_commit([str(agent_config_path)], "Initial GitAgent setup")
            click.echo("Committed initial agent configuration.")
        else:
            click.echo(f"Git repository already exists at {repo_path}. Skipping Git init.")
            git_repo.add_and_commit([str(agent_config_path)], "Added GitAgent configuration")
            click.echo("Committed GitAgent configuration to existing repo.")

        click.echo(f"GitAgent repository successfully initialized at {repo_path}")

    except Exception as e:
        click.echo(f"Error initializing GitAgent repository: {e}", err=True)
        if agent_config_path.exists():
            agent_config_path.unlink() # Clean up created file
        if gitagent_dir.exists() and not list(gitagent_dir.iterdir()):
            gitagent_dir.rmdir() # Clean up empty directory
        exit(1)

@cli.command()
@click.argument('path', type=click.Path(exists=True, file_okay=False, dir_okay=True), default='.')
def validate(path):
    """
    Validates the agent.yaml configuration file.
    """
    repo_path = Path(path).resolve()
    agent_config_path = repo_path / '.gitagent' / 'agent.yaml'

    if not agent_config_path.exists():
        click.echo(f"Error: No agent.yaml found at {agent_config_path}", err=True)
        exit(1)

    click.echo(f"Validating agent configuration at {agent_config_path}...")
    try:
        config_data = load_config(agent_config_path)
        validate_config(config_data)
        click.echo("Agent configuration is valid.")
    except Exception as e:
        click.echo(f"Validation failed: {e}", err=True)
        exit(1)

@cli.command()
@click.argument('path', type=click.Path(exists=True, file_okay=False, dir_okay=True), default='.')
def run(path):
    """
    Runs the agent defined in agent.yaml, allowing interactive conversation.
    """
    repo_path = Path(path).resolve()
    agent_config_path = repo_path / '.gitagent' / 'agent.yaml'

    if not agent_config_path.exists():
        click.echo(f"Error: No agent.yaml found at {agent_config_path}", err=True)
        exit(1)

    click.echo(f"Loading agent from {agent_config_path}...")
    try:
        agent = Agent.load_from_path(agent_config_path)
        click.echo(f"Agent '{agent.config.name}' (v{agent.config.version}) loaded.")

        # Initialize Tool Registry and register built-in tools
        tool_registry = ToolRegistry()
        register_builtin_tools(tool_registry)

        # Initialize OpenAI Adapter
        openai_adapter = OpenAIAdapter()

        # Initialize Agent Executor
        executor = AgentExecutor(agent, openai_adapter, tool_registry)

        click.echo("\n--- Starting conversation (type 'exit' or 'quit' to end) ---")
        while True:
            user_input = click.prompt("User")
            if user_input.lower() in ['exit', 'quit']:
                break
            
            response = executor.run_conversation(user_input)
            click.echo(f"Agent: {response}")

    except Exception as e:
        click.echo(f"Error running agent: {e}", err=True)
        exit(1)

if __name__ == '__main__':
    cli()
