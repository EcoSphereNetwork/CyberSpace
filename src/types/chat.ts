export interface ChatMessageType {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
  type?: "system" | "error" | "info";
  metadata?: Record<string, any>;
}

export interface ChatUserType {
  id: string;
  name: string;
  avatar?: string;
  status?: string;
  metadata?: Record<string, any>;
}
