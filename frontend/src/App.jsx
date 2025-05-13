import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { teamMessages } from './teamMessages';
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
