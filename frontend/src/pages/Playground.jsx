import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const PlaygroundContainer = styled(motion.div)`
  min-height: 100vh;
  padding: 80px 2rem 2rem;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Content = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: ${props => props.theme.primary};
  margin-bottom: 2rem;
  font-size: 2.5rem;
  text-align: center;
`;

const EditorContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Editor = styled.textarea`
  width: 100%;
  height: 300px;
  background: ${props => props.theme.cardBackground};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.cardBackgroundHover};
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Courier New', Courier, monospace;
  resize: none;
  outline: none;
  
  &:focus {
    border-color: ${props => props.theme.primary};
  }
`;

const Preview = styled.div`
  width: 100%;
  height: 300px;
  background: ${props => props.theme.cardBackground};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.cardBackgroundHover};
  border-radius: 8px;
  padding: 1rem;
  overflow: auto;
`;

const Button = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  background: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
  
  &:hover {
    background: ${props => props.theme.primaryHover};
  }
`;

const ExamplesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

function Playground() {
  const [code, setCode] = useState('<h1 style="color: blue;">Hello World!</h1>\\n<p>This is a live HTML preview.</p>\\n<button style="background: orange; border: none; padding: 8px 16px; border-radius: 4px;">Click me</button>');
  const [output, setOutput] = useState('');

  const examples = [
    { name: 'Basic HTML', code: '<h1 style="color: blue;">Hello World!</h1>\\n<p>This is a live HTML preview.</p>\\n<button style="background: orange; border: none; padding: 8px 16px; border-radius: 4px;">Click me</button>' },
    { name: 'CSS Animation', code: '<style>\\n  .box {\\n    width: 100px;\\n    height: 100px;\\n    background-color: red;\\n    animation: spin 2s linear infinite;\\n  }\\n  @keyframes spin {\\n    from { transform: rotate(0deg); }\\n    to { transform: rotate(360deg); }\\n  }\\n</style>\\n<div class="box"></div>' },
  ];

  useEffect(() => {
    updateOutput();
  }, [code]);

  const updateOutput = () => {
    setOutput(code);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <PlaygroundContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <Content>
        <Title>Code Playground</Title>
        
        <ExamplesContainer>
          {examples.map((example, index) => (
            <Button 
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCode(example.code)}
            >
              {example.name}
            </Button>
          ))}
        </ExamplesContainer>
        
        <EditorContainer>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>HTML Editor</h3>
            <Editor
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
            />
          </div>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Preview</h3>
            <Preview dangerouslySetInnerHTML={{ __html: output }} />
          </div>
        </EditorContainer>
      </Content>
    </PlaygroundContainer>
  );
}

export default Playground; 