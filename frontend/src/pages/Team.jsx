import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';

const TeamContainer = styled(motion.div)`
  min-height: 100vh;
  padding: 80px 2rem 2rem;
  background: ${props => props.theme.background};
`;

const TeamGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const TeamCard = styled(motion.div)`
  background: ${props => props.theme.cardBackground};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 150px;
    background: linear-gradient(45deg, ${props => props.theme.primary}, ${props => props.theme.primaryHover});
    border-radius: 16px 16px 0 0;
  }
`;

const CardContent = styled.div`
  position: relative;
  z-index: 1;
`;

const MemberName = styled.h2`
  color: ${props => props.theme.text};
  margin: 0 0 0.5rem;
  font-size: 1.8rem;
`;

const MemberRole = styled.h3`
  color: ${props => props.theme.primary};
  margin: 0 0 1.5rem;
  font-size: 1.2rem;
`;

const MemberMessage = styled.p`
  color: ${props => props.theme.text};
  line-height: 1.6;
  margin: 0;
`;

const CanvasContainer = styled.div`
  height: 150px;
  margin-bottom: 1rem;
`;

function Member3D({ name }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Float
        speed={4}
        rotationIntensity={0.5}
        floatIntensity={2}
      >
        <Text
          fontSize={0.5}
          maxWidth={2}
          lineHeight={1}
          letterSpacing={0.02}
          textAlign="center"
          font="/fonts/Inter-Bold.woff"
        >
          {name}
          <meshStandardMaterial color="#ffffff" />
        </Text>
      </Float>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={4} />
    </>
  );
}

function Team({ messages }) {
  const [selectedMember, setSelectedMember] = useState(null);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    hover: {
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const handleCardClick = (member) => {
    setSelectedMember(selectedMember === member ? null : member);
  };

  return (
    <TeamContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <TeamGrid>
        <AnimatePresence>
          {messages.map((member, i) => (
            <TeamCard
              key={member.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onClick={() => handleCardClick(member)}
              layoutId={member.name}
            >
              <CanvasContainer>
                <Canvas camera={{ position: [0, 0, 5] }}>
                  <Member3D name={member.name} />
                </Canvas>
              </CanvasContainer>
              <CardContent>
                <MemberName>{member.name}</MemberName>
                <MemberRole>{member.role}</MemberRole>
                <MemberMessage>
                  {selectedMember === member ? member.message : `${member.message.slice(0, 100)}...`}
                </MemberMessage>
              </CardContent>
            </TeamCard>
          ))}
        </AnimatePresence>
      </TeamGrid>
    </TeamContainer>
  );
}

export default Team; 