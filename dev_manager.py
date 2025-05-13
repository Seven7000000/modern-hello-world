#!/usr/bin/env python3
import os
import json
import time
import argparse
import datetime
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from ai_orchestrator import AIOrchestrator

class TaskStatus:
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    REVIEW = "review"

class DevManager:
    def __init__(self, tasks_file="tasks.json", workspace_dir="."):
        self.orchestrator = AIOrchestrator()
        self.tasks_file = tasks_file
        self.workspace_dir = workspace_dir
        self.tasks_dir = "dev_tasks"
        self.logs_dir = os.path.join(self.tasks_dir, "logs")
        
        # Create directories if they don't exist
        os.makedirs(self.tasks_dir, exist_ok=True)
        os.makedirs(self.logs_dir, exist_ok=True)
        
        # Load tasks or create new tasks file
        self.tasks = self._load_tasks()
        
        # File watcher for task-related files
        self.observer = None
        
    def _load_tasks(self):
        """Load tasks from JSON file or create new file if it doesn't exist"""
        if os.path.exists(self.tasks_file):
            try:
                with open(self.tasks_file, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                print(f"⚠️ Error: Tasks file {self.tasks_file} is corrupted. Creating new file.")
        
        # Create new tasks file
        tasks = {
            "tasks": [],
            "metadata": {
                "created_at": datetime.datetime.now().isoformat(),
                "updated_at": datetime.datetime.now().isoformat()
            }
        }
        self._save_tasks(tasks)
        return tasks
    
    def _save_tasks(self, tasks=None):
        """Save tasks to JSON file"""
        if tasks is None:
            tasks = self.tasks
            
        tasks["metadata"]["updated_at"] = datetime.datetime.now().isoformat()
        
        with open(self.tasks_file, 'w') as f:
            json.dump(tasks, f, indent=2)
    
    def add_task(self, title, description, checklist=None, due_date=None, assignee=None, 
                 priority="medium", related_files=None, tags=None):
        """Add a new task"""
        task_id = len(self.tasks["tasks"]) + 1
        
        task = {
            "id": task_id,
            "title": title,
            "description": description,
            "status": TaskStatus.PENDING,
            "checklist": checklist or [],
            "due_date": due_date,
            "assignee": assignee,
            "priority": priority,
            "related_files": related_files or [],
            "tags": tags or [],
            "created_at": datetime.datetime.now().isoformat(),
            "updated_at": datetime.datetime.now().isoformat(),
            "comments": []
        }
        
        self.tasks["tasks"].append(task)
        self._save_tasks()
        
        # Generate initial documentation for related files
        if related_files:
            self._generate_task_documentation(task)
        
        print(f"✅ Task {task_id} added: {title}")
        return task_id
    
    def update_task(self, task_id, **kwargs):
        """Update an existing task"""
        task = self._get_task_by_id(task_id)
        if not task:
            print(f"❌ Task {task_id} not found")
            return False
        
        for key, value in kwargs.items():
            if key in task:
                task[key] = value
        
        task["updated_at"] = datetime.datetime.now().isoformat()
        self._save_tasks()
        
        print(f"✅ Task {task_id} updated")
        return True
    
    def get_task(self, task_id):
        """Get a task by ID"""
        task = self._get_task_by_id(task_id)
        if not task:
            print(f"❌ Task {task_id} not found")
            return None
        
        return task
    
    def list_tasks(self, status=None, assignee=None, tags=None):
        """List tasks with optional filtering"""
        tasks = self.tasks["tasks"]
        
        if status:
            tasks = [t for t in tasks if t["status"] == status]
        
        if assignee:
            tasks = [t for t in tasks if t["assignee"] == assignee]
        
        if tags:
            if isinstance(tags, str):
                tags = [tags]
            tasks = [t for t in tasks if any(tag in t["tags"] for tag in tags)]
        
        return tasks
    
    def add_comment(self, task_id, comment, author=None):
        """Add a comment to a task"""
        task = self._get_task_by_id(task_id)
        if not task:
            print(f"❌ Task {task_id} not found")
            return False
        
        task["comments"].append({
            "author": author or "System",
            "text": comment,
            "timestamp": datetime.datetime.now().isoformat()
        })
        
        self._save_tasks()
        return True
    
    def update_checklist(self, task_id, item_index, completed):
        """Update a checklist item's completion status"""
        task = self._get_task_by_id(task_id)
        if not task:
            print(f"❌ Task {task_id} not found")
            return False
        
        if not 0 <= item_index < len(task["checklist"]):
            print(f"❌ Checklist item {item_index} not found")
            return False
        
        task["checklist"][item_index]["completed"] = completed
        
        # Check if all items are completed
        all_completed = all(item["completed"] for item in task["checklist"])
        if all_completed and task["status"] != TaskStatus.COMPLETED:
            task["status"] = TaskStatus.REVIEW
            self.add_comment(task_id, "All checklist items completed. Task moved to review status.")
        
        self._save_tasks()
        return True
    
    def start_watching(self):
        """Start watching for file changes"""
        if self.observer is not None:
            print("⚠️ Already watching for changes")
            return
        
        event_handler = TaskFileHandler(self)
        self.observer = Observer()
        self.observer.schedule(event_handler, self.workspace_dir, recursive=True)
        self.observer.start()
        
        print(f"👀 Watching for changes in {self.workspace_dir}")
    
    def stop_watching(self):
        """Stop watching for file changes"""
        if self.observer is None:
            print("⚠️ Not watching for changes")
            return
        
        self.observer.stop()
        self.observer.join()
        self.observer = None
        
        print("👋 Stopped watching for changes")
    
    def generate_progress_report(self):
        """Generate a progress report for all tasks"""
        report = {
            "total_tasks": len(self.tasks["tasks"]),
            "completed_tasks": len([t for t in self.tasks["tasks"] if t["status"] == TaskStatus.COMPLETED]),
            "in_progress_tasks": len([t for t in self.tasks["tasks"] if t["status"] == TaskStatus.IN_PROGRESS]),
            "pending_tasks": len([t for t in self.tasks["tasks"] if t["status"] == TaskStatus.PENDING]),
            "blocked_tasks": len([t for t in self.tasks["tasks"] if t["status"] == TaskStatus.BLOCKED]),
            "review_tasks": len([t for t in self.tasks["tasks"] if t["status"] == TaskStatus.REVIEW]),
            "overdue_tasks": []
        }
        
        # Check for overdue tasks
        now = datetime.datetime.now()
        for task in self.tasks["tasks"]:
            if task["due_date"]:
                due_date = datetime.datetime.fromisoformat(task["due_date"])
                if due_date < now and task["status"] != TaskStatus.COMPLETED:
                    report["overdue_tasks"].append({
                        "id": task["id"],
                        "title": task["title"],
                        "due_date": task["due_date"],
                        "days_overdue": (now - due_date).days
                    })
        
        # Generate report using AI
        try:
            report_text = self._generate_report(report)
            
            # Save report
            report_file = os.path.join(self.tasks_dir, f"progress_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.md")
            with open(report_file, 'w') as f:
                f.write(report_text)
                
            print(f"📊 Progress report saved to: {report_file}")
            return report_file
        except Exception as e:
            print(f"❌ Error generating report: {str(e)}")
            return None
    
    def analyze_task_changes(self, task_id):
        """Analyze changes for a task and provide recommendations"""
        task = self._get_task_by_id(task_id)
        if not task:
            print(f"❌ Task {task_id} not found")
            return None
        
        # Get related files
        related_files = task.get("related_files", [])
        if not related_files:
            print(f"⚠️ No related files for task {task_id}")
            return None
        
        # Load documentation for related files
        docs = []
        for file_path in related_files:
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r') as f:
                        content = f.read()
                    docs.append({"file": file_path, "content": content})
                except Exception as e:
                    print(f"⚠️ Error reading file {file_path}: {str(e)}")
        
        if not docs:
            print(f"⚠️ Could not read any related files for task {task_id}")
            return None
        
        # Generate analysis using AI
        try:
            prompt = f"""
            Task: {task['title']}
            Description: {task['description']}
            Status: {task['status']}
            Checklist: {json.dumps(task['checklist'], indent=2)}
            
            Please analyze the task and the related files to provide:
            1. Current implementation status
            2. Potential issues or concerns
            3. Suggestions for improvement
            4. Next steps to complete the task
            
            Related files:
            {json.dumps(docs, indent=2)}
            
            Format your response as Markdown.
            """
            
            result = self.orchestrator.get_completion("DocMaster", prompt)
            
            # Save analysis
            analysis_file = os.path.join(self.tasks_dir, f"task_{task_id}_analysis_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.md")
            with open(analysis_file, 'w') as f:
                f.write(result)
                
            print(f"🔍 Task analysis saved to: {analysis_file}")
            return analysis_file
        except Exception as e:
            print(f"❌ Error analyzing task: {str(e)}")
            return None
    
    def _get_task_by_id(self, task_id):
        """Get a task by ID"""
        for task in self.tasks["tasks"]:
            if task["id"] == task_id:
                return task
        return None
    
    def _generate_task_documentation(self, task):
        """Generate documentation for files related to a task"""
        related_files = task.get("related_files", [])
        if not related_files:
            return
        
        try:
            # Import the documentation generator
            from generate_docs import DocumentationGenerator
            
            # Generate documentation for each file
            doc_generator = DocumentationGenerator()
            generated_files = []
            for file_path in related_files:
                if os.path.exists(file_path):
                    result = doc_generator.generate_documentation(source_file=file_path, doc_type="overview")
                    if result:
                        generated_files.append(result)
            
            if generated_files:
                comment = f"Generated documentation for {len(generated_files)} related files:\n"
                for doc_file in generated_files:
                    comment += f"- {doc_file}\n"
                self.add_comment(task["id"], comment)
        except Exception as e:
            print(f"⚠️ Error generating documentation: {str(e)}")
    
    def _generate_report(self, report_data):
        """Generate a progress report using AI"""
        prompt = f"""
        Please generate a comprehensive progress report based on the following data:
        {json.dumps(report_data, indent=2)}
        
        Include:
        1. Executive summary
        2. Detailed task status breakdown
        3. Overdue tasks analysis
        4. Recommendations for improving progress
        
        Format the report as Markdown with appropriate sections and formatting.
        """
        
        return self.orchestrator.get_completion("DocMaster", prompt)

class TaskFileHandler(FileSystemEventHandler):
    def __init__(self, dev_manager):
        self.dev_manager = dev_manager
        self.last_modified = {}
        
    def on_modified(self, event):
        if event.is_directory:
            return
            
        file_path = event.src_path
        
        # Skip non-code files and certain directories
        if any(d in file_path for d in ['.git', '__pycache__', 'node_modules']):
            return
            
        # Skip files that aren't code files
        code_extensions = ['.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.c', '.cpp', '.h', '.hpp']
        if not any(file_path.endswith(ext) for ext in code_extensions):
            return
            
        # Avoid duplicate events (some filesystems trigger multiple events)
        current_time = time.time()
        if file_path in self.last_modified:
            if current_time - self.last_modified[file_path] < 1:  # 1 second cooldown
                return
                
        self.last_modified[file_path] = current_time
        
        # Find tasks related to this file
        related_tasks = []
        for task in self.dev_manager.tasks["tasks"]:
            if file_path in task.get("related_files", []):
                related_tasks.append(task)
                
        # Log the change
        if related_tasks:
            log_file = os.path.join(
                self.dev_manager.logs_dir, 
                f"file_changes_{datetime.datetime.now().strftime('%Y%m%d')}.log"
            )
            
            with open(log_file, 'a') as f:
                f.write(f"{datetime.datetime.now().isoformat()}: {file_path} modified\n")
                f.write(f"Related tasks: {', '.join([str(t['id']) for t in related_tasks])}\n\n")
                
            # Add comment to related tasks
            for task in related_tasks:
                self.dev_manager.add_comment(
                    task["id"], 
                    f"File {file_path} was modified. Consider updating checklist or documentation."
                )
                
                # Update task status if it's pending
                if task["status"] == TaskStatus.PENDING:
                    self.dev_manager.update_task(task["id"], status=TaskStatus.IN_PROGRESS)

def main():
    parser = argparse.ArgumentParser(description="Development Task Manager")
    
    # Main arguments
    parser.add_argument("-a", "--add", action="store_true", help="Add a new task")
    parser.add_argument("-u", "--update", type=int, help="Update a task by ID")
    parser.add_argument("-l", "--list", action="store_true", help="List tasks")
    parser.add_argument("-g", "--get", type=int, help="Get a task by ID")
    parser.add_argument("-r", "--report", action="store_true", help="Generate a progress report")
    parser.add_argument("-w", "--watch", action="store_true", help="Start watching for file changes")
    parser.add_argument("--analyze", type=int, help="Analyze a task by ID")
    
    # Task parameters
    parser.add_argument("--title", help="Task title")
    parser.add_argument("--description", help="Task description")
    parser.add_argument("--status", choices=["pending", "in_progress", "completed", "blocked", "review"], help="Task status")
    parser.add_argument("--due-date", help="Due date (YYYY-MM-DD)")
    parser.add_argument("--assignee", help="Assignee name")
    parser.add_argument("--priority", choices=["low", "medium", "high"], help="Task priority")
    parser.add_argument("--files", nargs="+", help="Related files")
    parser.add_argument("--tags", nargs="+", help="Task tags")
    
    # Checklist parameters
    parser.add_argument("--add-item", help="Add checklist item")
    parser.add_argument("--complete-item", type=int, help="Mark checklist item as completed")
    parser.add_argument("--uncomplete-item", type=int, help="Mark checklist item as not completed")
    
    # Filter parameters
    parser.add_argument("--filter-status", help="Filter tasks by status")
    parser.add_argument("--filter-assignee", help="Filter tasks by assignee")
    parser.add_argument("--filter-tags", nargs="+", help="Filter tasks by tags")
    
    args = parser.parse_args()
    
    dev_manager = DevManager()
    
    if args.add:
        if not args.title or not args.description:
            print("❌ Title and description are required for adding a task")
            return
            
        checklist = []
        if args.add_item:
            checklist = [{"text": args.add_item, "completed": False}]
            
        dev_manager.add_task(
            title=args.title,
            description=args.description,
            checklist=checklist,
            due_date=args.due_date,
            assignee=args.assignee,
            priority=args.priority,
            related_files=args.files,
            tags=args.tags
        )
    
    elif args.update:
        update_data = {}
        
        if args.title:
            update_data["title"] = args.title
        if args.description:
            update_data["description"] = args.description
        if args.status:
            update_data["status"] = args.status
        if args.due_date:
            update_data["due_date"] = args.due_date
        if args.assignee:
            update_data["assignee"] = args.assignee
        if args.priority:
            update_data["priority"] = args.priority
        if args.files:
            update_data["related_files"] = args.files
        if args.tags:
            update_data["tags"] = args.tags
            
        if args.add_item:
            task = dev_manager.get_task(args.update)
            if task:
                checklist = task.get("checklist", [])
                checklist.append({"text": args.add_item, "completed": False})
                update_data["checklist"] = checklist
                
        dev_manager.update_task(args.update, **update_data)
        
        if args.complete_item is not None:
            dev_manager.update_checklist(args.update, args.complete_item, True)
            
        if args.uncomplete_item is not None:
            dev_manager.update_checklist(args.update, args.uncomplete_item, False)
    
    elif args.get:
        task = dev_manager.get_task(args.get)
        if task:
            print(json.dumps(task, indent=2))
    
    elif args.list:
        tasks = dev_manager.list_tasks(
            status=args.filter_status,
            assignee=args.filter_assignee,
            tags=args.filter_tags
        )
        
        if not tasks:
            print("No tasks found")
        else:
            print(f"Found {len(tasks)} tasks:")
            for task in tasks:
                print(f"{task['id']}: {task['title']} [{task['status']}] {task.get('assignee', '')}")
    
    elif args.report:
        dev_manager.generate_progress_report()
    
    elif args.analyze:
        dev_manager.analyze_task_changes(args.analyze)
    
    elif args.watch:
        try:
            dev_manager.start_watching()
            print("Press Ctrl+C to stop watching")
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            dev_manager.stop_watching()
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 