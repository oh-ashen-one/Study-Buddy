import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Brain, 
  User, 
  Loader2, 
  Share2,
  Copy,
  Check,
  Sparkles
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, StudyChat, StudyChatMessage } from "@shared/schema";

interface ChatInterfaceProps {
  profile: UserProfile | undefined;
}

interface MessageWithMeta extends StudyChatMessage {
  isStreaming?: boolean;
}

export function ChatInterface({ profile }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageWithMeta[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentChat } = useQuery<StudyChat & { messages: StudyChatMessage[] }>({
    queryKey: ["/api/study-chats/current"],
  });

  useEffect(() => {
    if (currentChat?.messages) {
      setMessages(currentChat.messages);
    }
  }, [currentChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setIsStreaming(true);

    // Add user message immediately
    const tempUserMsg: MessageWithMeta = {
      id: Date.now(),
      chatId: currentChat?.id || 0,
      role: "user",
      content: userMessage,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Add placeholder for assistant
    const tempAssistantMsg: MessageWithMeta = {
      id: Date.now() + 1,
      chatId: currentChat?.id || 0,
      role: "assistant",
      content: "",
      createdAt: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, tempAssistantMsg]);

    try {
      const response = await fetch("/api/study-chats/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              assistantContent += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx]?.role === "assistant") {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    content: assistantContent,
                  };
                }
                return updated;
              });
            }
            if (data.done) {
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx]) {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    isStreaming: false,
                  };
                }
                return updated;
              });
            }
          } catch {}
        }
      }

      queryClient.invalidateQueries({ queryKey: ["/api/study-chats/current"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      // Remove the failed messages
      setMessages((prev) => prev.slice(0, -2));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const shareAnswer = useMutation({
    mutationFn: async (messageId: number) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message) return null;
      
      const prevUserMsg = messages
        .slice(0, messages.indexOf(message))
        .filter((m) => m.role === "user")
        .pop();

      const res = await apiRequest("POST", "/api/shared-answers", {
        question: prevUserMsg?.content || "",
        answer: message.content,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data?.shareId) {
        const url = `${window.location.origin}/share/${data.shareId}`;
        navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied!",
          description: "Share link has been copied to your clipboard.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create share link.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getGreeting = () => {
    if (profile?.major) {
      const isStem = ["Computer Science", "Engineering", "Biology", "Chemistry", "Physics", "Mathematics", "Pre-Med"].includes(profile.major);
      const isLaw = profile.major === "Pre-Law";
      
      if (isStem) return "Hey there, future scientist! What can I help you study today?";
      if (isLaw) return "Ready to ace that LSAT? What would you like to work on?";
    }
    return "You're a college student - what do you need help with?";
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">AI Study Assistant</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                {getGreeting()}
              </p>
              <div className="grid sm:grid-cols-2 gap-3 max-w-lg">
                <SuggestionButton 
                  text="Best way to study for organic chemistry?" 
                  onClick={() => setInput("What's the best way to study for organic chemistry?")}
                />
                <SuggestionButton 
                  text="Find YouTube channels for linear algebra" 
                  onClick={() => setInput("Find me YouTube channels for linear algebra")}
                />
                <SuggestionButton 
                  text="Help me plan my study schedule" 
                  onClick={() => setInput("Help me create an effective study schedule for this week")}
                />
                <SuggestionButton 
                  text="Resources for LSAT prep" 
                  onClick={() => setInput("What are good resources for LSAT prep?")}
                />
              </div>
            </div>
          ) : (
            messages.map((message, idx) => (
              <div 
                key={message.id} 
                className={`flex gap-3 animate-fade-in ${message.role === "user" ? "justify-end" : ""}`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary/10">
                      <Brain className="w-4 h-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`group relative max-w-[85%] ${message.role === "user" ? "order-first" : ""}`}>
                  <div 
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-br-md" 
                        : "bg-card border border-border rounded-bl-md"
                    }`}
                    data-testid={`message-${message.role}-${message.id}`}
                  >
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                      {message.isStreaming && (
                        <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-blink" />
                      )}
                    </div>
                  </div>
                  
                  {message.role === "assistant" && message.content && !message.isStreaming && (
                    <div className="invisible group-hover:visible flex items-center gap-1 mt-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyToClipboard(message.content, message.id)}
                        data-testid={`button-copy-${message.id}`}
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => shareAnswer.mutate(message.id)}
                        disabled={shareAnswer.isPending}
                        data-testid={`button-share-${message.id}`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-muted">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-border p-4 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about studying, courses, or resources..."
              className="min-h-[56px] max-h-[200px] pr-12 resize-none text-base"
              disabled={isStreaming}
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              className="absolute right-2 bottom-2"
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              data-testid="button-send-message"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI responses are generated and may not always be accurate. Always verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}

function SuggestionButton({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border text-left text-sm hover-elevate transition-colors"
      data-testid={`button-suggestion-${text.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`}
    >
      <Sparkles className="w-4 h-4 text-primary shrink-0" />
      <span className="text-muted-foreground">{text}</span>
    </button>
  );
}
