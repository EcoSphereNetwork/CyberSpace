import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@emotion/react";
import { theme } from "@/styles/theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatWindow } from "../ChatWindow";

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </ThemeProvider>
  );
};

describe("ChatWindow", () => {
  it("renders chat window with empty messages", () => {
    renderWithProviders(<ChatWindow channelId="test" />);
    expect(screen.getByText("Channel Name")).toBeInTheDocument();
  });

  it("sends message when user types and clicks send", async () => {
    renderWithProviders(<ChatWindow channelId="test" />);

    const input = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByLabelText("Send");

    await act(async () => {
      await userEvent.type(input, "Hello, world!");
      fireEvent.click(sendButton);
    });

    const messages = screen.getAllByText("Hello, world!");
    expect(messages.length).toBeGreaterThan(0);
  });

  it("shows typing indicator when users are typing", async () => {
    renderWithProviders(<ChatWindow channelId="test" />);

    const input = screen.getByPlaceholderText("Type a message...");

    await act(async () => {
      await userEvent.type(input, "Hello");
    });

    await waitFor(() => {
      expect(screen.getByText(/is typing/)).toBeInTheDocument();
    });
  });
});
