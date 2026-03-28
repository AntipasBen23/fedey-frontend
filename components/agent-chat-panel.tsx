"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { OnboardingChatMessage } from "@/lib/contracts/onboarding";

type AgentChatPanelProps = {
  apiBaseUrl: string;
  sessionId: string;
  messages: OnboardingChatMessage[];
  pendingPrompt?: string;
};

type StreamMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export function AgentChatPanel({ apiBaseUrl, sessionId, messages, pendingPrompt }: AgentChatPanelProps) {
  const router = useRouter();
  const initialMessages = useMemo<StreamMessage[]>(
    () =>
      messages.map((message) => ({
        id: message.id,
        role: message.role === "user" ? "user" : "assistant",
        content: message.content
      })),
    [messages]
  );

  const [chatMessages, setChatMessages] = useState<StreamMessage[]>(initialMessages);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isSending) {
      return;
    }

    setError("");
    setIsSending(true);

    const userMessage: StreamMessage = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content: trimmed
    };
    const assistantMessage: StreamMessage = {
      id: `local-assistant-${Date.now()}`,
      role: "assistant",
      content: ""
    };

    setChatMessages((current) => [...current, userMessage, assistantMessage]);
    setMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/v1/onboarding/sessions/${sessionId}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId,
          message: trimmed
        })
      });

      if (!response.ok || !response.body) {
        throw new Error("The agent could not answer right now.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) {
            continue;
          }
          const payload = JSON.parse(trimmedLine) as { type: string; content?: string };
          if (payload.type === "delta" && payload.content) {
            setChatMessages((current) =>
              current.map((item) =>
                item.id === assistantMessage.id ? { ...item, content: item.content + payload.content } : item
              )
            );
          }
        }
      }

      router.refresh();
    } catch (streamError) {
      setError(streamError instanceof Error ? streamError.message : "The agent could not answer right now.");
      setChatMessages((current) => current.filter((item) => item.id !== assistantMessage.id));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <div className="chat-thread">
        {chatMessages.map((chatMessage) => (
          <div key={chatMessage.id} className={`chat-message chat-message-${chatMessage.role}`}>
            <p className="chat-title">{chatMessage.role === "user" ? "You" : "Fedey agent"}</p>
            <p className="chat-body">{chatMessage.content || (isSending && chatMessage.role === "assistant" ? "..." : "")}</p>
          </div>
        ))}

        {pendingPrompt ? <p className="chat-helper">Current missing detail: {pendingPrompt}</p> : null}
        {error ? <p className="chat-error">{error}</p> : null}
      </div>

      <form className="chat-composer" onSubmit={handleSubmit}>
        <input
          type="text"
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Reply naturally or ask the agent a question"
          autoComplete="off"
          disabled={isSending}
        />
        <button type="submit" disabled={isSending}>
          {isSending ? "Thinking..." : "Send"}
        </button>
      </form>
    </>
  );
}
