import React, { Component, ErrorInfo, ReactNode } from 'react';
import { styled } from '@emotion/styled';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const ErrorContainer = styled.div`
  padding: 20px;
  margin: 20px;
  border: 1px solid ${props => props.theme.colors.status.error};
  border-radius: 4px;
  background-color: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
`;

const ErrorHeading = styled.h2`
  color: ${props => props.theme.colors.status.error};
  margin-bottom: 10px;
`;

const ErrorMessage = styled.pre`
  background-color: ${props => props.theme.colors.background.default};
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  max-height: 200px;
`;

const RetryButton = styled.button`
  background-color: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.text.primary};
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: ${props => props.theme.colors.primary.dark};
  }
`;

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorHeading>Something went wrong</ErrorHeading>
          <ErrorMessage>
            {this.state.error?.message}
          </ErrorMessage>
          <RetryButton onClick={this.handleRetry}>
            Try Again
          </RetryButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}
