import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import { ChatModule } from '../index';

describe('ChatModule', () => {
  const mockProps = {
    messages: [],
    contacts: [{ name: 'John' }, { name: 'Jane' }],
    onSendMessage: jest.fn(),
    onGroupCreate: jest.fn(),
    onFileAttach: jest.fn(),
    onToolSelect: jest.fn(),
  };

  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={theme}>
        <ChatModule {...mockProps} />
      </ThemeProvider>
    );
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('displays contacts', () => {
    render(
      <ThemeProvider theme={theme}>
        <ChatModule {...mockProps} />
      </ThemeProvider>
    );
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  it('sends message on button click', () => {
    render(
      <ThemeProvider theme={theme}>
        <ChatModule {...mockProps} />
      </ThemeProvider>
    );
    const input = screen.getByPlaceholderText('Type a message');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    expect(mockProps.onSendMessage).toHaveBeenCalled();
  });
});
