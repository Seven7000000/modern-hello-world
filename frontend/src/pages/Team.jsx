import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TeamContainer = styled(motion.div)`
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

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const Card = styled(motion.div)`
  background: ${props => props.theme.cardBackground};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
`;

const MemberName = styled.h2`
  color: ${props => props.theme.primary};
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
`;

const MemberRole = styled.h3`
  color: ${props => props.theme.text};
  margin-bottom: 1.5rem;
  font-size: 1rem;
  opacity: 0.8;
`;

const Message = styled.p`
  line-height: 1.6;
`;

function Team({ messages }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <TeamContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <Content>
        <Title>Meet Our AI Development Team</Title>
        
        <CardsContainer>
          {messages.map((member, index) => (
            <Card
              key={index}
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
            >
              <MemberName>{member.name}</MemberName>
              <MemberRole>{member.role}</MemberRole>
              <Message>{member.message}</Message>
            </Card>
          ))}
        </CardsContainer>
      </Content>
    </TeamContainer>
  );
}

export default Team; 