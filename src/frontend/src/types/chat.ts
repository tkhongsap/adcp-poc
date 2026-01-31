export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export type ArtifactType = "table" | "report" | "chart";

// Table artifact data types
export interface TableColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "pacing" | "health" | "currency" | "percentage";
  align?: "left" | "center" | "right";
}

export interface TableRow {
  id: string;
  [key: string]: unknown;
}

export interface TableArtifactData {
  columns: TableColumn[];
  rows: TableRow[];
}

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  data: unknown;
  timestamp: Date;
}

// Type guard for table artifact data
export function isTableArtifactData(data: unknown): data is TableArtifactData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return Array.isArray(d.columns) && Array.isArray(d.rows);
}
