const path = require('path')

module.exports = {
  rootDir: path.resolve(__dirname, './'),
  moduleFileExtensions: ['js', 'ts', 'json'],
  moduleNameMapper: {
    '@/(.*)': "<rootDir>/src/$1"
  },
  globals: {
    'ts-jest': {
      babelConfig: 'babel.config.js'
    },
    __DEV__: true
  },
  transform: {
    '^.+\\.[t|j]sx?$': 'ts-jest'
  },
  // snapshotSerializers: ["<rootDir>/node_modules/jest-serializer-vue"],
  // setupFiles: ["<rootDir>/jest.setup"],
  collectCoverage: true,
  // coverageReporters: [
  //   "json-summary", "text"
  // ],
  testTimeout: 10000,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/index.umd.js', '!**/node_modules/**', '!src/index.ts']
}
