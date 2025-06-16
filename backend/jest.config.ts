export default {
  preset: 'ts-jest/presets/default-esm', // Use ts-jest with ESM
  testEnvironment: 'node', // Ensure we run in Node.js environment
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true, // Explicitly enable ES Modules
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'], // Treat TypeScript files as ES Modules
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // Supported extensions
  testMatch: ['**/src/**/*.test.ts'], // Match test files in `src/`
  transformIgnorePatterns: ['node_modules/(?!pushdrop|@bsv/.*)'], // Ensure certain modules are processed
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // Handle relative `.js` imports in ESM
  },
};
