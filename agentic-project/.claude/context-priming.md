# Context Priming for Claude

Claude, please help me with the following steps to understand this codebase:

1. First, read the project README.md to understand the general structure and purpose of the project.

2. Examine the file structure to understand the organization:
   ```bash
   find . -type f -not -path "*/node_modules/*" -not -path "*/build/*" -not -path "*/.git/*" | sort
   ```

3. Review the "AI Docs" folder to understand:
   - Third-party API integrations
   - Project best practices and conventions
   - Any special implementation notes

4. Examine the "Specs" folder to understand the feature specifications:
   - Which features are planned or in progress
   - Detailed requirements for implementation
   - Any special considerations for each feature

5. Based on the above information, provide a brief summary of:
   - The project's purpose and structure
   - Key technologies and dependencies
   - The current state of development
   - Any patterns or practices I should follow

Throughout our conversation, please refer to the conventions documented in the AI Docs folder and adhere to the specifications in the Specs folder when suggesting implementations.

If I ask you to implement a feature, please:
1. Check if a specification exists in the Specs folder
2. If it exists, follow it precisely
3. If not, suggest we create one before implementation

This context priming will help us maintain consistency and follow best practices throughout the development process. 