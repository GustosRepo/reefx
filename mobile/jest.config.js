// File: jest.config.js
module.exports = {
  preset: "ts-jest",           // use ts-jest to transform .ts files
  testEnvironment: "node",      // we only need a Node environment for these utility tests

  // “roots” tells Jest where to look for test files
  // Your tests are in mobile/utils/
  roots: ["<rootDir>/utils"],

  // A simple glob to match *.test.ts under utils/
  testMatch: ["**/*.test.ts"],

  // Transform any .ts file with ts-jest
  transform: {
    "^.+\\.ts$": "ts-jest"
  },

  // Recognize these extensions
  moduleFileExtensions: ["ts", "js", "json", "node"],
};