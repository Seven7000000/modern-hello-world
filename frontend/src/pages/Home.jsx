import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { translations } from '../translations';

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  transition: all 0.3s ease;
  padding: 2rem;
  padding-top: 80px;
`;

const HelloText = styled.h1`
  font-size: 4rem;
  margin-bottom: 2rem;
  animation: fadeIn 1s ease-in;
  text-align: center;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    background: ${props => props.theme.primaryHover};
  }
`;

function Home({ currentTheme, setCurrentTheme, currentLanguage, setCurrentLanguage }) {
  const themes = Object.keys({
    light: {},
    dark: {},
    neon: {},
    minimal: {}
  });
  
  const languages = Object.keys(translations);

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(theme => theme === currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };

  const cycleLanguage = () => {
    const currentIndex = languages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    setCurrentLanguage(languages[nextIndex]);
  };

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <HelloText>{translations[currentLanguage].hello}</HelloText>
      
      <Controls>
        <Button onClick={cycleTheme}>
          Change Theme
        </Button>
        <Button onClick={cycleLanguage}>
          Change Language
        </Button>
      </Controls>
    </Container>
  );
}

export default Home; 