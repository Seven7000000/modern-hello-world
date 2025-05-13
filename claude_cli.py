#!/usr/bin/env python3
import os
import sys
import anthropic
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get API key from environment variable
api_key = os.getenv("ANTHROPIC_API_KEY")

if not api_key:
    print("Error: ANTHROPIC_API_KEY not found in environment variables.")
    print("Please create a .env file with your API key or set it as an environment variable.")
    sys.exit(1)

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=api_key)

def main():
    print("Claude Terminal Interface - Type 'exit' to quit")
    print("--------------------------------------------")
    
    # Initialize conversation history
    messages = []
    
    while True:
        # Get user input
        user_input = input("\nYou: ")
        
        if user_input.lower() == "exit":
            print("Goodbye!")
            break
        
        # Add user message to history
        messages.append({"role": "user", "content": user_input})
        
        try:
            # Send message to Claude
            response = client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=1000,
                messages=messages
            )
            
            # Extract and display Claude's response
            assistant_message = response.content[0].text
            print(f"\nClaude: {assistant_message}")
            
            # Add Claude's response to history
            messages.append({"role": "assistant", "content": assistant_message})
            
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    main() 