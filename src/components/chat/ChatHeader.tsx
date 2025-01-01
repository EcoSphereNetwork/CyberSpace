import React from "react";
import styled from "@emotion/styled";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${props => props.theme.colors.background.paper};
  border-bottom: 1px solid ${props => props.theme.colors.divider};
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChannelName = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const UserCount = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface ChatHeaderProps {
  channelId: string;
  userCount: number;
  onClose?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  channelId,
  userCount,
  onClose,
}) => {
  return (
    <HeaderContainer>
      <HeaderTitle>
        <Icon name="chat" />
        <ChannelName>{channelId}</ChannelName>
        <UserCount>{userCount} online</UserCount>
      </HeaderTitle>
      <HeaderActions>
        <Tooltip content="Search messages">
          <IconButton>
            <Icon name="search" />
          </IconButton>
        </Tooltip>
        <Tooltip content="Channel settings">
          <IconButton>
            <Icon name="settings" />
          </IconButton>
        </Tooltip>
        {onClose && (
          <Tooltip content="Close chat">
            <IconButton onClick={onClose}>
              <Icon name="close" />
            </IconButton>
          </Tooltip>
        )}
      </HeaderActions>
    </HeaderContainer>
  );
};
