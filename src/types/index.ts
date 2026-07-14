/** Row shape for the `tenants` table */
export interface Tenant {
  id: string;
  name: string;
  api_key: string;
  system_prompt: string;
  created_at: string;
}

/** Tenant metadata returned by GET (never includes api_key) */
export interface TenantPublic {
  id: string;
  name: string;
  system_prompt: string;
  created_at: string;
}

/** Row shape for the `documents` table */
export interface Document {
  id: string;
  tenant_id: string;
  content: string;
  metadata: Record<string, unknown>;
  embedding: number[] | null;
}

/** Single chat history row */
export interface ChatMessage {
  id: string;
  tenant_id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

/** POST /api/v1/chat request body */
export interface ChatRequest {
  message: string;
  session_id: string;
}

/** Source document returned with a chat answer */
export interface ChatSource {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

/** POST /api/v1/chat response body */
export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  session_id: string;
}

/** Row returned by match_documents RPC */
export interface MatchDocument {
  id: string;
  tenant_id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

/** Ingest chunk input */
export interface IngestChunk {
  content: string;
  metadata?: Record<string, unknown>;
}

/** POST /api/v1/ingest request body */
export interface IngestRequest {
  tenant_id: string;
  chunks: IngestChunk[];
}

/** POST /api/v1/ingest response body */
export interface IngestResponse {
  inserted: number;
}

/** POST /api/v1/tenants request body */
export interface CreateTenantRequest {
  name: string;
  system_prompt: string;
}

/** POST /api/v1/tenants response (api_key returned once) */
export interface CreateTenantResponse {
  id: string;
  name: string;
  system_prompt: string;
  api_key: string;
  created_at: string;
}

/** Consistent API error shape */
export interface ApiError {
  error: string;
  code: string;
}
