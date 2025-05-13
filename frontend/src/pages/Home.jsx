import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, useAnimation } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Center } from '@react-three/drei';
import { translations } from '../translations';

const HomeContainer = styled(motion.div)`
  min-height: 100vh;
  padding-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const WelcomeText = styled(motion.h1)`
  font-size: 4rem;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(45deg, ${props => props.theme.primary}, ${props => props.theme.text});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 50vh;
  margin: 2rem 0;
`;

const Controls = styled(motion.div)`
  display: flex;
  gap: 1rem;
  margin: 2rem;
`;

const Button = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  cursor: pointer;
  font-size: 1.1rem;

  &:hover {
    background: ${props => props.theme.primaryHover};
  }
`;

function Scene({ text }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Center>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={1.5}
          height={0.2}
          curveSegments={12}
        >
          {text}
          <meshStandardMaterial color="#ff6b6b" />
        </Text3D>
      </Center>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={4} />
    </>
  );
}

function Home({ currentTheme, setCurrentTheme, currentLanguage, setCurrentLanguage }) {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    controls.start({
      y: [0, -20, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
  }, [controls]);

  const buttonVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        yoyo: Infinity
      }
    }
  };

  return (
    <HomeContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <WelcomeText
        animate={controls}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {translations[currentLanguage].hello}
      </WelcomeText>

      <CanvasContainer>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <Scene text={translations[currentLanguage].hello} />
        </Canvas>
      </CanvasContainer>

      <Controls>
        <Button
          variants={buttonVariants}
          whileHover="hover"
          onClick={() => {
            const themeKeys = Object.keys(themes);
            const currentIndex = themeKeys.findIndex(key => themes[key] === currentTheme);
            const nextIndex = (currentIndex + 1) % themeKeys.length;
            setCurrentTheme(themes[themeKeys[nextIndex]]);
          }}
        >
          {translations[currentLanguage].changeTheme}
        </Button>
        <Button
          variants={buttonVariants}
          whileHover="hover"
          onClick={() => {
            const languages = Object.keys(translations);
            const currentIndex = languages.indexOf(currentLanguage);
            const nextIndex = (currentIndex + 1) % languages.length;
            setCurrentLanguage(languages[nextIndex]);
          }}
        >
          {translations[currentLanguage].changeLanguage}
        </Button>
      </Controls>
    </HomeContainer>
  );
}

export default Home; 