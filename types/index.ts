// ============ Business Hours ============
export interface BusinessHours {
  id: string;
  day: DayOfWeek;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

// ============ Tables ============
export interface RestaurantTable {
  id: string;
  name: string;
  capacity: number;
  isEnabled: boolean;
  token: string;
  defaultStayMinutes?: number; // Default stay duration in minutes (typically 15, 30, 45, 60)
}

// ============ Categories ============
export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  description?: string;
}

// ============ Products ============
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  isAvailable: boolean;
  prepTimeMinutes?: number;
}

// ============ Customers / Membership ============
export type AuthProvider = "email" | "google" | "facebook";
export type MembershipStatus = "pending" | "active" | "rejected";
export type UserRole = "admin" | "customer" | "member";

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  provider: AuthProvider;
  avatarUrl?: string;
  createdAt: string;
  orderIds: string[];
  membershipStatus: MembershipStatus;
  role: UserRole;
}

export interface MembershipRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  additionalDetails?: string;
}

export interface MembershipRequestRecord {
  id: string;
  customerId: string;
  fullName: string;
  email: string;
  phone: string;
  additionalDetails?: string;
  status: MembershipStatus;
  createdAt: string;
  reviewedAt?: string;
}

// ============ Orders ============
export type OrderStatus = "pending_ack" | "acknowledged" | "completed" | "served" | "payment_done" | "cancelled";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  notes?: string; // Customer notes for allergies, customization, etc.
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  // Optional: extended metadata used by Admin Order List creation flow
  orderType?: "dine_in" | "take_away" | "delivery";
  reservationStartTime?: string;
  reservationEndTime?: string;
  guestCount?: number;
  customerName?: string;
  // Billing helpers (optional)
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: string;
  customerId?: string;
  kotNumber?: number;
  notes?: string;
  acknowledgedAt?: string;
  updatedBy?: string; // username who last updated status
  // Inventory linkage
  inventoryApplied?: boolean; // true once auto-consumption deducted
  inventoryCogs?: number; // total cost deducted for this order
}


// ============ Reservations ============
export type ReservationStatus = "active" | "upcoming" | "completed" | "cancelled";

export interface Reservation {
  id: string;
  tableId: string;
  tableName: string;
  customerName: string;
  guestCount: number;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  notes?: string;
}

// ============ Cart ============
export interface CartItem {
  product: Product;
  quantity: number;
}

// ============ Bell Requests ============
export type BellRequestStatus = "pending" | "resolved";

export interface BellRequest {
  id: string;
  tableId: string;
  tableName: string;
  reason: string;
  status: BellRequestStatus;
  createdAt: string;
  resolvedAt?: string;
}

// ============ Service Configuration ============
export type ServiceType = "dine-in" | "takeaway" | "delivery";
export type DeliveryOption = "pickup" | "delivery" | "both";

export interface ServiceConfig {
  id: string;
  restaurantName: string;
  dineInEnabled: boolean;
  takeawayEnabled: boolean;
  deliveryEnabled: boolean;
  deliveryRadius?: number;
  minDeliveryOrder?: number;
  deliveryFee?: number;
  estimatedDineInTime?: number;
  estimatedTakeawayTime?: number;
  estimatedDeliveryTime?: number;
  updatedAt: string;
}

export interface MenuFilter {
  id: string;
  name: string;
  type: "dietary" | "allergen" | "spice" | "custom";
  icon?: string;
}

// ============ Order Customization ============
export interface OrderModifier {
  id: string;
  name: string;
  options: ModifierOption[];
  isRequired: boolean;
  maxSelections?: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface CustomizedOrderItem extends OrderItem {
  modifiers?: Record<string, string[]>; // modifierId -> selected optionIds
  specialRequests?: string;
}

// ============ Customer Feedback & Ratings ============
export interface OrderFeedback {
  id: string;
  orderId: string;
  customerId: string;
  rating: number; // 1-5
  foodQuality?: number;
  serviceQuality?: number;
  deliveryQuality?: number;
  comment?: string;
  createdAt: string;
}

export interface RestaurantReview {
  id: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  categories: {
    food: number;
    service: number;
    ambiance: number;
    value: number;
  };
  createdAt: string;
}

// ============ Menu Management ============
export interface SubMenu {
  id: string;
  name: string;
  description?: string;
  categoryIds: string[]; // Links to Categories
  displayOrder: number;
  isActive: boolean;
}

export interface MenuSet {
  id: string;
  name: string;
  description?: string;
  type: "breakfast" | "lunch" | "dinner" | "special" | "custom";
  productIds: string[]; // Links to Products
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface AddOn {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: "sauce" | "topping" | "side" | "drink" | "dessert" | "custom";
  isAvailable: boolean;
  imageUrl?: string;
}

export interface ComboOffer {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  discountPrice: number;
  productIds: string[]; // Main dishes in combo
  addOnIds?: string[]; // Optional add-ons included
  quantity: number; // How many items in combo
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
}

// ============ Service Settings ============
export interface ServiceSettings {
  dineInEnabled: boolean;
  activeMenuSetId: string;
  viewInvoiceEnabled: boolean;
  viewKOTEnabled: boolean;
  checkInEnabled: boolean;
  requireOrderConfirmation: boolean;
}

export interface DeliverySettings {
  deliveryEnabled: boolean;
  activeMenuSetId: string;
  viewInvoiceEnabled: boolean;
  viewKOTEnabled: boolean;
  requireOrderConfirmation: boolean;
  fixedDeliveryCharge: number;
  freeDeliveryAbove: number;
  minimumCartValue: number;
  restaurantName: string;
  restaurantPhone: string;
  restaurantAddress: string;
  deliveryMenuUrl: string;
}

// ============ Dashboard ============
export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalTables: number;
  todayOrders: number;
  revenue: number;
}

// ============ Table Locking & Sessions ============
export interface TableLock {
  id: string;
  tableId: string;
  temporaryUserId: string;
  reservationStartTime: string;
  expiresAt: string;
  paymentStatus: "pending" | "completed" | "expired";
}

export interface TemporarySession {
  id: string;
  tableId: string;
  temporaryUserId: string;
  createdAt: string;
  expiresAt: string;
  paymentStatus: "pending" | "completed" | "expired";
  customerId?: string;
  orders: string[];
}

export interface SessionState {
  isActive: boolean;
  timeRemaining: number; // seconds
  sessionId: string | null;
  temporaryUserId: string | null;
  tableId: string | null;
  createdAt: string | null;
  expiresAt: string | null;
}


// ============ Inventory (Frontend-only mock) ============
export type StockCategory = "Drinks" | "Groceries" | "Meat" | "Vegetables" | "Others";

export interface MeasuringUnit {
  id: string;
  name: string; // e.g., Kilogram
  shortName: string; // e.g., kg
  description?: string;
}

export interface StockGroup {
  id: string;
  name: string; // e.g., Drinks, Groceries
  description?: string;
}

export interface StockItem {
  id: string;
  name: string;
  unitIds: string[]; // multiple selectable measuring units
  defaultPrice: number; // default purchase price per primary unit
  category: StockCategory;
  stockGroupId: string;
  lowStockThreshold: number;

  // Opening stock
  openingQty: number;
  openingRate: number; // cost per unit
  openingValue: number; // openingQty * openingRate

  // Current valuation (weighted average costing)
  currentQty: number;
  avgCost: number; // weighted average cost per unit
  updatedAt: string; // ISO date
  createdAt: string; // ISO date
}

export type InventoryMovementType = "opening" | "restock" | "consume" | "adjust" | "waste";

export interface StockMovement {
  id: string;
  date: string; // ISO date
  type: InventoryMovementType;
  stockItemId: string;
  qtyIn: number; // positive for incoming
  qtyOut: number; // positive for outgoing
  rate: number; // cost per unit for incoming; avgCost snapshot for outgoing
  value: number; // qtyIn*rate OR qtyOut*rate
  note?: string;
  supplierId?: string;
  dishId?: string;
  reference?: string; // invoice no, etc.
  createdAt: string; // ISO date
}

export interface Supplier {
  id: string;
  fullName: string;
  legalOrgName?: string;
  phone: string;
  email?: string;
  taxNumber?: string;
  dob?: string; // ISO date
  openingBalanceType: "to_collect" | "to_pay";
  openingAmount: number; // positive number entered by user
  createdAt: string;
  updatedAt: string;
}

export type SupplierTxnType = "purchase" | "payment" | "adjustment";

export interface SupplierTransaction {
  id: string;
  supplierId: string;
  date: string; // ISO
  type: SupplierTxnType;
  amount: number; // positive
  note?: string;
  reference?: string;
  createdAt: string;
}

export interface DishRecipeLine {
  stockItemId: string;
  qtyPerServing: number;
  unitId: string;
}

export interface DishRecipe {
  id: string;
  dishId: string; // maps to Product id
  lines: DishRecipeLine[];
  updatedAt: string;
}

export interface ConsumptionRecord {
  id: string;
  date: string; // ISO
  dishId: string;
  servings: number;
  totalCost: number;
  note?: string;
  // linkage
  source?: \"manual\" | \"order\";
  orderId?: string;
  createdAt: string;
}


// ============ Admin Extensions (Customer Management / Order Drafts) ============
export * from "./customer";
export * from "./attribute";
export * from "./order";
