#!/bin/bash

# Run linter
echo "Running linter..."
npm run lint

# Run type check
echo "Running type check..."
npm run typecheck

# Run unit tests
echo "Running unit tests..."
npm run test

# Run e2e tests
echo "Running e2e tests..."
npm run test:e2e

# Run storybook tests
echo "Running storybook tests..."
npm run test-storybook

# Check for any failed tests
if [ $? -eq 0 ]; then
  echo "All tests passed! 🎉"
  exit 0
else
  echo "Some tests failed! 😢"
  exit 1
fi