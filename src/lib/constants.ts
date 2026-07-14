/** Max characters for a chat message (avoids runaway embed/LLM cost) */
export const MAX_MESSAGE_LENGTH = 2000;

/** Max characters for a single ingest chunk */
export const MAX_CHUNK_LENGTH = 8000;

/** Max chunks per ingest request */
export const MAX_CHUNKS_PER_REQUEST = 50;

/** Top-K documents retrieved for RAG context */
export const MATCH_COUNT = 4;
