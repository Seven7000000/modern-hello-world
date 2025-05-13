#!/usr/bin/env python3
# Modified to trigger the task watcher
# Added HTML output capability
import os
import json
import argparse
import datetime
from ai_orchestrator import AIOrchestrator

class DocumentationGenerator:
    def __init__(self):
        self.orchestrator = AIOrchestrator()
        self.docs_dir = "documentation"
        os.makedirs(self.docs_dir, exist_ok=True)
        
    def generate_documentation(self, source_file=None, source_dir=None, doc_type="api", output_format="markdown"):
        """Generate documentation for code files"""
        print(f"🔍 Analyzing source{'s' if source_dir else ''} for documentation generation...")
        
        if not source_file and not source_dir:
            print("❌ Error: You must specify either a source file or a source directory")
            return
        
        if source_file and os.path.exists(source_file):
            self._generate_for_file(source_file, doc_type, output_format)
        elif source_dir and os.path.exists(source_dir):
            self._generate_for_directory(source_dir, doc_type, output_format)
        else:
            print(f"❌ Error: Source {'file' if source_file else 'directory'} not found")
    
    def _generate_for_file(self, source_file, doc_type, output_format):
        """Generate documentation for a single file"""
        print(f"📄 Generating {doc_type} documentation for: {source_file}")
        
        # Read the source file
        with open(source_file, 'r') as f:
            source_code = f.read()
        
        # Prepare the prompt based on documentation type
        if doc_type == "api":
            prompt = self._create_api_docs_prompt(source_file, source_code)
        elif doc_type == "guide":
            prompt = self._create_user_guide_prompt(source_file, source_code)
        elif doc_type == "overview":
            prompt = self._create_overview_prompt(source_file, source_code)
        else:
            prompt = self._create_api_docs_prompt(source_file, source_code)
        
        try:
            # Get the documentation from DocMaster
            result = self.orchestrator.get_completion("DocMaster", prompt)
            
            # Save the documentation
            output_file = os.path.join(
                self.docs_dir, 
                f"{os.path.splitext(os.path.basename(source_file))[0]}_{doc_type}.{output_format}"
            )
            
            # Convert to HTML if needed
            if output_format == "html":
                result = self._markdown_to_html(result, source_file, doc_type)
            
            with open(output_file, 'w') as f:
                f.write(result)
                
            print(f"✅ Documentation saved to: {output_file}")
            return output_file
            
        except Exception as e:
            print(f"❌ Error generating documentation: {str(e)}")
            return None
    
    def _generate_for_directory(self, source_dir, doc_type, output_format):
        """Generate documentation for a directory of files"""
        print(f"📁 Generating {doc_type} documentation for directory: {source_dir}")
        
        # Collect all relevant files
        file_extensions = ['.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.c', '.cpp', '.h', '.hpp']
        files_to_document = []
        
        for root, _, files in os.walk(source_dir):
            for file in files:
                if any(file.endswith(ext) for ext in file_extensions):
                    files_to_document.append(os.path.join(root, file))
        
        if not files_to_document:
            print("❌ No suitable files found for documentation")
            return
        
        print(f"📋 Found {len(files_to_document)} files to document")
        
        # Generate docs for each file
        generated_files = []
        for file in files_to_document:
            result = self._generate_for_file(file, doc_type, output_format)
            if result:
                generated_files.append(result)
        
        # Generate an index file
        if generated_files:
            self._generate_index(generated_files, doc_type, output_format)
    
    def _generate_index(self, files, doc_type, output_format):
        """Generate an index file listing all documentation"""
        index_file = os.path.join(self.docs_dir, f"index.{output_format}")
        
        if output_format == "markdown":
            with open(index_file, 'w') as f:
                f.write(f"# Documentation Index ({doc_type.capitalize()})\n\n")
                for doc_file in files:
                    rel_path = os.path.relpath(doc_file, self.docs_dir)
                    name = os.path.splitext(os.path.basename(doc_file))[0]
                    f.write(f"- [{name}]({rel_path})\n")
        
        print(f"📚 Index file created: {index_file}")
    
    def _create_api_docs_prompt(self, file_path, source_code):
        """Create a prompt for API documentation"""
        file_ext = os.path.splitext(file_path)[1]
        language = self._get_language_from_extension(file_ext)
        
        return f"""Generate comprehensive API documentation for the following {language} code.
Include:
1. Module/class overview
2. Function/method descriptions with clear explanations of:
   - Purpose
   - Parameters (type, description, default values)
   - Return values
   - Exceptions raised
3. Usage examples
4. Dependencies and requirements

Format the documentation in clean, well-structured Markdown.

SOURCE FILE: {file_path}

```{language}
{source_code}
```
"""
    
    def _create_user_guide_prompt(self, file_path, source_code):
        """Create a prompt for user guide documentation"""
        file_ext = os.path.splitext(file_path)[1]
        language = self._get_language_from_extension(file_ext)
        
        return f"""Generate a user guide based on the following {language} code.
Include:
1. Introduction explaining what this code does
2. Step-by-step usage instructions
3. Configuration options
4. Common use cases with examples
5. Troubleshooting tips
6. Best practices

Format the documentation in clear, user-friendly Markdown with appropriate sections and examples.

SOURCE FILE: {file_path}

```{language}
{source_code}
```
"""
    
    def _create_overview_prompt(self, file_path, source_code):
        """Create a prompt for high-level overview documentation"""
        file_ext = os.path.splitext(file_path)[1]
        language = self._get_language_from_extension(file_ext)
        
        return f"""Generate a high-level technical overview of the following {language} code.
Include:
1. Purpose and functionality
2. Architecture and design patterns used
3. Key components and their interactions
4. Data flow
5. Integration points
6. Performance considerations

Format the documentation in clean, well-structured Markdown suitable for technical stakeholders.

SOURCE FILE: {file_path}

```{language}
{source_code}
```
"""
    
    def _get_language_from_extension(self, extension):
        """Convert file extension to language name"""
        language_map = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'jsx',
            '.tsx': 'tsx',
            '.java': 'java',
            '.c': 'c',
            '.cpp': 'cpp',
            '.h': 'c',
            '.hpp': 'cpp',
            '.rb': 'ruby',
            '.php': 'php',
            '.go': 'go',
            '.rs': 'rust',
            '.swift': 'swift',
            '.kt': 'kotlin',
            '.cs': 'csharp'
        }
        return language_map.get(extension, 'code')

    def _markdown_to_html(self, markdown_text, source_file, doc_type):
        """Convert markdown to HTML with styling"""
        # Simple fallback HTML converter if markdown module is not available
        def simple_markdown_to_html(md_text):
            """Simple markdown to HTML converter for basic formatting"""
            # Convert headers
            for i in range(6, 0, -1):
                md_text = md_text.replace('#' * i + ' ', f'<h{i}>')
                md_text = md_text.replace('\n', f'</h{i}>\n', 1)
            
            # Convert code blocks
            in_code_block = False
            lines = md_text.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('```'):
                    if in_code_block:
                        lines[i] = '</pre>'
                        in_code_block = False
                    else:
                        lines[i] = '<pre><code>'
                        in_code_block = True
            
            # Convert lists
            processed_lines = []
            for line in lines:
                if line.strip().startswith('- '):
                    processed_lines.append('<li>' + line.strip()[2:] + '</li>')
                else:
                    processed_lines.append(line)
            
            # Join everything and convert paragraphs
            html = '\n'.join(processed_lines)
            paragraphs = html.split('\n\n')
            html = '\n'.join([f'<p>{p}</p>' if not (p.startswith('<h') or p.startswith('<pre>') or p.startswith('<li>')) else p for p in paragraphs])
            
            return html
        
        try:
            # Try to import markdown module
            try:
                import markdown  # type: ignore
                # Generate HTML content with markdown module
                html_content = markdown.markdown(markdown_text, extensions=['fenced_code'])
            except ImportError:
                print("Warning: markdown module not found. Using simple fallback converter.")
                # Use simple fallback if markdown module is not available
                html_content = simple_markdown_to_html(markdown_text)
                
            # Add HTML header with styling
            title = f"{os.path.basename(source_file)} - {doc_type.capitalize()} Documentation"
            current_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }}
        h1, h2, h3, h4, h5, h6 {{
            color: #2c3e50;
            margin-top: 24px;
            margin-bottom: 16px;
        }}
        h1 {{
            padding-bottom: 12px;
            border-bottom: 1px solid #eaecef;
        }}
        code {{
            font-family: Consolas, Monaco, 'Andale Mono', monospace;
            background-color: #f6f8fa;
            padding: 2px 4px;
            border-radius: 3px;
        }}
        pre {{
            background-color: #f6f8fa;
            border-radius: 6px;
            padding: 16px;
            overflow: auto;
        }}
        a {{
            color: #0366d6;
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
        }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 16px;
        }}
        th, td {{
            border: 1px solid #dfe2e5;
            padding: 8px 16px;
            text-align: left;
        }}
        th {{
            background-color: #f6f8fa;
        }}
        .footer {{
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #eaecef;
            color: #6a737d;
            font-size: 0.9em;
        }}
    </style>
</head>
<body>
    <h1>{title}</h1>
    {html_content}
    <div class="footer">
        <p>Documentation generated on {current_time} using AI-powered documentation generator.</p>
    </div>
</body>
</html>
"""
            return html
        except Exception as e:
            print(f"❌ Error converting to HTML: {str(e)}")
            # Return the original markdown if conversion fails
            return markdown_text

def main():
    parser = argparse.ArgumentParser(description="Generate documentation for code files")
    
    source_group = parser.add_mutually_exclusive_group(required=True)
    source_group.add_argument("-f", "--file", help="Source file to document")
    source_group.add_argument("-d", "--directory", help="Directory containing files to document")
    
    parser.add_argument("-t", "--type", choices=["api", "guide", "overview"], default="api", 
                        help="Type of documentation to generate (default: api)")
    parser.add_argument("-o", "--output-format", choices=["markdown", "html"], default="markdown",
                        help="Output format for documentation (default: markdown)")
    
    args = parser.parse_args()
    
    doc_generator = DocumentationGenerator()
    doc_generator.generate_documentation(
        source_file=args.file,
        source_dir=args.directory,
        doc_type=args.type,
        output_format=args.output_format
    )

if __name__ == "__main__":
    main() 