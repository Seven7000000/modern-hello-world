#!/usr/bin/env python3
import json
import os
import time
import traceback
from ai_orchestrator import AIOrchestrator

class DebugAgent:
    def __init__(self, results_dir="debug_logs"):
        """Initialize the debugging agent with a results directory."""
        self.orchestrator = AIOrchestrator()
        self.results_dir = results_dir
        os.makedirs(self.results_dir, exist_ok=True)
        self.session_log = []
        self.session_id = int(time.time())
        self.error_count = 0
        
    def log_task_start(self, model, task_name, prompt):
        """Log when a task starts."""
        log_entry = {
            "timestamp": time.time(),
            "event": "task_start",
            "model": model,
            "task": task_name,
            "prompt_length": len(prompt)
        }
        self.session_log.append(log_entry)
        return log_entry
        
    def log_task_success(self, model, task_name, execution_time, result=None):
        """Log when a task completes successfully."""
        log_entry = {
            "timestamp": time.time(),
            "event": "task_success",
            "model": model,
            "task": task_name,
            "execution_time": execution_time
        }
        
        if result:
            # Store a summary rather than the full result to keep logs manageable
            if isinstance(result, dict):
                log_entry["result_keys"] = list(result.keys())
                log_entry["result_size"] = len(json.dumps(result))
            else:
                log_entry["result_size"] = len(str(result))
                
        self.session_log.append(log_entry)
        return log_entry
        
    def log_task_error(self, model, task_name, error, execution_time=None, context=None):
        """Log when a task encounters an error."""
        self.error_count += 1
        
        log_entry = {
            "timestamp": time.time(),
            "event": "task_error",
            "model": model,
            "task": task_name,
            "error_type": type(error).__name__,
            "error_message": str(error),
            "error_id": f"ERR-{self.session_id}-{self.error_count}",
            "traceback": traceback.format_exc()
        }
        
        if execution_time:
            log_entry["execution_time"] = execution_time
            
        if context:
            log_entry["context"] = context
            
        self.session_log.append(log_entry)
        self._save_session_log()
        return log_entry
    
    def analyze_error(self, error_log_entry):
        """Use the DebuggingAgent to analyze an error and suggest fixes."""
        if not self.orchestrator.is_model_available("DebuggingAgent"):
            return {
                "analysis": "DebuggingAgent model not available. Error analysis skipped.",
                "suggestions": ["Configure API keys for DebuggingAgent."]
            }
            
        error_context = json.dumps(error_log_entry, indent=2)
        
        prompt = f"""
        Analyze this error that occurred during an AI workflow task:
        
        {error_context}
        
        Provide:
        1. Root cause analysis
        2. Specific debugging steps to diagnose the issue
        3. Recommended fixes
        4. Prevention strategies for future runs
        
        Format your response as JSON with the following structure:
        {{
            "root_cause": "Description of the likely root cause",
            "debugging_steps": ["Step 1", "Step 2", ...],
            "fixes": ["Fix 1", "Fix 2", ...],
            "prevention": ["Prevention tip 1", "Prevention tip 2", ...]
        }}
        """
        
        try:
            response = self.orchestrator.get_completion("DebuggingAgent", prompt)
            analysis = self._extract_json_from_text(response)
            
            # Save the analysis
            filename = f"error_analysis_{error_log_entry['error_id']}.json"
            with open(os.path.join(self.results_dir, filename), 'w') as f:
                json.dump(analysis, f, indent=2)
                
            return analysis
        except Exception as e:
            # If the analysis itself fails, log that too
            fallback_analysis = {
                "root_cause": "Error analysis failed",
                "debugging_steps": [f"Check DebuggingAgent availability: {str(e)}"],
                "fixes": ["Verify API keys", "Check model availability"],
                "prevention": ["Ensure DebuggingAgent is properly configured"]
            }
            return fallback_analysis
    
    def monitor_workflow(self, models_used):
        """Generate a health report for the current workflow session."""
        if not self.orchestrator.is_model_available("DebuggingAgent"):
            return {
                "status": "No monitoring available",
                "reason": "DebuggingAgent model not available"
            }
            
        # Create a summary of the session for the DebuggingAgent to analyze
        task_counts = {
            "total": len(self.session_log),
            "success": len([log for log in self.session_log if log["event"] == "task_success"]),
            "errors": len([log for log in self.session_log if log["event"] == "task_error"]),
            "models": {model: 0 for model in models_used}
        }
        
        for log in self.session_log:
            if "model" in log and log["model"] in task_counts["models"]:
                task_counts["models"][log["model"]] += 1
                
        session_summary = {
            "session_id": self.session_id,
            "task_counts": task_counts,
            "duration": time.time() - self.session_log[0]["timestamp"] if self.session_log else 0,
            "error_rate": task_counts["errors"] / task_counts["total"] if task_counts["total"] > 0 else 0
        }
        
        prompt = f"""
        Generate a health report for this AI workflow session:
        
        {json.dumps(session_summary, indent=2)}
        
        Provide:
        1. Overall health assessment
        2. Performance metrics analysis
        3. Bottlenecks or optimization opportunities
        4. Recommendations for improving reliability
        
        Format your response as JSON.
        """
        
        try:
            response = self.orchestrator.get_completion("DebuggingAgent", prompt)
            health_report = self._extract_json_from_text(response)
            
            # Save the health report
            filename = f"health_report_{self.session_id}.json"
            with open(os.path.join(self.results_dir, filename), 'w') as f:
                json.dump(health_report, f, indent=2)
                
            return health_report
        except Exception as e:
            fallback_report = {
                "status": "Health report generation failed",
                "error": str(e),
                "session_summary": session_summary
            }
            return fallback_report
    
    def _save_session_log(self):
        """Save the current session log to a file."""
        filename = f"session_log_{self.session_id}.json"
        with open(os.path.join(self.results_dir, filename), 'w') as f:
            json.dump(self.session_log, f, indent=2)
    
    def _extract_json_from_text(self, text):
        """Extract JSON from text that might contain markdown or other formatting."""
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

# Example usage
if __name__ == "__main__":
    debug_agent = DebugAgent()
    print("Debug agent initialized. Use in your workflow with:")
    print("from debug_agent import DebugAgent")
    print("debug_agent = DebugAgent()")
    print("# Then use debug_agent.log_task_start(), debug_agent.log_task_success(), etc.") 