"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { MessageContent } from "./message-content";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatStorage {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  expiresAt: string;
}

const STORAGE_KEY = "fireguard-chat-history";
const EXPIRY_DAYS = 7;

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log("AIChatbot component mounted!");
  }, []);

  // Load chat history from localStorage on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory();
    }
  }, [messages]);

  // Auto-scroll to bottom when new message
  useEffect(() => {
    // Scroll to bottom smoothly
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load chat history from localStorage
  const loadChatHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const data: ChatStorage = JSON.parse(stored);
      
      // Check if expired
      const expiresAt = new Date(data.expiresAt);
      const now = new Date();
      
      if (now > expiresAt) {
        // Expired, clear storage
        localStorage.removeItem(STORAGE_KEY);
        console.log("Chat history expired and cleared");
        return;
      }

      // Load messages
      const loadedMessages: Message[] = data.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));

      setMessages(loadedMessages);
      console.log(`Loaded ${loadedMessages.length} messages from localStorage`);
    } catch (error) {
      console.error("Failed to load chat history:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Save chat history to localStorage
  const saveChatHistory = () => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

      const data: ChatStorage = {
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.toISOString(),
        })),
        expiresAt: expiresAt.toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    setShowClearDialog(false);
    toast.success("Chat history cleared");
    console.log("Chat history cleared");
  };

  // Refresh chat (start new conversation)
  const refreshChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Started new conversation");
    console.log("Chat refreshed");
  };

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "👋 Hi! I'm FireGuardAI Assistant. I can help you with:\n\n• Device status and information\n• Alert analysis\n• Temperature trends\n• Troubleshooting\n• System guidance\n\nWhat would you like to know?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          includeContext: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.message.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        toast.error(data.error || "Failed to get response");
        
        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again or check if the OpenRouter API key is configured.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Network error. Please try again.");
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "Show me device status",
    "Any alerts today?",
    "What's the temperature trend?",
    "How do I add a new device?",
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[9999]"
            style={{ pointerEvents: 'auto' }}
          >
            <Button
              onClick={() => {
                console.log("Chat button clicked!");
                setIsOpen(true);
              }}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            
            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-full bg-orange-600 animate-ping opacity-20 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[9999] w-[400px] max-w-[calc(100vw-3rem)]"
            style={{ pointerEvents: 'auto' }}
          >
            <Card className="shadow-2xl border-2 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">FireGuardAI Assistant</h3>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Powered by AI
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Refresh Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshChat}
                    className="text-white hover:bg-white/20 h-8 w-8"
                    title="Start new conversation"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  
                  {/* Clear History Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowClearDialog(true)}
                    className="text-white hover:bg-white/20 h-8 w-8"
                    title="Clear chat history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4" ref={scrollRef}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                            : "bg-muted"
                        }`}
                      >
                        <MessageContent 
                          content={message.content} 
                          isUser={message.role === "user"}
                        />
                        <p
                          className={`text-[10px] mt-1 ${
                            message.role === "user" ? "text-white/70" : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Invisible div to ensure scroll to bottom */}
                  <div ref={messagesEndRef} className="h-1" />
                </div>
              </ScrollArea>

              {/* Suggested Questions (only show if no messages yet) */}
              {messages.length <= 1 && !isLoading && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInput(question);
                        }}
                        className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-accent transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-muted-foreground">
                    AI responses may not always be accurate. Verify important information.
                  </p>
                  {messages.length > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      💾 {messages.length} msgs • Expires in {EXPIRY_DAYS} days
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Chat Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all chat messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={clearChatHistory}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
