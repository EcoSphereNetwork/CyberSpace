import React, { useState, useCallback } from "react";
import styled from "@emotion/styled";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";

const MessageContainer = styled.div<{ isOwn?: boolean; isThread?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isOwn ? "flex-end" : "flex-start"};
  margin-bottom: ${props => props.isThread ? "8px" : "16px"};
  margin-left: ${props => props.isThread ? "32px" : "0"};
  position: relative;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const MessageAuthor = styled.div`
  font-weight: 500;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const MessageTime = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const MessageBubble = styled.div<{ isOwn?: boolean }>`
  background: ${props => props.isOwn ? props.theme.colors.primary.main : props.theme.colors.background.default};
  color: ${props => props.isOwn ? props.theme.colors.primary.contrastText : props.theme.colors.text.primary};
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 70%;
  word-wrap: break-word;
  position: relative;
`;

const MessageActions = styled.div<{ isVisible: boolean }>`
  position: absolute;
  right: ${props => props.isVisible ? "-40px" : "-1000px"};
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
  background: ${props => props.theme.colors.background.paper};
  border-radius: 20px;
  padding: 4px;
  box-shadow: ${props => props.theme.shadows[1]};
  transition: right 0.2s;
`;

const ReactionList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
`;

const Reaction = styled.button<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.divider};
  background: ${props => props.isActive ? props.theme.colors.primary.light : props.theme.colors.background.paper};
  color: ${props => props.isActive ? props.theme.colors.primary.main : props.theme.colors.text.primary};
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.action.hover};
  }
`;

const ThreadContainer = styled.div`
  margin-top: 8px;
  padding-left: 16px;
  border-left: 2px solid ${props => props.theme.colors.divider};
`;

const ThreadToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  background: none;
  color: ${props => props.theme.colors.primary.main};
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: ${props => props.theme.colors.primary.dark};
  }
`;

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  reactions?: Record<string, Reaction>;
  threadId?: string;
  replyTo?: string;
  editedAt?: string;
  isPinned?: boolean;
  attachments?: Array<{
    id: string;
    type: 'image' | 'file' | 'voice';
    url: string;
    name: string;
    size?: number;
    duration?: number; // For voice messages
  }>;
  metadata?: {
    editHistory?: Array<{
      text: string;
      timestamp: string;
    }>;
    mentions?: string[]; // User IDs
    links?: Array<{
      url: string;
      title?: string;
      description?: string;
      image?: string;
    }>;
  };
}

export interface ChatMessageProps {
  message: ChatMessage;
  isOwn?: boolean;
  isThread?: boolean;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string, newText: string) => void;
  onPin?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onUserClick?: (userId: string) => void;
  onLinkPreview?: (url: string) => Promise<{
    title?: string;
    description?: string;
    image?: string;
  }>;
  threadMessages?: ChatMessage[];
  currentUserId?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canPin?: boolean;
  mentionableUsers?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

const MessageInput = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.primary.main};
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary.main}20;
  }
`;

const EditActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const VoiceMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: ${props => props.theme.colors.background.default};
  border-radius: 4px;
  margin-top: 8px;
`;

const VoiceWaveform = styled.div`
  flex: 1;
  height: 32px;
  background: ${props => props.theme.colors.action.hover};
  border-radius: 4px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--progress, 0%);
    background: ${props => props.theme.colors.primary.main}40;
    transition: width 0.1s linear;
  }
`;

const LinkPreview = styled.a`
  display: flex;
  gap: 12px;
  padding: 8px;
  background: ${props => props.theme.colors.background.default};
  border-radius: 4px;
  margin-top: 8px;
  text-decoration: none;
  color: inherit;

  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
  }

  &:hover {
    background: ${props => props.theme.colors.action.hover};
  }
`;

const LinkInfo = styled.div`
  flex: 1;
  min-width: 0;

  h4 {
    margin: 0 0 4px;
    font-size: 0.875rem;
    color: ${props => props.theme.colors.primary.main};
  }

  p {
    margin: 0;
    font-size: 0.75rem;
    color: ${props => props.theme.colors.text.secondary};
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
  isOwn = false,
  isThread = false,
  onReaction,
  onReply,
  onEdit,
  onPin,
  onDelete,
  onUserClick,
  onLinkPreview,
  threadMessages = [],
  currentUserId,
  canEdit = false,
  canDelete = false,
  canPin = false,
  mentionableUsers = [],
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionAnchor, setMentionAnchor] = useState<{ start: number; end: number; } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const time = new Date(message.timestamp).toLocaleTimeString();

  // Handle message editing
  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setEditText(message.text);
  }, [message.text]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditText(message.text);
  }, [message.text]);

  const handleSaveEdit = useCallback(() => {
    if (editText.trim() !== message.text) {
      onEdit?.(message.id, editText.trim());
    }
    setIsEditing(false);
  }, [message.id, message.text, editText, onEdit]);

  // Handle mentions
  const handleMentionSelect = useCallback((user: { id: string; name: string }) => {
    if (!mentionAnchor) return;

    const before = editText.slice(0, mentionAnchor.start);
    const after = editText.slice(mentionAnchor.end);
    setEditText(`${before}@${user.name} ${after}`);
    setShowMentions(false);
    setMentionAnchor(null);
  }, [editText, mentionAnchor]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === '@') {
      const target = e.target as HTMLTextAreaElement;
      setMentionAnchor({
        start: target.selectionStart,
        end: target.selectionStart + 1,
      });
      setShowMentions(true);
      setMentionFilter('');
    }
  }, [handleCancelEdit, handleSaveEdit]);

  // Handle voice messages
  const handlePlayVoice = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const handleTimeUpdate = () => {
      setPlaybackProgress((audio.currentTime / audio.duration) * 100);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Handle link previews
  useEffect(() => {
    if (!onLinkPreview || !message.text) return;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.text.match(urlRegex);

    if (!urls) return;

    urls.forEach(async (url) => {
      if (message.metadata?.links?.some(link => link.url === url)) return;

      try {
        const preview = await onLinkPreview(url);
        // TODO: Update message metadata with link preview
      } catch (error) {
        console.error('Failed to fetch link preview:', error);
      }
    });
  }, [message.text, message.metadata?.links, onLinkPreview]);

  const handleReaction = useCallback((emoji: string) => {
    onReaction?.(message.id, emoji);
  }, [message.id, onReaction]);

  const handleReply = useCallback(() => {
    onReply?.(message.id);
  }, [message.id, onReply]);

  const handlePin = useCallback(() => {
    onPin?.(message.id);
  }, [message.id, onPin]);

  const handleDelete = useCallback(() => {
    onDelete?.(message.id);
  }, [message.id, onDelete]);

  const handleUserClick = useCallback(() => {
    onUserClick?.(message.userId);
  }, [message.userId, onUserClick]);

  const reactions = Object.entries(message.reactions || {}).map(([emoji, data]) => ({
    emoji,
    ...data,
  }));

  return (
    <MessageContainer isOwn={isOwn} isThread={isThread}>
      <MessageHeader>
        <MessageAuthor onClick={handleUserClick}>{message.userName}</MessageAuthor>
        <MessageTime>
          {time}
          {message.editedAt && (
            <span style={{ marginLeft: 4, fontSize: '0.75em' }}>(edited)</span>
          )}
          {message.isPinned && (
            <Icon name="push_pin" style={{ marginLeft: 4, fontSize: '0.875em' }} />
          )}
        </MessageTime>
      </MessageHeader>
      <div
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        style={{ position: 'relative' }}
      >
        <MessageBubble isOwn={isOwn}>
          {isEditing ? (
            <>
              <MessageInput
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                autoFocus
              />
              <EditActions>
                <IconButton size="small" onClick={handleSaveEdit}>
                  <Icon name="check" />
                </IconButton>
                <IconButton size="small" onClick={handleCancelEdit}>
                  <Icon name="close" />
                </IconButton>
              </EditActions>
              {showMentions && mentionableUsers.length > 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  background: 'white',
                  border: '1px solid',
                  borderRadius: 4,
                  padding: 4,
                  marginBottom: 4,
                }}>
                  {mentionableUsers
                    .filter(user => user.name.toLowerCase().includes(mentionFilter.toLowerCase()))
                    .map(user => (
                      <div
                        key={user.id}
                        onClick={() => handleMentionSelect(user)}
                        style={{ padding: 4, cursor: 'pointer' }}
                      >
                        {user.name}
                      </div>
                    ))
                  }
                </div>
              )}
            </>
          ) : (
            <>
              {message.text}
              {message.metadata?.links?.map(link => (
                <LinkPreview
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.image && <img src={link.image} alt="" />}
                  <LinkInfo>
                    <h4>{link.title || link.url}</h4>
                    {link.description && <p>{link.description}</p>}
                  </LinkInfo>
                </LinkPreview>
              ))}
              {message.attachments?.map(attachment => (
                <div key={attachment.id}>
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      style={{ maxWidth: '100%', borderRadius: 4, marginTop: 8 }}
                    />
                  ) : attachment.type === 'voice' ? (
                    <VoiceMessage>
                      <IconButton onClick={handlePlayVoice}>
                        <Icon name={isPlaying ? 'pause' : 'play_arrow'} />
                      </IconButton>
                      <VoiceWaveform style={{ '--progress': `${playbackProgress}%` } as any} />
                      <span style={{ fontSize: '0.75rem', color: 'gray' }}>
                        {attachment.duration ? `${Math.round(attachment.duration)}s` : '--:--'}
                      </span>
                      <audio
                        ref={audioRef}
                        src={attachment.url}
                        style={{ display: 'none' }}
                      />
                    </VoiceMessage>
                  ) : (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'block', marginTop: 8 }}
                    >
                      📎 {attachment.name} {attachment.size && `(${Math.round(attachment.size / 1024)}KB)`}
                    </a>
                  )}
                </div>
              ))}
            </>
          )}
        </MessageBubble>
        <MessageActions isVisible={showActions}>
          <Tooltip content="Add reaction">
            <IconButton size="small" onClick={() => handleReaction('👍')}>
              <Icon name="add_reaction" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Reply">
            <IconButton size="small" onClick={handleReply}>
              <Icon name="reply" />
            </IconButton>
          </Tooltip>
          {canPin && (
            <Tooltip content={message.isPinned ? "Unpin" : "Pin"}>
              <IconButton size="small" onClick={handlePin}>
                <Icon name={message.isPinned ? "push_pin" : "push_pin_outlined"} />
              </IconButton>
            </Tooltip>
          )}
          {canEdit && (
            <Tooltip content="Edit">
              <IconButton size="small" onClick={handleStartEdit}>
                <Icon name="edit" />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip content="Delete">
              <IconButton size="small" onClick={handleDelete}>
                <Icon name="delete" />
              </IconButton>
            </Tooltip>
          )}
        </MessageActions>
      </div>
      {reactions.length > 0 && (
        <ReactionList>
          {reactions.map(reaction => (
            <Reaction
              key={reaction.emoji}
              isActive={reaction.users.includes(currentUserId || '')}
              onClick={() => handleReaction(reaction.emoji)}
            >
              {reaction.emoji} {reaction.count}
            </Reaction>
          ))}
        </ReactionList>
      )}
      {threadMessages.length > 0 && (
        <>
          <ThreadToggle onClick={() => setShowThread(!showThread)}>
            <Icon name={showThread ? 'expand_less' : 'expand_more'} />
            {threadMessages.length} {threadMessages.length === 1 ? 'reply' : 'replies'}
          </ThreadToggle>
          {showThread && (
            <ThreadContainer>
              {threadMessages.map(threadMessage => (
                <ChatMessageComponent
                  key={threadMessage.id}
                  message={threadMessage}
                  isOwn={threadMessage.userId === currentUserId}
                  isThread
                  onReaction={onReaction}
                  onReply={onReply}
                  onEdit={onEdit}
                  onPin={onPin}
                  onDelete={onDelete}
                  onUserClick={onUserClick}
                  onLinkPreview={onLinkPreview}
                  currentUserId={currentUserId}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  canPin={canPin}
                  mentionableUsers={mentionableUsers}
                />
              ))}
            </ThreadContainer>
          )}
        </>
      )}
    </MessageContainer>
  );
};
