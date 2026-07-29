export type SalesChannel = "whatsapp" | "instagram" | "messenger" | "web";
export type ConversationStatus = "new" | "assigned" | "waiting" | "closed";

export interface SalesConversation {
  id: string;
  channel: SalesChannel;
  customerName: string;
  customerHandle?: string;
  phone?: string;
  lastMessage: string;
  status: ConversationStatus;
  assignedTo?: string;
  assignedName?: string;
  updatedAt?: { toDate?: () => Date };
}

export interface SalesOrder {
  id: string;
  customerName: string;
  total: number;
  status: "pending" | "confirmed" | "paid" | "shipped" | "completed" | "cancelled";
  advisorId?: string;
  advisorName?: string;
  createdAt?: { toDate?: () => Date };
}
