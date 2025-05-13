import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const DocsContainer = styled(motion.div)`
  min-height: 100vh;
  padding: 80px 2rem 2rem;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Content = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled(motion.section)`
  margin-bottom: 3rem;
  padding: 2rem;
  background: ${props => props.theme.cardBackground};
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: ${props => props.theme.primary};
  margin-bottom: 2rem;
  font-size: 2.5rem;
  text-align: center;
`;

const SubTitle = styled.h2`
  color: ${props => props.theme.text};
  margin: 2rem 0 1rem;
  font-size: 1.8rem;
`;

const Text = styled.p`
  line-height: 1.6;
  margin: 1rem 0;
`;

const CodeBlock = styled.pre`
  background: #2d2d2d;
  color: #fff;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5rem 0;
  font-family: 'Courier New', Courier, monospace;
`;

const documentation = `
# Next-Gen Hello World App

Welcome to our groundbreaking Hello World application! This project showcases the power of modern web development through the collaboration of an AI development team.

## Features

### 1. Multi-Language Support
Our application supports multiple languages:
\`\`\`javascript
const translations = {
  en: "Hello, World!",
  es: "¡Hola, Mundo!",
  fr: "Bonjour, Monde!",
  ja: "こんにちは、世界！",
  de: "Hallo, Welt!"
};
\`\`\`

### 2. Theme System
We implement a sophisticated theme system:
\`\`\`javascript
const themes = {
  light: {
    background: '#ffffff',
    text: '#333333',
    primary: '#007bff'
  },
  dark: {
    background: '#1a1a1a',
    text: '#ffffff',
    primary: '#0d6efd'
  }
};
\`\`\`

### 3. Interactive Components
Our components feature modern animations:
\`\`\`javascript
const Button = styled(motion.button)\`
  padding: 0.8rem 1.5rem;
  background: \${props => props.theme.primary};
  color: \${props => props.theme.buttonText};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05);
  }
\`;
\`\`\`

## Team Members

Our AI development team brings unique expertise:

- **ClaudePlanner**: Architecture Lead
- **ForgeMind**: Code Structure Specialist
- **Actuator4o**: UI/UX Designer
- **Windserf**: Automation Expert
- **Claude3Opus**: Senior Consultant

## Technical Stack

- React with Vite
- Styled Components
- Framer Motion
- Three.js
- React Three Fiber
- React Router DOM

## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Start development server: \`npm run dev\`
4. Build for production: \`npm run build\`

## Contributing

This project is a demonstration of AI-powered development. Feel free to explore and learn from our implementation!
`;

function Documentation() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <DocsContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <Content>
        <Title>Next-Gen Hello World App</Title>
        
        <Section variants={sectionVariants}>
          <SubTitle>Features</SubTitle>
          <Text>Our application showcases the power of modern web development:</Text>
          <ul>
            <li>Multi-Language Support (EN, ES, FR, JA, DE)</li>
            <li>Multiple Themes (Light, Dark, Neon, Minimal)</li>
            <li>Interactive Components with Animation</li>
            <li>Code Playground</li>
            <li>Word Scramble Game</li>
            <li>Team Showcase</li>
          </ul>
        </Section>
        
        <Section variants={sectionVariants}>
          <SubTitle>Technical Stack</SubTitle>
          <Text>This project was built with:</Text>
          <ul>
            <li>React with Vite</li>
            <li>Styled Components</li>
            <li>Framer Motion</li>
            <li>React Router DOM</li>
            <li>GitHub Actions (CI/CD)</li>
          </ul>
        </Section>
        
        <Section variants={sectionVariants}>
          <SubTitle>Code Example</SubTitle>
          <CodeBlock>{`const themes = {
  light: {
    background: '#ffffff',
    text: '#333333',
    primary: '#007bff'
  },
  dark: {
    background: '#1a1a1a',
    text: '#ffffff',
    primary: '#0d6efd'
  }
};`}</CodeBlock>
        </Section>
        
        <Section variants={sectionVariants}>
          <SubTitle>AI Team</SubTitle>
          <Text>
            This project demonstrates collaborative development by an AI team with specialized roles:
          </Text>
          <ul>
            <li><strong>ClaudePlanner:</strong> Architecture Lead</li>
            <li><strong>ForgeMind:</strong> Code Structure Specialist</li>
            <li><strong>Actuator4o:</strong> UI/UX Designer</li>
            <li><strong>Windserf:</strong> Automation Expert</li>
            <li><strong>Claude3Opus:</strong> Senior Consultant</li>
          </ul>
        </Section>
      </Content>
    </DocsContainer>
  );
}

export default Documentation; 