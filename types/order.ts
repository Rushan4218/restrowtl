export type AdminOrderType = "dine_in" | "take_away" | "delivery" | "quick_order" | "reservation" | "pick_up";

export interface ReservationDetails {
  tableId?: string;
  tableName?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  guestCount: number;
}

export type CustomerReference =
  | { kind: "walk_in"; name?: string }
  | { kind: "registered"; customerId: string };

export interface OrderDraftItem {
  productId: string;
  quantity: number;
}

export interface OrderDraft {
  orderType: AdminOrderType;
  reservation?: ReservationDetails;
  customer: CustomerReference;
  notes?: string;
  items: OrderDraftItem[];
}
