# AI Models Orchestration Framework

This project demonstrates how to use multiple AI models together in a coordinated workflow, with each model focused on its specific strengths.

## Models Configuration

The framework is configured to use the following AI models:

1. **ClaudePlanner** (Claude 3.5 Sonnet) - Strategic planning and architecture
2. **ForgeMind** (GPT-4 Turbo) - Code architecture and problem-solving
3. **Actuator3O** (GPT-4o) - UI/UX design and visual thinking
4. **Windserf** (GPT-3.5 Turbo) - CLI automation and implementation tasks

## Setup

1. Clone this repository
2. Create a `.env` file with the following API keys:
   ```
   # Anthropic API key (required for ClaudePlanner)
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # OpenAI API key (required for ForgeMind, Actuator3O, and Windserf)
   OPENAI_API_KEY=your_openai_api_key_here
   ```
3. Install required packages:
   ```
   pip install -r requirements.txt
   ```

## Available Scripts

- `claude_cli.py` - Simple CLI for interacting directly with Claude
- `ai_orchestrator.py` - Core module for orchestrating multiple AI models
- `test_models.py` - Test script for individual models
- `workflow_demo.py` - Complete workflow demonstration

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

3. **UI/UX Design Phase** (Actuator3O)
   - Designs key screens and layouts
   - Defines user flows
   - Creates UI components

4. **Automation Phase** (Windserf)
   - Generates shell commands for setup
   - Creates automation scripts
   - Provides deployment instructions

## Running the Workflow Demo

```bash
python workflow_demo.py
```

The results will be saved in the `workflow_results` directory.

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