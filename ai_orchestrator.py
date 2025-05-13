#!/usr/bin/env python3
import json
import os
import anthropic
import openai
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AIOrchestrator:
    def __init__(self, config_path="ai_models_config.json"):
        """Initialize the AI orchestrator with model configurations."""
        # Load API keys
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        
        # Initialize clients
        if self.anthropic_api_key:
            self.anthropic_client = anthropic.Anthropic(api_key=self.anthropic_api_key)
        else:
            print("Warning: ANTHROPIC_API_KEY not found")
            self.anthropic_client = None
            
        if self.openai_api_key:
            self.openai_client = openai.OpenAI(api_key=self.openai_api_key)
        else:
            print("Warning: OPENAI_API_KEY not found")
            self.openai_client = None
            
        if self.openrouter_api_key:
            self.openrouter_client = True  # We'll use httpx directly for OpenRouter
        else:
            print("Warning: OPENROUTER_API_KEY not found")
            self.openrouter_client = None
        
        # Load model configurations
        with open(config_path, 'r') as f:
            self.models_config = json.load(f)
            
        print(f"Loaded {len(self.models_config)} AI models configuration")
        
    def list_available_models(self):
        """List all available AI models from configuration."""
        return list(self.models_config.keys())
    
    def get_completion(self, model_name, prompt):
        """Get completion from specified model."""
        if model_name not in self.models_config:
            raise ValueError(f"Model {model_name} not found in configuration")
        
        config = self.models_config[model_name]
        model_path = config["model"]
        system_message = config["systemMessage"]
        
        # Check if this is an OpenRouter model (either explicitly or converted)
        if model_path.startswith("openrouter/"):
            if self.openrouter_client:
                return self._get_openrouter_completion(model_path, system_message, prompt)
            else:
                raise ValueError("OpenRouter API key not configured")
                
        # Handle direct provider models
        provider, model = model_path.split("/", 1)
        
        if provider == "anthropic" and self.anthropic_client:
            return self._get_anthropic_completion(model, system_message, prompt)
        elif provider == "openai" and self.openai_client:
            return self._get_openai_completion(model, system_message, prompt)
        else:
            # Fallback to OpenRouter for any provider if we have the API key
            if self.openrouter_client:
                openrouter_model = f"openrouter/{model_path}"
                return self._get_openrouter_completion(openrouter_model, system_message, prompt)
            else:
                raise ValueError(f"Provider {provider} not configured or supported")
    
    def _get_anthropic_completion(self, model, system_message, prompt):
        """Get completion from Anthropic Claude models."""
        response = self.anthropic_client.messages.create(
            model=model,
            max_tokens=1000,
            system=system_message,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return response.content[0].text
    
    def _get_openai_completion(self, model, system_message, prompt):
        """Get completion from OpenAI models."""
        response = self.openai_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
        
    def _get_openrouter_completion(self, model, system_message, prompt):
        """Get completion from models via OpenRouter."""
        headers = {
            "Authorization": f"Bearer {self.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://aiorchestrator.local", # Identifying your app
            "X-Title": "AI Orchestrator"                   # Title of your app
        }
        
        # Extract just the model part for OpenRouter
        if model.startswith("openrouter/"):
            model = model[len("openrouter/"):]
        
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 1000
        }
        
        response = httpx.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=90.0  # Increased timeout for longer generations
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenRouter API error: {response.status_code} - {response.text}")
            
        result = response.json()
        return result["choices"][0]["message"]["content"]

if __name__ == "__main__":
    # Example usage
    orchestrator = AIOrchestrator()
    
    print("Available models:")
    for model in orchestrator.list_available_models():
        print(f" - {model}: {orchestrator.models_config[model]['model']}")
    
    # Example: You can uncomment and use this to test a model if API keys are configured
    # print("\nTesting a model:")
    # response = orchestrator.get_completion("Mistral", "Write a short function to calculate fibonacci numbers")
    # print(response) 