import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { useDebounce } from "@/hooks/useDebounce";
import { Tooltip } from "@/components/ui/Tooltip";
import { DropdownMenu } from "@/components/ui/DropdownMenu";

const Container = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid ${props => props.theme.colors.divider};
`;

const InputContainer = styled.div`
  flex: 1;
  position: relative;
`;

const Input = styled.textarea`
  width: 100%;
  min-height: 40px;
  max-height: 120px;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.divider};
  border-radius: 20px;
  resize: none;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  background: ${props => props.theme.colors.background.default};
  color: ${props => props.theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

export interface Attachment {
  id: string;
  file: File;
  type: 'image' | 'file';
  previewUrl?: string;
}

export interface ChatInputProps {
  onSend: (text: string, attachments?: Attachment[]) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  replyTo?: {
    id: string;
    userName: string;
    text: string;
  };
  onCancelReply?: () => void;
  mentionableUsers?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  onMention?: (userId: string) => void;
  onVoiceRecord?: (blob: Blob) => Promise<string>; // Returns URL of uploaded voice message
  onLinkPreview?: (url: string) => Promise<{
    title?: string;
    description?: string;
    image?: string;
  }>;
  maxAttachmentSize?: number; // in bytes
  allowedFileTypes?: string[]; // e.g. ['image/*', '.pdf', '.doc']
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onTyping,
  disabled = false,
  replyTo,
  onCancelReply,
  mentionableUsers = [],
  onMention,
  onVoiceRecord,
  onLinkPreview,
  maxAttachmentSize = 10 * 1024 * 1024, // 10MB default
  allowedFileTypes = ['image/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
}) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionAnchor, setMentionAnchor] = useState<{ start: number; end: number; } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const mentionListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clean up attachment preview URLs
      attachments.forEach(attachment => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });
    };
  }, [attachments]);

  const debouncedTyping = useDebounce((isTyping: boolean) => {
    onTyping(isTyping);
  }, 1000);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setText(value);
    onTyping(true);
    debouncedTyping(false);

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [onTyping, debouncedTyping]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setText("");
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  }, [handleSend]);

  const handleSend = useCallback(() => {
    const trimmedText = text.trim();
    if (trimmedText) {
      onSend(trimmedText);
      setText("");
      onTyping(false);
      debouncedTyping.cancel();
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  }, [text, onSend, onTyping, debouncedTyping]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      // Check file size
      if (file.size > maxAttachmentSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxAttachmentSize / 1024 / 1024}MB`);
        return false;
      }

      // Check file type
      const isAllowed = allowedFileTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -2));
        }
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      });

      if (!isAllowed) {
        alert(`File type not allowed for ${file.name}`);
        return false;
      }

      return true;
    });

    const newAttachments: Attachment[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [maxAttachmentSize, allowedFileTypes]);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      return prev.filter(a => a.id !== id);
    });
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || 0;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setText(newText);
      // Set cursor position after emoji
      setTimeout(() => {
        inputRef.current?.setSelectionRange(start + emoji.length, start + emoji.length);
        inputRef.current?.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  }, [text]);

  // Handle mentions
  const handleMentionSelect = useCallback((user: { id: string; name: string }) => {
    if (!mentionAnchor) return;

    const before = text.slice(0, mentionAnchor.start);
    const after = text.slice(mentionAnchor.end);
    setText(`${before}@${user.name} ${after}`);
    setShowMentions(false);
    setMentionAnchor(null);
    onMention?.(user.id);
  }, [text, mentionAnchor, onMention]);

  // Handle voice recording
  const handleVoiceRecordComplete = useCallback(async (blob: Blob) => {
    try {
      if (onVoiceRecord) {
        const url = await onVoiceRecord(blob);
        const attachment: Attachment = {
          id: Math.random().toString(36).substring(7),
          file: blob as any,
          type: 'voice',
          url,
        };
        setAttachments(prev => [...prev, attachment]);
      }
    } catch (error) {
      console.error('Failed to upload voice message:', error);
      setRecordingError('Failed to upload voice message');
    } finally {
      setIsRecording(false);
    }
  }, [onVoiceRecord]);

  // Handle link preview
  useEffect(() => {
    if (!onLinkPreview || !text) return;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);

    if (!urls) return;

    urls.forEach(async (url) => {
      try {
        const preview = await onLinkPreview(url);
        // TODO: Update UI with link preview
      } catch (error) {
        console.error('Failed to fetch link preview:', error);
      }
    });
  }, [text, onLinkPreview]);

  return (
    <Container>
      {replyTo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(0,0,0,0.05)', borderRadius: 4 }}>
          <Icon name="reply" style={{ fontSize: 16 }} />
          <div style={{ flex: 1, fontSize: 14 }}>
            Replying to <strong>{replyTo.userName}</strong>: {replyTo.text.substring(0, 50)}{replyTo.text.length > 50 ? '...' : ''}
          </div>
          <IconButton size="small" onClick={onCancelReply}>
            <Icon name="close" />
          </IconButton>
        </div>
      )}
      {recordingError && (
        <div style={{ color: 'red', padding: '4px 8px', fontSize: 14 }}>
          {recordingError}
          <IconButton size="small" onClick={() => setRecordingError(null)}>
            <Icon name="close" />
          </IconButton>
        </div>
      )}
      {attachments.length > 0 && (
        <AttachmentPreview>
          {attachments.map(attachment => (
            <AttachmentItem key={attachment.id}>
              {attachment.type === 'image' ? (
                <img src={attachment.previewUrl} alt="" />
              ) : attachment.type === 'voice' ? (
                <Icon name="mic" />
              ) : (
                <Icon name="attach_file" />
              )}
              <span>{attachment.file.name}</span>
              <RemoveButton onClick={() => handleRemoveAttachment(attachment.id)}>×</RemoveButton>
            </AttachmentItem>
          ))}
        </AttachmentPreview>
      )}
      {isRecording ? (
        <VoiceRecorder
          onRecord={handleVoiceRecordComplete}
          onCancel={() => setIsRecording(false)}
        />
      ) : (
        <InputRow>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            style={{ display: 'none' }}
            accept={allowedFileTypes.join(',')}
          />
          <Tooltip content="Attach files">
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Icon name="attach_file" />
            </IconButton>
          </Tooltip>
          <InputContainer>
            <Input
              ref={inputRef}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              disabled={disabled}
            />
            {showEmojiPicker && (
              <EmojiPicker>
                {['👍', '❤️', '😊', '😂', '🎉', '👏', '🙌', '🤔', '😅', '🔥', '✨', '👌', '🙏', '💯', '🌟', '💪'].map(emoji => (
                  <EmojiButton key={emoji} onClick={() => handleEmojiSelect(emoji)}>
                    {emoji}
                  </EmojiButton>
                ))}
              </EmojiPicker>
            )}
            {showMentions && mentionableUsers.length > 0 && (
              <div
                ref={mentionListRef}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  background: 'white',
                  border: '1px solid',
                  borderRadius: 4,
                  padding: 4,
                  marginBottom: 4,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                {mentionableUsers
                  .filter(user => user.name.toLowerCase().includes(mentionFilter.toLowerCase()))
                  .map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleMentionSelect(user)}
                      style={{
                        padding: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {user.avatar && (
                        <img
                          src={user.avatar}
                          alt=""
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                          }}
                        />
                      )}
                      <span>{user.name}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </InputContainer>
          <Tooltip content="Add emoji">
            <IconButton
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
            >
              <Icon name="emoji_emotions" />
            </IconButton>
          </Tooltip>
          {onVoiceRecord && (
            <Tooltip content="Record voice message">
              <IconButton
                onClick={() => setIsRecording(true)}
                disabled={disabled}
              >
                <Icon name="mic" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            aria-label="Send"
            onClick={handleSend}
            disabled={disabled || (!text.trim() && attachments.length === 0)}
          >
            <Icon name="send" />
          </IconButton>
        </InputRow>
      )}
    </Container>
  );
};
