// 24-point solver for 4 numbers, returns true if solvable, false otherwise
// All comments in English per user preference

function canSolve24(nums) {
  // Helper: recursively check if any arrangement can make 24
  function dfs(arr) {
    if (arr.length === 1) {
      return Math.abs(arr[0] - 24) < 1e-6;
    }
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length; j++) {
        if (i === j) continue;
        const rest = arr.filter((_, idx) => idx !== i && idx !== j);
        const a = arr[i], b = arr[j];
        // Try all operations
        const next = [
          a + b,
          a - b,
          b - a,
          a * b
        ];
        // Division, avoid division by zero
        if (Math.abs(b) > 1e-6) next.push(a / b);
        if (Math.abs(a) > 1e-6) next.push(b / a);
        for (const val of next) {
          if (dfs([...rest, val])) return true;
        }
      }
    }
    return false;
  }
  // Try all permutations
  function* permute(arr, n = arr.length) {
    if (n <= 1) yield arr.slice();
    else {
      for (let i = 0; i < n; i++) {
        yield* permute(arr, n - 1);
        const j = n % 2 ? 0 : i;
        [arr[n - 1], arr[j]] = [arr[j], arr[n - 1]];
      }
    }
  }
  for (const p of permute(nums)) {
    if (dfs(p)) return true;
  }
  return false;
}

export default canSolve24;
