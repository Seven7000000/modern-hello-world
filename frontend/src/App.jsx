import React, { useState, useEffect, Suspense } from 'react';
import styled, { ThemeProvider, keyframes } from 'styled-components';
import { translations } from './translations';
import { teamMessages } from './teamMessages';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'));
const Playground = React.lazy(() => import('./pages/Playground'));
const Team = React.lazy(() => import('./pages/Team'));
const Documentation = React.lazy(() => import('./pages/Documentation'));
const Game = React.lazy(() => import('./pages/Game'));

const themes = {
  light: {
    background: '#ffffff',
    text: '#333333',
    primary: '#007bff',
    primaryHover: '#0056b3',
    buttonText: '#ffffff',
    cardBackground: '#f8f9fa',
    cardBackgroundHover: '#e9ecef',
    cardBackgroundActive: '#dee2e6'
  },
  dark: {
    background: '#1a1a1a',
    text: '#ffffff',
    primary: '#0d6efd',
    primaryHover: '#0b5ed7',
    buttonText: '#ffffff',
    cardBackground: '#2d2d2d',
    cardBackgroundHover: '#353535',
    cardBackgroundActive: '#404040'
  },
  neon: {
    background: '#000000',
    text: '#00ff00',
    primary: '#ff00ff',
    primaryHover: '#cc00cc',
    buttonText: '#ffffff',
    cardBackground: '#0a0a0a',
    cardBackgroundHover: '#1a1a1a',
    cardBackgroundActive: '#2a2a2a'
  },
  minimal: {
    background: '#fafafa',
    text: '#2c3e50',
    primary: '#34495e',
    primaryHover: '#2c3e50',
    buttonText: '#ffffff',
    cardBackground: '#ffffff',
    cardBackgroundHover: '#f5f5f5',
    cardBackgroundActive: '#e0e0e0'
  }
};

const celebrateAnimation = keyframes`
  0% { transform: scale(0.8) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  transition: all 0.3s ease;
  padding: 2rem;
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

  &.sparkle {
    animation: sparkleText 1s ease-in-out;
  }

  @keyframes sparkleText {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const TeamSection = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: ${props => props.theme.cardBackground};
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideUp 1s ease-out;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const TeamMember = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  border-left: 4px solid ${props => props.theme.primary};
  background: ${props => props.theme.cardBackgroundHover};
  border-radius: 0 8px 8px 0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(10px);
    background: ${props => props.theme.cardBackgroundActive};
  }
`;

const MemberName = styled.h3`
  color: ${props => props.theme.primary};
  margin: 0 0 0.5rem 0;
`;

const MemberMessage = styled.p`
  margin: 0;
  line-height: 1.5;
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
`;

const SparkleParticle = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: ${props => props.theme.primary};
`;

const HistoricMoment = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.theme.cardBackground};
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
  z-index: 1000;
  animation: ${celebrateAnimation} 1s ease-out forwards;
  max-width: 90vw;
  width: 600px;

  h2 {
    color: ${props => props.theme.primary};
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    color: ${props => props.theme.text};
    font-size: 1.2rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  button {
    background: ${props => props.theme.primary};
    color: ${props => props.theme.buttonText};
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      background: ${props => props.theme.primaryHover};
    }
  }
`;

const Confetti = styled.div`
  position: fixed;
  width: 10px;
  height: 10px;
  background: ${props => props.color};
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  opacity: 0;
  animation: fall 3s linear infinite;
  z-index: 999;

  @keyframes fall {
    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
`;

const AppContainer = styled(motion.div)`
  min-height: 100vh;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  transition: all 0.3s ease;
`;

const Navigation = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  background: ${props => props.theme.cardBackground};
  z-index: 1000;
  display: flex;
  justify-content: center;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  color: ${props => props.theme.text};
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.primary};
    color: ${props => props.theme.buttonText};
  }
`;

function App() {
  const [currentTheme, setCurrentTheme] = useState(themes.light);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showSparkles, setShowSparkles] = useState(false);
  const [showCelebration, setShowCelebration] = useState(true);
  const [showHistoricMoment, setShowHistoricMoment] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCelebration(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const cycleTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.findIndex(key => themes[key] === currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setCurrentTheme(themes[themeKeys[nextIndex]]);
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 1000);
  };

  const cycleLanguage = () => {
    const languages = Object.keys(translations);
    const currentIndex = languages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    setCurrentLanguage(languages[nextIndex]);
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 1000);
  };

  const confettiColors = [
    '#FF69B4', '#FFD700', '#00CED1', '#FF6347', '#98FB98',
    '#DDA0DD', '#87CEEB', '#F0E68C', '#FF69B4', '#00FA9A'
  ];

  return (
    <ThemeProvider theme={currentTheme}>
      <Router basename="/modern-hello-world/">
        <AppContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Navigation
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <NavLink to="/">Home</NavLink>
            <NavLink to="/playground">Playground</NavLink>
            <NavLink to="/team">Team</NavLink>
            <NavLink to="/docs">Docs</NavLink>
            <NavLink to="/game">Game</NavLink>
          </Navigation>

          <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <Home 
                    currentTheme={currentTheme}
                    setCurrentTheme={setCurrentTheme}
                    currentLanguage={currentLanguage}
                    setCurrentLanguage={setCurrentLanguage}
                  />
                } />
                <Route path="/playground" element={<Playground />} />
                <Route path="/team" element={<Team messages={teamMessages} />} />
                <Route path="/docs" element={<Documentation />} />
                <Route path="/game" element={<Game />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App; 