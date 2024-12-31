import React from 'react';
import styled from '@emotion/styled';

const ErrorContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #fff;
  padding: 20px;
`;

const ErrorIcon = styled.div`
  width: 64px;
  height: 64px;
  border: 3px solid #f44336;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  &::before {
    content: '!';
    font-size: 48px;
    font-weight: bold;
    color: #f44336;
  }
`;

const ErrorTitle = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 10px;
`;

const ErrorMessage = styled.div`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-bottom: 20px;
  max-width: 600px;
`;

const RetryButton = styled.button`
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1565c0;
  }
`;

export const ErrorScreen: React.FC<{ message: string }> = ({ message }) => (
  <ErrorContainer>
    <ErrorIcon />
    <ErrorTitle>Something went wrong</ErrorTitle>
    <ErrorMessage>{message}</ErrorMessage>
    <RetryButton onClick={() => window.location.reload()}>
      Try Again
    </RetryButton>
  </ErrorContainer>
);