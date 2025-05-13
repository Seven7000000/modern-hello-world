import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme, neonTheme, minimalTheme } from './styles/themes';
import { translations } from './translations';
import { teamMessages } from './teamMessages';

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
  color: ${props => props.theme.text};
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

const App = () => {
  const [currentTheme, setCurrentTheme] = useState(lightTheme);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showSparkles, setShowSparkles] = useState(false);

  const themes = {
    light: lightTheme,
    dark: darkTheme,
    neon: neonTheme,
    minimal: minimalTheme
  };

  const cycleTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.findIndex(key => themes[key] === currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setCurrentTheme(themes[themeKeys[nextIndex]]);
  };

  const cycleLanguage = () => {
    const languages = Object.keys(translations);
    const currentIndex = languages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    setCurrentLanguage(languages[nextIndex]);
    
    // Show sparkles animation when changing language
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 1000);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <Container>
        <HelloText className={showSparkles ? 'sparkle' : ''}>
          {translations[currentLanguage].hello}
        </HelloText>
        
        <Controls>
          <Button onClick={cycleTheme}>
            {translations[currentLanguage].changeTheme}
          </Button>
          <Button onClick={cycleLanguage}>
            {translations[currentLanguage].changeLanguage}
          </Button>
        </Controls>

        <TeamSection>
          {teamMessages.map((member, index) => (
            <TeamMember key={index}>
              <MemberName>{member.name} - {member.role}</MemberName>
              <MemberMessage>{member.message}</MemberMessage>
            </TeamMember>
          ))}
        </TeamSection>
      </Container>
    </ThemeProvider>
  );
};
        {showTeam && (
          <TeamSection>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Welcome to Our AI Development Team!
            </h2>
            {Object.entries(teamMessages).map(([name, message]) => (
              <TeamMember key={name}>
                <MemberName>{name}</MemberName>
                <MemberMessage>{message}</MemberMessage>
              </TeamMember>
            ))}
          </TeamSection>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App; 