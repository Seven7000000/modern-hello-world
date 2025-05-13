import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const GameContainer = styled(motion.div)`
  min-height: 100vh;
  padding: 80px 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Title = styled.h1`
  color: ${props => props.theme.primary};
  margin-bottom: 2rem;
  font-size: 2.5rem;
  text-align: center;
`;

const GameCard = styled(motion.div)`
  width: 100%;
  max-width: 500px;
  background: ${props => props.theme.cardBackground};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const ScrambledWord = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  letter-spacing: 4px;
  margin-bottom: 2rem;
  color: ${props => props.theme.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1.5rem;
  border: 2px solid ${props => props.theme.cardBackgroundHover};
  border-radius: 6px;
  font-size: 1.2rem;
  background: ${props => props.theme.cardBackgroundActive};
  color: ${props => props.theme.text};
  outline: none;

  &:focus {
    border-color: ${props => props.theme.primary};
  }
`;

const Button = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  background: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  width: 100%;
  
  &:disabled {
    background: ${props => props.theme.cardBackgroundHover};
    cursor: not-allowed;
  }
`;

const Result = styled(motion.div)`
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  font-size: 1.2rem;
  background: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
`;

const Score = styled.div`
  width: 100%;
  max-width: 500px;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
`;

const Hint = styled.p`
  margin-top: 1rem;
  font-style: italic;
  color: ${props => props.theme.text};
  opacity: 0.8;
`;

const GameRules = styled.div`
  width: 100%;
  max-width: 500px;
  margin-top: 2rem;
  text-align: center;
`;

// Programming-related words to scramble
const words = [
  { word: 'REACT', hint: 'A JavaScript library for building user interfaces' },
  { word: 'COMPONENT', hint: 'A reusable piece of UI in React' },
  { word: 'FUNCTION', hint: 'A block of code designed to perform a particular task' },
  { word: 'VARIABLE', hint: 'A container for storing data values' },
  { word: 'JAVASCRIPT', hint: 'A programming language of the web' },
  { word: 'ALGORITHM', hint: 'A step-by-step procedure for solving a problem' },
  { word: 'DATABASE', hint: 'An organized collection of data' },
  { word: 'FRAMEWORK', hint: 'A structure that provides a foundation for developing software applications' }
];

// Function to scramble a word
const scrambleWord = (word) => {
  const lettersArray = word.split('');
  let scrambled = '';
  
  // Keep shuffling until we get a different arrangement
  while (scrambled === '' || scrambled === word) {
    for (let i = lettersArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lettersArray[i], lettersArray[j]] = [lettersArray[j], lettersArray[i]];
    }
    scrambled = lettersArray.join('');
  }
  
  return scrambled;
};

function Game() {
  const [currentWordObj, setCurrentWordObj] = useState({});
  const [scrambledWord, setScrambledWord] = useState('');
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Get a new word to play
  const getNewWord = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];
    setCurrentWordObj(selectedWord);
    setScrambledWord(scrambleWord(selectedWord.word));
    setGuess('');
    setResult(null);
    setGameStarted(true);
  };

  // Check if the guess is correct
  const checkGuess = () => {
    setAttempts(attempts + 1);
    
    if (guess.toUpperCase() === currentWordObj.word) {
      setResult({ success: true, message: 'Correct! Well done!' });
      setScore(score + 1);
      
      // Move to the next word after a short delay
      setTimeout(() => {
        getNewWord();
      }, 1500);
    } else {
      setResult({ success: false, message: `Sorry, that's not right. Try again!` });
    }
  };

  return (
    <GameContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Title>Word Scramble Challenge</Title>
      
      {!gameStarted ? (
        <>
          <GameRules>
            <p>Unscramble the programming terms to win points!</p>
            <p>See how many you can get right in a row.</p>
          </GameRules>
          <Button 
            onClick={getNewWord}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Game
          </Button>
        </>
      ) : (
        <>
          <GameCard
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ScrambledWord>{scrambledWord}</ScrambledWord>
            <Input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type your answer here..."
              onKeyPress={(e) => e.key === 'Enter' && guess.length > 0 && checkGuess()}
            />
            <Button 
              onClick={checkGuess} 
              disabled={!guess.length}
              whileHover={{ scale: guess.length ? 1.05 : 1 }}
              whileTap={{ scale: guess.length ? 0.95 : 1 }}
            >
              Submit
            </Button>
            
            {result && (
              <Result 
                success={result.success}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {result.message}
              </Result>
            )}
            
            <Hint>Hint: {currentWordObj.hint}</Hint>
          </GameCard>
          
          <Score>
            <div>Score: {score}</div>
            <div>Attempts: {attempts}</div>
          </Score>
          
          <Button 
            onClick={getNewWord}
            style={{ marginTop: '1rem', maxWidth: '200px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Skip / New Word
          </Button>
        </>
      )}
    </GameContainer>
  );
}

export default Game; 