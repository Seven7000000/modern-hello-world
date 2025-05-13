#!/usr/bin/env python3
import argparse
from ai_orchestrator import AIOrchestrator

def test_model(model_name, prompt):
    """Test a specific model with a prompt."""
    print(f"\n🧪 Testing model: {model_name}")
    print(f"🔍 Prompt: '{prompt}'")
    print("⏳ Waiting for response...")
    
    orchestrator = AIOrchestrator()
    
    try:
        response = orchestrator.get_completion(model_name, prompt)
        print("\n📝 Response:")
        print("=" * 80)
        print(response)
        print("=" * 80)
        return True
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def list_models():
    """List all available models."""
    orchestrator = AIOrchestrator()
    models = orchestrator.list_available_models()
    
    print("\n📋 Available Models:")
    print("=" * 80)
    for i, model in enumerate(models, 1):
        config = orchestrator.models_config[model]
        print(f"{i}. {model}")
        print(f"   Model: {config['model']}")
        print(f"   System: {config['systemMessage'][:60]}...")
        print()
    
    return models

def main():
    parser = argparse.ArgumentParser(description="Test AI models from the orchestrator")
    parser.add_argument("--list", action="store_true", help="List all available models")
    parser.add_argument("--model", help="Model to test")
    parser.add_argument("--prompt", default="Write a short function to calculate the first 10 Fibonacci numbers.", 
                      help="Prompt to send to the model")
    parser.add_argument("--all", action="store_true", help="Test all models with the same prompt")
    
    args = parser.parse_args()
    
    if args.list:
        list_models()
        return
    
    if args.all:
        models = list_models()
        print("\n🚀 Testing all models with the same prompt...\n")
        
        results = {}
        for model in models:
            success = test_model(model, args.prompt)
            results[model] = "✅ Success" if success else "❌ Failed"
        
        print("\n📊 Test Results Summary:")
        print("=" * 80)
        for model, result in results.items():
            print(f"{model}: {result}")
        
    elif args.model:
        test_model(args.model, args.prompt)
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 