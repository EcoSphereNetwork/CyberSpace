import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@emotion/react";
import { theme } from "@/styles/theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatWindow } from "../ChatWindow";
import { ChatMessageComponent } from "../ChatMessage";
import { ChatTypingIndicator } from "../ChatTypingIndicator";
import { ChatUserList } from "../ChatUserList";

const mockMessage = {
  id: "1",
  userId: "user1",
  userName: "User 1",
  text: "Hello, world!",
  timestamp: "2023-01-01T00:00:00.000Z",
};

const mockUser = {
  id: "user1",
  name: "User 1",
  email: "user1@example.com",
  status: "online",
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </ThemeProvider>
  );
};

describe("Chat Components", () => {
  it("renders ChatWindow without crashing", () => {
    renderWithProviders(<ChatWindow channelId="test" />);
  });

  it("renders ChatMessage without crashing", () => {
    renderWithProviders(<ChatMessageComponent message={mockMessage} />);
  });

  it("renders ChatTypingIndicator without crashing", () => {
    renderWithProviders(<ChatTypingIndicator users={[mockUser]} />);
  });

  it("renders ChatUserList without crashing", () => {
    renderWithProviders(<ChatUserList users={[mockUser]} />);
  });
});
