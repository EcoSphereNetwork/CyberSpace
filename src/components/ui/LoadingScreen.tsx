import React from 'react';
import styled from '@emotion/styled';

const LoadingContainer = styled.div`
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
`;

const LoadingText = styled.div`
  font-size: 24px;
  font-weight: 500;
  margin-top: 20px;
`;

const SpinnerContainer = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const LoadingScreen: React.FC = () => (
  <LoadingContainer>
    <SpinnerContainer />
    <LoadingText>Loading CyberSpace...</LoadingText>
  </LoadingContainer>
);