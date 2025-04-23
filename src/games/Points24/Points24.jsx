import React, { useState } from 'react';
import styled from 'styled-components';
import { GameContainer } from '../../styles/Layout';
import canSolve24 from './solver24';

// Generate 4 random numbers from 1 to 13 (like playing cards)
function generateNumbers(solvable = null) {
  // If solvable is true, only return numbers with a solution
  // If solvable is false, only return numbers with no solution
  // If solvable is null, return numbers with <10% chance unsolvable
  let nums;
  if (solvable === null) {
    // 90% chance to generate a solvable puzzle, 10% chance unsolvable
    const wantSolvable = Math.random() > 0.1 ? true : false;
    while (true) {
      nums = Array.from({ length: 4 }, () => Math.floor(Math.random() * 13) + 1);
      const hasSolution = canSolve24(nums);
      if (wantSolvable && hasSolution) return nums;
      if (!wantSolvable && !hasSolution) return nums;
    }
  } else {
    while (true) {
      nums = Array.from({ length: 4 }, () => Math.floor(Math.random() * 13) + 1);
      const hasSolution = canSolve24(nums);
      if (solvable === null || hasSolution === solvable) return nums;
    }
  }
}

// Safely evaluate a mathematical expression
function safeEvaluate(expression) {
  // Validate the expression to only allow safe mathematical operations
  // Only allow digits, basic operators, parentheses, and whitespace
  if (!/^[\d\s\(\)\+\-\*\/\.]+$/.test(expression)) {
    throw new Error("Invalid characters in expression");
  }
  
  // Use Function constructor instead of eval
  // This is still not completely safe for user input in production,
  // but better than direct eval for this game context
  return new Function(`return ${expression}`)();
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
  const [noSolutionMsg, setNoSolutionMsg] = useState(''); // Feedback for No Solution button

  // Check if the user's expression is valid and equals 24
  const checkResult = () => {
    setNoSolutionMsg(''); // Clear no solution feedback on new answer
    // Validate that each number is used exactly once
    const numCounts = {};
    numbers.forEach(n => {
      numCounts[n] = (numCounts[n] || 0) + 1;
    });
    // Extract all numbers from the expression
    const usedNums = (expression.match(/\d+/g) || []).map(Number);
    const usedCounts = {};
    usedNums.forEach(n => {
      usedCounts[n] = (usedCounts[n] || 0) + 1;
    });
    let valid = true;
    for (const n of numbers) {
      if (!usedCounts[n] || usedCounts[n] > numCounts[n]) {
        valid = false;
        break;
      }
      usedCounts[n]--;
    }
    // Check if any extra numbers are used
    for (const n in usedCounts) {
      if (usedCounts[n] > 0) {
        valid = false;
        break;
      }
    }
    if (!valid) {
      setResult('You must use each provided number exactly once.');
      setCorrect(false);
      return;
    }
    try {
      const val = safeEvaluate(expression);
      if (Math.abs(val - 24) < 1e-6) {
        setResult('Correct! 🎉');
        setCorrect(true);
        setNoSolutionMsg('');
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

  // Improved No Solution button logic
  const handleNoSolution = () => {
    // Only show feedback below the button, not in the main result
    if (!hasSolution) {
      setNoSolutionMsg('This puzzle truly has no solution. Next puzzle!');
      setTimeout(() => {
        setNoSolutionMsg('');
        reset(false);
      }, 1000);
    } else {
      setNoSolutionMsg('Actually, this puzzle DOES have a solution!');
    }
  };

  const reset = (solvable = null) => {
    const newNums = generateNumbers(solvable);
    setNumbers(newNums);
    setHasSolution(canSolve24(newNums));
    setExpression('');
    setResult('');
    setCorrect(false);
    setNoSolutionMsg('');
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
        <button onClick={handleNoSolution} style={{ marginLeft: 12 }}>No Solution</button>
        {noSolutionMsg && (
          <div style={{ marginTop: 8, color: '#d2691e', fontSize: 15 }}>{noSolutionMsg}</div>
        )}
      </div>
      {result && <Result $correct={correct}>{result}</Result>}
      <div style={{ marginTop: 14, color: '#888', fontSize: 14 }}>
        Use +, -, *, / and parentheses. Each number must be used exactly once.<br/>
        Example: (8/(3-1))*6
      </div>
    </GameContainer>
  );
};

export default Points24;
