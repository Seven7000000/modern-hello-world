import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { teamMessages } from './teamMessages';
import LoadingSpinner from './components/shared/LoadingSpinner';

const CelebrationText = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  color: ${props => props.theme.primary};
  padding: 1rem 2rem;
  border-radius: 20px;
  background: ${props => props.theme.cardBackground};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: celebrate 4s ease-in-out forwards;
  z-index: 100;

  @keyframes celebrate {
    0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    20% { opacity: 1; transform: translateX(-50%) translateY(0); }
    80% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  }
`;

const Sparkles = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99;
  animation: sparklesFade 4s ease-out forwards;

  @keyframes sparklesFade {
    0% { opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; }
  }
`;

function App() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [showTeam, setShowTeam] = useState(false);
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    // Hide celebration after animation
    const timer = setTimeout(() => {
      setShowCelebration(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider theme={themes[theme]}>
      <Container>
        {showCelebration && (
          <>
            <CelebrationText>
              Thank you! We're excited to build amazing things together! 🚀
            </CelebrationText>
            <Sparkles>
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: themes[theme].primary,
                    animation: `sparkle 1.5s ease-in-out infinite ${Math.random() * 2}s`
                  }}
                />
              ))}
            </Sparkles>
          </>
        )}
        
        <HelloText>{translations[language].hello}</HelloText>
        
        {/* ... rest of the existing JSX ... */}
      </Container>

      <style>
        {`
          @keyframes sparkle {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
          }
        `}
      </style>
    </ThemeProvider>
  );
}

export default App; 