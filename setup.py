from setuptools import setup, find_packages

setup(
    name="rag_agent",
    version="0.1.0",
    description="Vertex AI RAG Agent with ADK",
    packages=find_packages(),
    install_requires=[
        "google-cloud-aiplatform",
        "google-cloud-storage",
        "google-genai",
        "gitpython",
        "google-adk",
        "python-dotenv",
    ],
    python_requires=">=3.9",
)
