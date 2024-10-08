module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
      "**/tests/**/*.test.ts", 
      "**/?(*.)+(spec|test).[jt]s?(x)" 
    ],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'], 
  };
  