// ---------------------------------------------------------------------------
// Chat Interfaces — maps to Firestore `chatRooms/` collection
// ---------------------------------------------------------------------------

export interface ChatRoom {
  _id: string;
  clientUid: string;
  agentUid: string;
  /** Tenant this chat room belongs to. Required for multi-tenant queries. */
  tenantId: string;
  tourId?: string;
  tourSlug?: string;
  status: "active" | "resolved" | "archived";
  createdAt: Date;
  lastMessageAt: Date;
}

export interface ChatMessage {
  _id: string;
  senderUid: string;
  senderRole: "client" | "agent";
  text: string;
  timestamp: Date;
  read: boolean;
}
