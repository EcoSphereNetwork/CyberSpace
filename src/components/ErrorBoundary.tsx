import React, { Component, ErrorInfo } from "react";
import styled from "@emotion/styled";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h3`
  color: ${props => props.theme.colors.error.main};
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 2rem;
`;

const RetryButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.primary.contrastText};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.theme.colors.primary.dark};
  }
`;

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Container>
          <Title>Something went wrong</Title>
          <Message>
            {this.state.error?.message || "An unexpected error occurred"}
          </Message>
          <RetryButton onClick={this.handleRetry}>Try Again</RetryButton>
        </Container>
      );
    }

    return this.props.children;
  }
}
