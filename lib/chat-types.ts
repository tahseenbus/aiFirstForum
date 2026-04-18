import { type IdeaCardData } from "@/lib/idea-data";

export type ChatRole = "user" | "assistant";

export type ChatThreadMessage = {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: string;
  followUpSuggestions?: string[];
};

export type ChatThread = {
  ideaId: string;
  messages: ChatThreadMessage[];
};

export type ChatPanelIdeaContext = Pick<
  IdeaCardData,
  "id" | "hook" | "features" | "tools"
> & {
  niche: string;
  budget: number;
  platform: string;
};
