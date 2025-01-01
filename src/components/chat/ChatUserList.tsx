import React from "react";
import styled from "@emotion/styled";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-weight: 500;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.primary.contrastText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 500;
`;

const UserStatus = styled.div<{ status: string }>`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
`;

export interface ChatUserListProps {
  users: {
    id: string;
    name: string;
    status: string;
  }[];
}

export const ChatUserList: React.FC<ChatUserListProps> = ({
  users,
}) => {
  return (
    <Container>
      <Header>
        Online Users ({users.length})
      </Header>
      <UserList>
        {users.map(user => (
          <UserItem key={user.id}>
            <Avatar>
              {user.name.slice(0, 2).toUpperCase()}
            </Avatar>
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserStatus status={user.status}>
                {user.status}
              </UserStatus>
            </UserInfo>
          </UserItem>
        ))}
      </UserList>
    </Container>
  );
};
