# AI Models Orchestration Framework

This project demonstrates how to use multiple AI models together in a coordinated workflow, with each model focused on its specific strengths.

## Models Configuration

The framework is configured to use the following AI models:

1. **ClaudePlanner** (Claude 3.5 Sonnet) - Strategic planning and high-level architecture
2. **ForgeMind** (Claude 3 Opus) - Advanced code architecture and complex problem-solving
3. **Actuator4o** (Claude 3 Sonnet) - UI/UX design and interaction patterns
4. **CommandRunner** (GPT-3.5 Turbo) - Fast execution of commands and simple automation
5. **DebuggingAgent** (Claude 3.5 Sonnet) - Monitors, analyzes errors, and suggests fixes

This configuration leverages Claude models for planning, solving, and design tasks where reasoning is critical, while using GPT-3.5 for command execution and simple implementation tasks where speed is beneficial.

## Setup

1. Clone this repository
2. Create a `.env` file with the following API keys:
   ```
   # Anthropic API key (required for Claude models)
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # OpenAI API key (required for GPT models)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # OpenRouter API key (optional, for accessing multiple models through one API)
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
3. Install required packages:
   ```
   pip install -r requirements.txt
   ```

## Available Scripts

- `claude_cli.py` - Simple CLI for interacting directly with Claude
- `ai_orchestrator.py` - Core module for orchestrating multiple AI models
- `test_models.py` - Test script for individual models
- `workflow_demo.py` - Complete sequential workflow demonstration
- `parallel_workflow.py` - Run multiple AI tasks in parallel
- `debug_agent.py` - Debugging agent for monitoring and error analysis

## Workflow Process

The workflow demo executes the following steps:

1. **Planning Phase** (ClaudePlanner)
   - Creates high-level architecture
   - Defines key components and interactions
   - Recommends technology stack

2. **Code Architecture Phase** (ForgeMind)
   - Designs classes and methods
   - Defines file structure
   - Creates database schema

3. **UI/UX Design Phase** (Actuator4o)
   - Designs key screens and layouts
   - Defines user flows
   - Creates UI components

4. **Automation Phase** (CommandRunner)
   - Generates shell commands for setup
   - Creates automation scripts
   - Provides deployment instructions

5. **Debugging and Monitoring** (DebuggingAgent)
   - Tracks execution of all tasks
   - Analyzes errors when they occur
   - Provides diagnostic information
   - Generates workflow health reports

## Running the Workflow Demo

```bash
# Run sequential workflow
python workflow_demo.py

# Run parallel workflow
python parallel_workflow.py
```

The results will be saved in the `workflow_results` directory (sequential workflow) or `parallel_results` directory (parallel workflow). Debug logs will be saved in their respective subdirectories.

## Model Role Allocation Strategy

This project uses a deliberate strategy for assigning models to tasks:

- **Claude Models (3.5 Sonnet, 3 Opus)**: Handle tasks requiring deep reasoning, planning, design decisions, and complex problem-solving.
- **GPT Models (GPT-3.5 Turbo)**: Used for fast execution of commands, simple automation tasks, and implementation details.
- **DebuggingAgent**: A specialized Claude model instance dedicated to monitoring workflow execution, analyzing errors, and providing fixes.

This approach optimizes for both quality and efficiency across the workflow.

## Debugging Features

The DebuggingAgent provides several key capabilities:

- Task monitoring and execution time tracking
- Detailed error logging with contextual information
- AI-powered error analysis and recommended fixes
- Workflow health reports with optimization suggestions
- Performance metrics for each model and task

## MCP Integration

This project is designed to work with the Model Context Protocol (MCP) to enable AI models to interact with your system:

- `mcp-shell-executor` - For executing shell commands
- `mcp-filesystem-executor` - For file operations
- `mcp-browser-executor` - For web browsing
- `mcp-python-executor` - For Python code execution

## Notes

- Each model will only be used if its corresponding API key is configured
- If a model is unavailable, the workflow will continue with placeholder data
- You can test individual models using `test_models.py` 
- Debug logs provide valuable insights into workflow performance 