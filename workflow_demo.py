#!/usr/bin/env python3
from ai_orchestrator import AIOrchestrator
from debug_agent import DebugAgent
import json
import os
import time

class WorkflowDemo:
    def __init__(self):
        self.orchestrator = AIOrchestrator()
        self.debug_agent = DebugAgent(results_dir="workflow_results/debug")
        self.project_data = {
            "name": "HelloWorldApp",
            "description": "A modern web application that displays Hello World with style",
            "planning": {},
            "code_architecture": {},
            "ui_design": {},
            "automation": {}
        }
        self.results_dir = "workflow_results"
        self.available_models = []  # Initialize available_models
        os.makedirs(self.results_dir, exist_ok=True)
        
    def run_workflow(self, only_available_models=True):
        """Run the complete workflow using all models in sequence"""
        print("Starting AI workflow demonstration...\n")
        
        # Check which models are available based on API keys
        if self.orchestrator.anthropic_client:
            self.available_models.extend(["ClaudePlanner", "ForgeMind", "Actuator4o"])
        if self.orchestrator.openai_client:
            self.available_models.extend(["CommandRunner"])
        if self.orchestrator.openrouter_client:  # Add this check for OpenRouter
            self.available_models.extend(["ClaudePlanner", "ForgeMind", "Actuator4o", "CommandRunner", "DebuggingAgent"])
            
        print(f"Available models: {', '.join(self.available_models)}\n")
        
        # Step 1: High-level planning with ClaudePlanner
        print("👑 STEP 1: Strategic Planning with ClaudePlanner (Claude-3.5-Sonnet)")
        planning_success = self._run_planning_step()
        if not planning_success and only_available_models:
            print("❌ Planning step failed, workflow cannot continue.")
            return
            
        # Step 2: Code architecture with ForgeMind
        print("👑 STEP 2: Code Architecture with ForgeMind (Claude-3-Opus)")
        code_success = self._run_code_architecture_step()
        if not code_success and only_available_models:
            print("❌ Code architecture step failed, workflow cannot continue.")
            return
        
        # Step 3: UI/UX design with Actuator4o
        print("👑 STEP 3: UI/UX Design with Actuator4o (Claude-3-Sonnet)")
        ui_success = self._run_ui_design_step()
        if not ui_success and only_available_models:
            print("❌ UI/UX design step failed, workflow cannot continue.")
            return
            
        # Step 4: CLI automation with CommandRunner
        print("👑 STEP 4: CLI Automation with CommandRunner (GPT-3.5-Turbo)")
        automation_success = self._run_automation_step()
        if not automation_success and only_available_models:
            print("❌ CLI automation step failed.")
            
        # Generate workflow health report
        health_report = self.debug_agent.monitor_workflow(["ClaudePlanner", "ForgeMind", "Actuator4o", "CommandRunner"])
        if "status" in health_report and health_report["status"] != "No monitoring available":
            print("\n📊 Workflow Health Report:")
            print(f"Status: {health_report.get('status', 'Unknown')}")
            if "recommendations" in health_report:
                print("Recommendations:")
                for rec in health_report["recommendations"][:3]:  # Show top 3 recommendations
                    print(f"- {rec}")
            
        # Save final project data
        self._save_result("complete_project.json", self.project_data)
        print("📝 Workflow complete! Results saved in the workflow_results directory")
        print(f"🔍 Debug logs saved in {self.debug_agent.results_dir}/")
    
    def _run_planning_step(self):
        """Run the planning step with ClaudePlanner"""
        if "ClaudePlanner" not in self.available_models:
            print("👑 STEP 1: Strategic Planning with ClaudePlanner (Claude-3.5-Sonnet) - SKIPPED (Model not available)")
            return False
            
        print("👑 STEP 1: Strategic Planning with ClaudePlanner (Claude-3.5-Sonnet)")
        planning_prompt = f"""
        Create a high-level architecture plan for {self.project_data['name']}: {self.project_data['description']}.
        Include:
        1. Key components and their interactions
        2. Data storage approach
        3. Major features and workflows
        4. Technology stack recommendations
        
        Format your response as JSON suitable for further processing.
        """
        
        # Log task start
        start_time = time.time()
        self.debug_agent.log_task_start("ClaudePlanner", "planning", planning_prompt)
        
        try:
            planning_result = self.orchestrator.get_completion("ClaudePlanner", planning_prompt)
            self.project_data["planning"] = self._extract_json_from_text(planning_result)
            self._save_result("1_planning.json", self.project_data["planning"])
            
            # Log task success
            execution_time = time.time() - start_time
            self.debug_agent.log_task_success("ClaudePlanner", "planning", execution_time, self.project_data["planning"])
            
            print("✅ Planning completed successfully\n")
            return True
        except Exception as e:
            # Log error with debugging agent
            execution_time = time.time() - start_time
            error_log = self.debug_agent.log_task_error(
                "ClaudePlanner", 
                "planning", 
                e, 
                execution_time,
                {"prompt": planning_prompt}
            )
            
            # Get error analysis
            analysis = self.debug_agent.analyze_error(error_log)
            print(f"🔍 Error analysis for planning step:")
            print(f"   Root cause: {analysis.get('root_cause', 'Unknown')}")
            if "fixes" in analysis and len(analysis["fixes"]) > 0:
                print(f"   Suggested fix: {analysis['fixes'][0]}")
            
            print(f"❌ Planning failed: {str(e)}")
            # For demo purposes, create a placeholder planning result
            self.project_data["planning"] = {
                "components": {
                    "frontend": "Web interface for task management",
                    "backend": "API for task operations",
                    "database": "Storage for tasks and users"
                },
                "storage": "SQL database for structured task data",
                "features": ["Task CRUD", "User authentication", "Task prioritization"],
                "technology": ["Python/Flask", "React", "PostgreSQL"]
            }
            return False
            
    def _run_code_architecture_step(self):
        """Run the code architecture step with ForgeMind"""
        if "ForgeMind" not in self.available_models:
            print("👑 STEP 2: Code Architecture with ForgeMind (Claude-3-Opus) - SKIPPED (Model not available)")
            return False
            
        print("👑 STEP 2: Code Architecture with ForgeMind (Claude-3-Opus)")
        code_prompt = f"""
        Based on this planning document:
        {json.dumps(self.project_data['planning'], indent=2)}
        
        Design the core code structure for {self.project_data['name']}.
        Include:
        1. Key classes and their methods
        2. File structure
        3. Database schema (if applicable)
        4. API endpoints (if applicable)
        
        Format your response as JSON suitable for further processing.
        """
        
        # Log task start
        start_time = time.time()
        self.debug_agent.log_task_start("ForgeMind", "code_architecture", code_prompt)
        
        try:
            code_result = self.orchestrator.get_completion("ForgeMind", code_prompt)
            self.project_data["code_architecture"] = self._extract_json_from_text(code_result)
            self._save_result("2_code_architecture.json", self.project_data["code_architecture"])
            
            # Log task success
            execution_time = time.time() - start_time
            self.debug_agent.log_task_success("ForgeMind", "code_architecture", execution_time, self.project_data["code_architecture"])
            
            print("✅ Code architecture completed successfully\n")
            return True
        except Exception as e:
            # Log error with debugging agent
            execution_time = time.time() - start_time
            error_log = self.debug_agent.log_task_error(
                "ForgeMind", 
                "code_architecture", 
                e, 
                execution_time,
                {"prompt": code_prompt}
            )
            
            # Get error analysis
            analysis = self.debug_agent.analyze_error(error_log)
            print(f"🔍 Error analysis for code architecture step:")
            print(f"   Root cause: {analysis.get('root_cause', 'Unknown')}")
            if "fixes" in analysis and len(analysis["fixes"]) > 0:
                print(f"   Suggested fix: {analysis['fixes'][0]}")
            
            print(f"❌ Code architecture failed: {str(e)}")
            # For demo purposes, create a placeholder code architecture
            self.project_data["code_architecture"] = {
                "classes": {
                    "Task": ["__init__", "update", "delete"],
                    "User": ["__init__", "authenticate"]
                },
                "file_structure": {
                    "app": ["models.py", "routes.py", "auth.py"],
                    "static": ["css", "js"],
                    "templates": ["index.html", "tasks.html"]
                }
            }
            return False
        
    def _run_ui_design_step(self):
        """Run the UI design step with Actuator4o"""
        if "Actuator4o" not in self.available_models:
            print("👑 STEP 3: UI/UX Design with Actuator4o (Claude-3-Sonnet) - SKIPPED (Model not available)")
            return False
            
        print("👑 STEP 3: UI/UX Design with Actuator4o (Claude-3-Sonnet)")
        ui_prompt = f"""
        Based on this project information:
        Planning: {json.dumps(self.project_data['planning'], indent=2)}
        Code: {json.dumps(self.project_data['code_architecture'], indent=2)}
        
        Design the user interface for {self.project_data['name']}.
        Include:
        1. Key screens and their layouts
        2. User flow
        3. Key UI components
        4. Design principles and styling approach
        
        Format your response as JSON suitable for further processing.
        """
        
        # Log task start
        start_time = time.time()
        self.debug_agent.log_task_start("Actuator4o", "ui_design", ui_prompt)
        
        try:
            ui_result = self.orchestrator.get_completion("Actuator4o", ui_prompt)
            self.project_data["ui_design"] = self._extract_json_from_text(ui_result)
            self._save_result("3_ui_design.json", self.project_data["ui_design"])
            
            # Log task success
            execution_time = time.time() - start_time
            self.debug_agent.log_task_success("Actuator4o", "ui_design", execution_time, self.project_data["ui_design"])
            
            print("✅ UI/UX design completed successfully\n")
            return True
        except Exception as e:
            # Log error with debugging agent
            execution_time = time.time() - start_time
            error_log = self.debug_agent.log_task_error(
                "Actuator4o", 
                "ui_design", 
                e, 
                execution_time,
                {"prompt": ui_prompt}
            )
            
            # Get error analysis
            analysis = self.debug_agent.analyze_error(error_log)
            print(f"🔍 Error analysis for UI design step:")
            print(f"   Root cause: {analysis.get('root_cause', 'Unknown')}")
            if "fixes" in analysis and len(analysis["fixes"]) > 0:
                print(f"   Suggested fix: {analysis['fixes'][0]}")
            
            print(f"❌ UI/UX design failed: {str(e)}")
            # For demo purposes, create a placeholder UI design
            self.project_data["ui_design"] = {
                "screens": ["Login", "Dashboard", "Task Detail"],
                "workflow": "Login -> Dashboard -> Task Detail -> Edit Task",
                "components": ["TaskCard", "NavBar", "TaskForm"]
            }
            return False
            
    def _run_automation_step(self):
        """Run the automation step with CommandRunner"""
        if "CommandRunner" not in self.available_models:
            print("👑 STEP 4: CLI Automation with CommandRunner (GPT-3.5-Turbo) - SKIPPED (Model not available)")
            return False
            
        print("👑 STEP 4: CLI Automation with CommandRunner (GPT-3.5-Turbo)")
        automation_prompt = f"""
        Based on this project information:
        Planning: {json.dumps(self.project_data['planning'], indent=2)}
        Code: {json.dumps(self.project_data['code_architecture'], indent=2)}
        
        Create shell commands to:
        1. Set up the initial project structure
        2. Initialize necessary environment
        3. Create starter files based on the architecture
        4. Add commands to run and test the application
        
        Format your response as JSON with command sequences suitable for further processing.
        """
        
        # Log task start
        start_time = time.time()
        self.debug_agent.log_task_start("CommandRunner", "automation", automation_prompt)
        
        try:
            automation_result = self.orchestrator.get_completion("CommandRunner", automation_prompt)
            self.project_data["automation"] = self._extract_json_from_text(automation_result)
            self._save_result("4_automation.json", self.project_data["automation"])
            
            # Log task success
            execution_time = time.time() - start_time
            self.debug_agent.log_task_success("CommandRunner", "automation", execution_time, self.project_data["automation"])
            
            print("✅ CLI automation completed successfully\n")
            return True
        except Exception as e:
            # Log error with debugging agent
            execution_time = time.time() - start_time
            error_log = self.debug_agent.log_task_error(
                "CommandRunner", 
                "automation", 
                e, 
                execution_time,
                {"prompt": automation_prompt}
            )
            
            # Get error analysis
            analysis = self.debug_agent.analyze_error(error_log)
            print(f"🔍 Error analysis for automation step:")
            print(f"   Root cause: {analysis.get('root_cause', 'Unknown')}")
            if "fixes" in analysis and len(analysis["fixes"]) > 0:
                print(f"   Suggested fix: {analysis['fixes'][0]}")
            
            print(f"❌ CLI automation failed: {str(e)}")
            # For demo purposes, create a placeholder automation
            self.project_data["automation"] = {
                "setup": [
                    "mkdir -p app/static/{css,js}",
                    "mkdir -p app/templates",
                    "touch app/{__init__,models,routes,auth}.py"
                ],
                "environment": [
                    "python -m venv venv",
                    "source venv/bin/activate",
                    "pip install flask flask-sqlalchemy"
                ]
            }
            return False
            
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
    
    def _save_result(self, filename, data):
        """Save result to a JSON file"""
        with open(os.path.join(self.results_dir, filename), 'w') as f:
            json.dump(data, f, indent=2)

if __name__ == "__main__":
    workflow = WorkflowDemo()
    workflow.run_workflow(only_available_models=False)  # Set to True to stop on failures 