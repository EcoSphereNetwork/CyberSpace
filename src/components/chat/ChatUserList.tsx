import React from "react";
import styled from "@emotion/styled";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip } from "@/components/ui/Tooltip";
import { Badge } from "@/components/ui/Badge";

const UserListContainer = styled.div`
  width: 240px;
  border-left: 1px solid ${props => props.theme.colors.divider};
  background: ${props => props.theme.colors.background.paper};
  overflow-y: auto;
`;

const UserListHeader = styled.div`
  padding: 12px 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.divider};
`;

const UserList = styled.div`
  padding: 8px 0;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors.action.hover};
  }
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserStatus = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.secondary};
`;

interface ChatUserListProps {
  users: ChatUserType[];
}

export const ChatUserList: React.FC<ChatUserListProps> = ({ users }) => {
  const onlineUsers = users.filter(user => user.status === "online");
  const offlineUsers = users.filter(user => user.status === "offline");

  return (
    <UserListContainer>
      <UserListHeader>
        Users ({users.length})
      </UserListHeader>
      <UserList>
        {onlineUsers.map(user => (
          <UserItem key={user.id}>
            <Tooltip content={user.status}>
              <Badge
                color="success"
                variant="dot"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
              >
                <Avatar src={user.avatar} alt={user.name} size="small" />
              </Badge>
            </Tooltip>
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserStatus>{user.status}</UserStatus>
            </UserInfo>
          </UserItem>
        ))}
        {offlineUsers.map(user => (
          <UserItem key={user.id}>
            <Avatar src={user.avatar} alt={user.name} size="small" />
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserStatus>{user.status}</UserStatus>
            </UserInfo>
          </UserItem>
        ))}
      </UserList>
    </UserListContainer>
  );
};
