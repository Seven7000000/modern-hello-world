import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const PlaygroundContainer = styled(motion.div)`
  min-height: 100vh;
  padding: 80px 2rem 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  background: ${props => props.theme.background};
`;

const EditorContainer = styled.div`
  background: ${props => props.theme.cardBackground};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PreviewContainer = styled.div`
  background: ${props => props.theme.cardBackground};
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h2`
  color: ${props => props.theme.text};
  margin-bottom: 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.theme.cardBackgroundHover};
`;

const Tab = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: ${props => props.active ? props.theme.primary : 'transparent'};
  color: ${props => props.active ? props.theme.buttonText : props.theme.text};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.primary};
    color: ${props => props.theme.buttonText};
  }
`;

const examples = {
  basic: `
function HelloWorld() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Hello, World!</h1>
      <p>Edit this code to see live changes!</p>
    </div>
  );
}

render(<HelloWorld />);
`,
  animated: `
function AnimatedHello() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.3s ease'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h1>Animated Hello!</h1>
      <p>Hover over me to see the animation</p>
    </div>
  );
}

render(<AnimatedHello />);
`,
  themed: `
function ThemedHello() {
  const [isDark, setIsDark] = useState(false);

  const theme = {
    background: isDark ? '#1a1a1a' : '#ffffff',
    text: isDark ? '#ffffff' : '#1a1a1a'
  };

  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        background: theme.background,
        color: theme.text,
        borderRadius: '8px',
        transition: 'all 0.3s ease'
      }}
    >
      <h1>Themed Hello!</h1>
      <button
        onClick={() => setIsDark(!isDark)}
        style={{
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '4px',
          background: isDark ? '#ffffff' : '#1a1a1a',
          color: isDark ? '#1a1a1a' : '#ffffff',
          cursor: 'pointer'
        }}
      >
        Toggle Theme
      </button>
    </div>
  );
}

render(<ThemedHello />);
`
};

function Playground() {
  const [selectedExample, setSelectedExample] = useState('basic');
  const [code, setCode] = useState(examples[selectedExample]);

  const handleExampleChange = (example) => {
    setSelectedExample(example);
    setCode(examples[example]);
  };

  return (
    <PlaygroundContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <EditorContainer>
        <Title>Code Editor</Title>
        <TabContainer>
          {Object.keys(examples).map(example => (
            <Tab
              key={example}
              active={selectedExample === example}
              onClick={() => handleExampleChange(example)}
            >
              {example.charAt(0).toUpperCase() + example.slice(1)}
            </Tab>
          ))}
        </TabContainer>
        <LiveProvider code={code} noInline={true}>
          <LiveEditor
            style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              padding: '1rem',
              background: '#1a1a1a'
            }}
          />
          <LiveError />
        </LiveProvider>
      </EditorContainer>

      <PreviewContainer>
        <Title>Live Preview</Title>
        <LiveProvider code={code} noInline={true}>
          <LivePreview />
        </LiveProvider>
      </PreviewContainer>
    </PlaygroundContainer>
  );
}

export default Playground; 