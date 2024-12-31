import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { LoadingManager, LoadingProgress } from '@/core/LoadingManager';
import { getRandomTip, LoadingTip } from '@/data/loadingTips';

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
  text-align: center;
`;

const SpinnerContainer = styled.div<{ progress: number }>`
  width: 100px;
  height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &::after {
    content: '${props => Math.round(props.progress)}%';
    font-size: 20px;
    font-weight: bold;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ProgressBar = styled.div`
  width: 300px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin: 20px 0;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  width: ${props => props.progress}%;
  height: 100%;
  background: #fff;
  transition: width 0.3s ease;
`;

const CurrentItem = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 10px;
  text-align: center;
`;

const TipContainer = styled.div`
  margin-top: 40px;
  max-width: 400px;
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  animation: fadeInOut 5s infinite;

  @keyframes fadeInOut {
    0% { opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { opacity: 0; }
  }
`;

const TipTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
`;

const TipText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
`;

interface LoadingScreenProps {
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<LoadingProgress>({
    total: 0,
    loaded: 0,
    percentage: 0,
  });
  const [currentTip, setCurrentTip] = useState<LoadingTip>(getRandomTip());

  useEffect(() => {
    const loadingManager = LoadingManager.getInstance();

    const handleProgress = (progress: LoadingProgress) => {
      setProgress(progress);
    };

    const handleComplete = () => {
      onComplete?.();
    };

    loadingManager.on('progress', handleProgress);
    loadingManager.on('complete', handleComplete);

    // Initial progress
    setProgress(loadingManager.getProgress());

    // Change tip every 5 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip(getRandomTip());
    }, 5000);

    return () => {
      loadingManager.off('progress', handleProgress);
      loadingManager.off('complete', handleComplete);
      clearInterval(tipInterval);
    };
  }, [onComplete]);

  return (
    <LoadingContainer>
      <SpinnerContainer progress={progress.percentage} />
      <LoadingText>Loading CyberSpace...</LoadingText>
      <ProgressBar>
        <ProgressFill progress={progress.percentage} />
      </ProgressBar>
      {progress.currentItem && (
        <CurrentItem>Loading: {progress.currentItem}</CurrentItem>
      )}
      <CurrentItem>
        {progress.loaded} / {progress.total} items loaded
      </CurrentItem>
      <TipContainer>
        <TipTitle>Did you know?</TipTitle>
        <TipText>{currentTip.text}</TipText>
      </TipContainer>
    </LoadingContainer>
  );
};