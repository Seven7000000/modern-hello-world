#!/usr/bin/env python3
import asyncio
import os
import json
import time
from concurrent.futures import ThreadPoolExecutor
from ai_orchestrator import AIOrchestrator

class ParallelWorkflow:
    def __init__(self):
        self.orchestrator = AIOrchestrator()
        self.results_dir = "parallel_results"
        os.makedirs(self.results_dir, exist_ok=True)
        
        # Initialize project task
        self.project = {
            "name": "E-commerce Platform",
            "description": "A modern e-commerce platform with product catalog, shopping cart, and payment processing"
        }
        
        # Define our models and tasks
        self.model_tasks = {
            "ClaudePlanner": {
                "task": "architecture_planning",
                "prompt": f"Create a high-level system architecture for {self.project['name']}: {self.project['description']}. Include key components, data flow, and technology recommendations. Format as JSON."
            },
            "Mistral": {
                "task": "database_schema",
                "prompt": f"Design a comprehensive database schema for {self.project['name']}. Include tables, relationships, indexes, and sample queries for common operations. Format as JSON."
            },
            "DeepSeekCoder": {
                "task": "api_endpoints",
                "prompt": f"Design RESTful API endpoints for {self.project['name']}. Include all necessary endpoints for product management, user accounts, shopping cart, and order processing. Format as JSON."
            },
            "ForgeMind": {
                "task": "security_analysis",
                "prompt": f"Perform a security analysis for {self.project['name']}. Identify potential vulnerabilities, suggest mitigation strategies, and recommend best practices for secure implementation. Format as JSON."
            },
            "Claude3Opus": {
                "task": "user_experience",
                "prompt": f"Create a detailed user experience plan for {self.project['name']}. Include user journeys, key interface elements, and recommendations for improving conversion rates. Format as JSON."
            }
        }
        
    def run_parallel_workflow(self):
        """Run all models in parallel on their respective tasks"""
        print("🚀 Starting parallel AI workflow with 5 models...\n")
        
        # Check which models are available based on API keys
        available_models = []
        if self.orchestrator.anthropic_client:
            available_models.extend(["ClaudePlanner", "Claude3Opus"])
        if self.orchestrator.openai_client:
            available_models.extend(["ForgeMind"])
        if self.orchestrator.openrouter_client:
            available_models.extend(["Mistral", "DeepSeekCoder", "Claude3Opus", "OpenLlama"])
            
        print(f"Available models: {', '.join(available_models)}\n")
        
        # Filter tasks to only include available models
        tasks = {model: self.model_tasks[model] for model in self.model_tasks if model in available_models}
        if not tasks:
            print("❌ No available models found. Please configure API keys in your .env file.")
            return
            
        # Use ThreadPoolExecutor for parallel execution
        start_time = time.time()
        results = {}
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            # Create futures for each task
            futures = {
                model: executor.submit(self._run_task, model, task_info)
                for model, task_info in tasks.items()
            }
            
            # Process results as they complete
            for model, future in futures.items():
                try:
                    result = future.result()
                    results[model] = result
                    print(f"✅ Model {model} completed task: {tasks[model]['task']}")
                except Exception as e:
                    print(f"❌ Model {model} failed: {str(e)}")
                    
        # Save combined results
        with open(os.path.join(self.results_dir, "combined_results.json"), "w") as f:
            json.dump(results, f, indent=2)
            
        elapsed_time = time.time() - start_time
        print(f"\n✨ Parallel workflow completed in {elapsed_time:.2f} seconds")
        print(f"📝 Results saved in {self.results_dir}/combined_results.json")
        
    def _run_task(self, model, task_info):
        """Run a single task with the specified model"""
        print(f"🔄 Running {task_info['task']} with {model}...")
        
        try:
            # Get completion from the model
            response = self.orchestrator.get_completion(model, task_info['prompt'])
            
            # Extract and parse the JSON result
            result = self._extract_json_from_text(response)
            
            # Save individual result
            task_file = f"{task_info['task']}_{model}.json"
            with open(os.path.join(self.results_dir, task_file), "w") as f:
                json.dump(result, f, indent=2)
                
            return {
                "task": task_info['task'],
                "model": model,
                "result": result
            }
            
        except Exception as e:
            print(f"Error with {model} on {task_info['task']}: {str(e)}")
            return {
                "task": task_info['task'],
                "model": model,
                "error": str(e),
                "result": {"error": "Task failed"}
            }
    
    def _extract_json_from_text(self, text):
        """Extract JSON from text that might contain markdown or other formatting"""
        try:
            # Try to parse the entire text as JSON
            return json.loads(text)
        except json.JSONDecodeError:
            # If that fails, try to find JSON within the text
            try:
                # Look for text between triple backticks
                import re
                json_match = re.search(r'```json\s*([\s\S]*?)\s*```', text)
                if json_match:
                    return json.loads(json_match.group(1))
                
                # If no triple backticks, look for text between curly braces
                json_match = re.search(r'(\{[\s\S]*\})', text)
                if json_match:
                    return json.loads(json_match.group(1))
                
                # If all else fails, return the text as is
                return {"raw_text": text}
            except Exception:
                return {"raw_text": text}

if __name__ == "__main__":
    workflow = ParallelWorkflow()
    workflow.run_parallel_workflow() 