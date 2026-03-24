// ---------------------------------------------------------------------------
// Chat Interfaces — maps to Firestore `chatRooms/` collection
// ---------------------------------------------------------------------------

export interface ChatRoom {
  _id: string;
  clientUid: string;
  agentUid: string;
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
