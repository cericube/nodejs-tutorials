// math.js - Named exports
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// 또는 한 번에 export
const E = 2.71828;
function subtract(a, b) {
  return a - b;
}

export { E, subtract };
