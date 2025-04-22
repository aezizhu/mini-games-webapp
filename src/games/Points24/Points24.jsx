import React, { useState } from 'react';
import styled from 'styled-components';
import { GameContainer } from '../../styles/Layout';
import canSolve24 from './solver24';

// Generate 4 random numbers from 1 to 13 (like playing cards)
function generateNumbers(solvable = null) {
  // If solvable is true, only return numbers with a solution
  // If solvable is false, only return numbers with no solution
  // If solvable is null, return any numbers
  let nums;
  while (true) {
    nums = Array.from({ length: 4 }, () => Math.floor(Math.random() * 13) + 1);
    const hasSolution = canSolve24(nums);
    if (solvable === null || hasSolution === solvable) return nums;
  }
}

// Styled components
const Numbers = styled.div`
  display: flex;
  gap: 18px;
  margin: 32px 0 18px 0;
  font-size: 2rem;
`;

const Input = styled.input`
  width: 320px;
  font-size: 1.1rem;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #bbb;
  margin-right: 12px;
`;

const Result = styled.div`
  margin-top: 18px;
  font-weight: bold;
  color: ${({ $correct }) => ($correct ? 'green' : 'red')};
`;

const Points24 = () => {
  const [numbers, setNumbers] = useState(generateNumbers());
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [correct, setCorrect] = useState(false);
  const [hasSolution, setHasSolution] = useState(canSolve24(numbers));

  // Check if the user's expression is valid and equals 24
  const checkResult = () => {
    const numCopy = [...numbers];
    const tokens = expression.match(/\d+/g);
    if (!tokens || tokens.length !== 4) {
      setResult('You must use all 4 numbers, each exactly once.');
      setCorrect(false);
      return;
    }
    for (let t of tokens) {
      const idx = numCopy.indexOf(Number(t));
      if (idx === -1) {
        setResult('You must use each number exactly once.');
        setCorrect(false);
        return;
      }
      numCopy.splice(idx, 1);
    }
    try {
      // eslint-disable-next-line no-eval
      const val = eval(expression);
      if (Math.abs(val - 24) < 1e-6) {
        setResult('Correct! 🎉');
        setCorrect(true);
        // Automatically start a new round after 1.2 seconds
        setTimeout(() => {
          const newNums = generateNumbers();
          setNumbers(newNums);
          setHasSolution(canSolve24(newNums));
          setExpression('');
          setResult('');
          setCorrect(false);
        }, 1200);
      } else {
        setResult('Not 24. Try again!');
        setCorrect(false);
      }
    } catch {
      setResult('Invalid expression.');
      setCorrect(false);
    }
  };

  const reset = (solvable = null) => {
    const newNums = generateNumbers(solvable);
    setNumbers(newNums);
    setHasSolution(canSolve24(newNums));
    setExpression('');
    setResult('');
    setCorrect(false);
  };

  return (
    <GameContainer>
      <h2>24 Points</h2>
      <Numbers>
        {numbers.map((n, i) => (
          <span key={i}>{n}</span>
        ))}
      </Numbers>
      <div>
        <Input
          type="text"
          placeholder="Enter your expression (e.g. (8/(3-1))*6)"
          value={expression}
          onChange={e => setExpression(e.target.value)}
          disabled={correct}
        />
        <button onClick={checkResult} disabled={correct}>Submit</button>
        <button onClick={() => reset(null)} style={{ marginLeft: 12 }}>New</button>
        <button onClick={() => reset(false)} style={{ marginLeft: 12 }}>No Solution</button>
      </div>
      {result && <Result $correct={correct}>{result}</Result>}
      <div style={{ marginTop: 8, color: hasSolution ? 'green' : 'red', fontSize: 14 }}>
        {hasSolution ? 'This puzzle has a solution.' : 'No solution exists for this puzzle.'}
      </div>
      <div style={{ marginTop: 14, color: '#888', fontSize: 14 }}>
        Use +, -, *, / and parentheses. Each number must be used exactly once.<br/>
        Example: (8/(3-1))*6
      </div>
    </GameContainer>
  );
};

export default Points24;
