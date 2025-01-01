export interface ChatMessageType {
  id: string;
  channelId: string;
  userId: string;
  user: ChatUserType;
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

export interface ChatUserType {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "away";
}

export interface ChatChannelType {
  id: string;
  name: string;
  description?: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}
