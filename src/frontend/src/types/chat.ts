export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export type ArtifactType = "table" | "report" | "chart";

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  data: unknown;
  timestamp: Date;
}
