import type {
  BusinessHours,
  RestaurantTable,
  Category,
  Product,
  Order,
  Reservation,
  MembershipRequestRecord,
  SubMenu,
  MenuSet,
  AddOn,
  ComboOffer,
} from "@/types";

// ============ In-Memory Mock Database ============

export const mockBusinessHours: BusinessHours[] = [
  { id: "bh-1", day: "Monday", openTime: "09:00", closeTime: "22:00", isClosed: false },
  { id: "bh-2", day: "Tuesday", openTime: "09:00", closeTime: "22:00", isClosed: false },
  { id: "bh-3", day: "Wednesday", openTime: "09:00", closeTime: "22:00", isClosed: false },
  { id: "bh-4", day: "Thursday", openTime: "09:00", closeTime: "23:00", isClosed: false },
  { id: "bh-5", day: "Friday", openTime: "09:00", closeTime: "23:30", isClosed: false },
  { id: "bh-6", day: "Saturday", openTime: "10:00", closeTime: "23:30", isClosed: false },
  { id: "bh-7", day: "Sunday", openTime: "10:00", closeTime: "21:00", isClosed: false },
];

export const mockTables: RestaurantTable[] = [
  { id: "t-1", name: "T1", capacity: 2, isEnabled: true, token: "qr_t1_aBcDeFgHiJkLmNoP" },
  { id: "t-2", name: "T2", capacity: 4, isEnabled: true, token: "qr_t2_QrStUvWxYz012345" },
  { id: "t-3", name: "T3", capacity: 4, isEnabled: true, token: "qr_t3_6789AbCdEfGhIjKl" },
  { id: "t-4", name: "T4", capacity: 6, isEnabled: true, token: "qr_t4_MnOpQrStUvWxYz01" },
  { id: "t-5", name: "VIP-1", capacity: 8, isEnabled: true, token: "qr_t5_2345AbCdEfGhIjKl" },
  { id: "t-6", name: "VIP-2", capacity: 10, isEnabled: true, token: "qr_t6_MnOpQrStUvWx6789" },
  { id: "t-7", name: "Patio-1", capacity: 4, isEnabled: false, token: "qr_t7_YzAbCdEf01234567" },
  { id: "t-8", name: "Patio-2", capacity: 6, isEnabled: true, token: "qr_t8_GhIjKlMnOpQrStUv" },
];

export const mockCategories: Category[] = [
  { id: "cat-1", name: "Beverages", parentId: null, description: "Drinks and refreshments" },
  { id: "cat-2", name: "Food", parentId: null, description: "Main dishes and sides" },
  { id: "cat-3", name: "Liquors", parentId: null, description: "Spirits, wines, and cocktails" },
  { id: "cat-4", name: "Tobacco", parentId: null, description: "Cigars and hookahs" },
  { id: "cat-5", name: "Hot Drinks", parentId: "cat-1", description: "Tea, coffee, and more" },
  { id: "cat-6", name: "Cold Drinks", parentId: "cat-1", description: "Juices, sodas, and shakes" },
  { id: "cat-7", name: "Appetizers", parentId: "cat-2", description: "Starters and small bites" },
  { id: "cat-8", name: "Main Course", parentId: "cat-2", description: "Entrees and mains" },
  { id: "cat-9", name: "Desserts", parentId: "cat-2", description: "Sweet treats" },
  { id: "cat-10", name: "Wines", parentId: "cat-3", description: "Red, white, and rose" },
  { id: "cat-11", name: "Cocktails", parentId: "cat-3", description: "Mixed drinks" },
];

export const mockProducts: Product[] = [
  { id: "p-1", name: "Espresso", description: "Rich, bold single-shot espresso", price: 3.50, categoryId: "cat-5", imageUrl: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop", isAvailable: true },
  { id: "p-2", name: "Cappuccino", description: "Espresso with steamed milk foam", price: 4.50, categoryId: "cat-5", imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop", isAvailable: true },
  { id: "p-3", name: "Latte", description: "Smooth espresso with velvety steamed milk", price: 5.00, categoryId: "cat-5", imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop", isAvailable: true },
  { id: "p-4", name: "Fresh Orange Juice", description: "Freshly squeezed oranges", price: 4.00, categoryId: "cat-6", imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop", isAvailable: true },
  { id: "p-5", name: "Mango Smoothie", description: "Tropical mango blended with yogurt", price: 5.50, categoryId: "cat-6", imageUrl: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop", isAvailable: false },
  { id: "p-6", name: "Iced Lemonade", description: "Refreshing lemon with mint", price: 3.50, categoryId: "cat-6", imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=300&fit=crop", isAvailable: true },
  { id: "p-7", name: "Bruschetta", description: "Toasted bread with tomato and basil", price: 7.00, categoryId: "cat-7", imageUrl: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop", isAvailable: true, prepTimeMinutes: 10 },
  { id: "p-8", name: "Caesar Salad", description: "Crispy romaine with parmesan and croutons", price: 9.00, categoryId: "cat-7", imageUrl: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop", isAvailable: true, prepTimeMinutes: 8 },
  { id: "p-9", name: "Grilled Salmon", description: "Atlantic salmon with lemon butter sauce", price: 22.00, categoryId: "cat-8", imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop", isAvailable: true, prepTimeMinutes: 20 },
  { id: "p-10", name: "Ribeye Steak", description: "10oz prime cut with garlic butter", price: 28.00, categoryId: "cat-8", imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop", isAvailable: true, prepTimeMinutes: 25 },
  { id: "p-11", name: "Pasta Carbonara", description: "Classic Italian pasta with egg and bacon", price: 16.00, categoryId: "cat-8", imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop", isAvailable: true, prepTimeMinutes: 15 },
  { id: "p-12", name: "Tiramisu", description: "Traditional Italian coffee-flavored dessert", price: 8.00, categoryId: "cat-9", imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop", isAvailable: true, prepTimeMinutes: 5 },
  { id: "p-13", name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center", price: 9.50, categoryId: "cat-9", imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop", isAvailable: true, prepTimeMinutes: 12 },
  { id: "p-14", name: "House Red Wine", description: "Full-bodied Cabernet Sauvignon", price: 12.00, categoryId: "cat-10", imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop", isAvailable: true },
  { id: "p-15", name: "Mojito", description: "Classic rum with lime and fresh mint", price: 10.00, categoryId: "cat-11", imageUrl: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop", isAvailable: true },
  { id: "p-16", name: "Margarita", description: "Tequila with lime juice and triple sec", price: 11.00, categoryId: "cat-11", imageUrl: "https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=400&h=300&fit=crop", isAvailable: true },
];

// Helper to create dates relative to now
function minutesAgo(minutes: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutes);
  return d.toISOString();
}

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function hoursFromNow(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

export const mockOrders: Order[] = [
  // Pending Acknowledge Orders
  {
    id: "ord-101",
    tableId: "t-1",
    tableName: "T1",
    items: [
      { productId: "p-1", productName: "Espresso", quantity: 2, price: 3.50 },
      { productId: "p-7", productName: "Bruschetta", quantity: 1, price: 7.00 },
    ],
    status: "pending_ack",
    total: 14.00,
    createdAt: minutesAgo(2),
  },
  {
    id: "ord-102",
    tableId: "t-3",
    tableName: "T3",
    items: [
      { productId: "p-11", productName: "Pasta Carbonara", quantity: 1, price: 16.00, notes: "No peanuts - severe allergy. Please use gluten-free pasta" },
      { productId: "p-15", productName: "Mojito", quantity: 2, price: 10.00, notes: "Light on sugar, extra mint" },
      { productId: "p-2", productName: "Cappuccino", quantity: 3, price: 4.50 },
      { productId: "p-8", productName: "Caesar Salad", quantity: 2, price: 9.00, notes: "Dressing on the side, no croutons" },
      { productId: "p-12", productName: "Tiramisu", quantity: 1, price: 8.00 },
    ],
    status: "pending_ack",
    total: 110.50,
    createdAt: minutesAgo(5),
  },
  // Acknowledged Orders
  {
    id: "ord-103",
    tableId: "t-4",
    tableName: "T4",
    items: [
      { productId: "p-10", productName: "Ribeye Steak", quantity: 2, price: 28.00 },
      { productId: "p-14", productName: "House Red Wine", quantity: 2, price: 12.00 },
      { productId: "p-8", productName: "Caesar Salad", quantity: 2, price: 9.00 },
      { productId: "p-12", productName: "Tiramisu", quantity: 2, price: 8.00 },
      { productId: "p-3", productName: "Latte", quantity: 1, price: 5.00 },
      { productId: "p-6", productName: "Iced Lemonade", quantity: 2, price: 3.50 },
      { productId: "p-13", productName: "Chocolate Lava Cake", quantity: 1, price: 9.50 },
    ],
    status: "acknowledged",
    total: 161.00,
    createdAt: minutesAgo(8),
    acknowledgedAt: minutesAgo(7),
  },
  // Acknowledged Orders - With 10+ items
  {
    id: "ord-104",
    tableId: "t-5",
    tableName: "VIP-1",
    items: [
      { productId: "p-9", productName: "Grilled Salmon", quantity: 2, price: 22.00, notes: "Vegan option requested - use olive oil instead of butter" },
      { productId: "p-10", productName: "Ribeye Steak", quantity: 2, price: 28.00, notes: "Medium-rare, no salt beforehand" },
      { productId: "p-14", productName: "House Red Wine", quantity: 3, price: 12.00 },
      { productId: "p-15", productName: "Mojito", quantity: 2, price: 10.00 },
      { productId: "p-8", productName: "Caesar Salad", quantity: 3, price: 9.00, notes: "Lactose intolerant - use dairy-free dressing" },
      { productId: "p-7", productName: "Bruschetta", quantity: 2, price: 7.00 },
      { productId: "p-12", productName: "Tiramisu", quantity: 2, price: 8.00, notes: "Eggless recipe please - no raw eggs" },
      { productId: "p-13", productName: "Chocolate Lava Cake", quantity: 2, price: 9.50, notes: "Warm, but not too hot" },
      { productId: "p-1", productName: "Espresso", quantity: 4, price: 3.50 },
      { productId: "p-2", productName: "Cappuccino", quantity: 3, price: 4.50, notes: "Oat milk, extra hot" },
    ],
    status: "acknowledged",
    total: 337.50,
    createdAt: minutesAgo(12),
    acknowledgedAt: minutesAgo(11),
  },
  {
    id: "ord-105",
    tableId: "t-2",
    tableName: "T2",
    items: [
      { productId: "p-16", productName: "Margarita", quantity: 3, price: 11.00, notes: "No salt on rim - customer preference" },
      { productId: "p-7", productName: "Bruschetta", quantity: 2, price: 7.00 },
      { productId: "p-10", productName: "Ribeye Steak", quantity: 1, price: 28.00, notes: "Well-done, extra sauce on the side" },
      { productId: "p-4", productName: "Fresh Orange Juice", quantity: 2, price: 4.00 },
    ],
    status: "acknowledged",
    total: 105.00,
    createdAt: minutesAgo(15),
    acknowledgedAt: minutesAgo(14),
  },
  // Served Orders
  {
    id: "ord-106",
    tableId: "t-6",
    tableName: "VIP-2",
    items: [
      { productId: "p-9", productName: "Grilled Salmon", quantity: 2, price: 22.00, notes: "Gluten-free preparation required" },
      { productId: "p-14", productName: "House Red Wine", quantity: 1, price: 12.00 },
      { productId: "p-12", productName: "Tiramisu", quantity: 2, price: 8.00, notes: "No alcohol in the tiramisu" },
    ],
    status: "served",
    total: 72.00,
    createdAt: minutesAgo(20),
    acknowledgedAt: minutesAgo(19),
  },
  {
    id: "ord-107",
    tableId: "t-8",
    tableName: "Patio-2",
    items: [
      { productId: "p-3", productName: "Latte", quantity: 4, price: 5.00, notes: "Almond milk, temperature not too hot" },
      { productId: "p-2", productName: "Cappuccino", quantity: 2, price: 4.50, notes: "Extra foam, medium hot" },
      { productId: "p-1", productName: "Espresso", quantity: 3, price: 3.50 },
      { productId: "p-4", productName: "Fresh Orange Juice", quantity: 2, price: 4.00, notes: "Freshly squeezed if available" },
      { productId: "p-6", productName: "Iced Lemonade", quantity: 1, price: 3.50 },
      { productId: "p-8", productName: "Caesar Salad", quantity: 2, price: 9.00, notes: "Light dressing, extra parmesan" },
      { productId: "p-7", productName: "Bruschetta", quantity: 3, price: 7.00 },
      { productId: "p-12", productName: "Tiramisu", quantity: 2, price: 8.00 },
      { productId: "p-13", productName: "Chocolate Lava Cake", quantity: 1, price: 9.50, notes: "Not too sweet, warm in the center" },
    ],
    status: "served",
    total: 120.00,
    createdAt: minutesAgo(25),
    acknowledgedAt: minutesAgo(24),
  },
  // Completed Orders
  {
    id: "ord-108",
    tableId: "t-1",
    tableName: "T1",
    items: [
      { productId: "p-1", productName: "Espresso", quantity: 2, price: 3.50, notes: "Double shot, no sugar" },
      { productId: "p-7", productName: "Bruschetta", quantity: 1, price: 7.00 },
    ],
    status: "completed",
    total: 14.00,
    createdAt: hoursAgo(1),
    acknowledgedAt: hoursAgo(0.95),
  },
  {
    id: "ord-109",
    tableId: "t-5",
    tableName: "VIP-1",
    items: [
      { productId: "p-10", productName: "Ribeye Steak", quantity: 2, price: 28.00, notes: "Both medium-rare, one with extra pepper" },
      { productId: "p-14", productName: "House Red Wine", quantity: 2, price: 12.00 },
      { productId: "p-8", productName: "Caesar Salad", quantity: 2, price: 9.00, notes: "Vegan dressing, hold the anchovies" },
      { productId: "p-12", productName: "Tiramisu", quantity: 2, price: 8.00, notes: "One with extra cocoa powder" },
    ],
    status: "completed",
    total: 114.00,
    createdAt: hoursAgo(2),
    acknowledgedAt: hoursAgo(1.95),
  },
  // Payment Done Orders
  {
    id: "ord-110",
    tableId: "t-3",
    tableName: "T3",
    items: [
      { productId: "p-11", productName: "Pasta Carbonara", quantity: 1, price: 16.00, notes: "No cheese on top, pasta al dente" },
      { productId: "p-15", productName: "Mojito", quantity: 2, price: 10.00, notes: "Less mint, more lime" },
    ],
    status: "payment_done",
    total: 36.00,
    createdAt: hoursAgo(0.5),
    acknowledgedAt: hoursAgo(0.45),
  },
  // Cancelled Order
  {
    id: "ord-111",
    tableId: "t-4",
    tableName: "T4",
    items: [
      { productId: "p-16", productName: "Margarita", quantity: 2, price: 11.00, notes: "Customer requested no tequila - changed to virgin" },
    ],
    status: "cancelled",
    total: 22.00,
    createdAt: hoursAgo(3),
  },
];

export const mockCancellationPolicy = `Order Cancellation Policy

1. Orders may only be cancelled before preparation begins.
2. Once your order status changes to "Preparing", cancellation is no longer possible.
3. Refunds for cancelled orders will be processed within 5-10 minutes.
4. Repeated cancellations may result in a temporary hold on future orders.
5. If you have any concerns about your order, please speak with your server before requesting cancellation.

By confirming the cancellation, you acknowledge and agree to the terms above.`;

export const mockReservations: Reservation[] = [
  {
    id: "res-1",
    tableId: "t-1",
    tableName: "T1",
    customerName: "James Anderson",
    guestCount: 2,
    startTime: hoursAgo(1),
    endTime: hoursFromNow(1),
    status: "active",
    notes: "Anniversary dinner",
  },
  {
    id: "res-2",
    tableId: "t-5",
    tableName: "VIP-1",
    customerName: "Sarah Mitchell",
    guestCount: 6,
    startTime: hoursAgo(0.5),
    endTime: hoursFromNow(2),
    status: "active",
    notes: "Business meeting - requires privacy",
  },
  {
    id: "res-3",
    tableId: "t-3",
    tableName: "T3",
    customerName: "David Chen",
    guestCount: 3,
    startTime: hoursAgo(0.25),
    endTime: hoursFromNow(1.5),
    status: "active",
  },
  {
    id: "res-4",
    tableId: "t-2",
    tableName: "T2",
    customerName: "Emily Roberts",
    guestCount: 2,
    startTime: hoursFromNow(2),
    endTime: hoursFromNow(4),
    status: "upcoming",
    notes: "Window seat preferred",
  },
  {
    id: "res-5",
    tableId: "t-4",
    tableName: "T4",
    customerName: "Michael Torres",
    guestCount: 5,
    startTime: hoursAgo(0.5),
    endTime: hoursFromNow(1.5),
    status: "active",
    notes: "Birthday celebration",
  },
  {
    id: "res-6",
    tableId: "t-6",
    tableName: "VIP-2",
    customerName: "Lisa Park",
    guestCount: 8,
    startTime: hoursFromNow(3),
    endTime: hoursFromNow(5),
    status: "upcoming",
  },
  {
    id: "res-7",
    tableId: "t-8",
    tableName: "Patio-2",
    customerName: "Robert Kim",
    guestCount: 4,
    startTime: hoursFromNow(1),
    endTime: hoursFromNow(3),
    status: "upcoming",
    notes: "Outdoor seating requested",
  },
  {
    id: "res-8",
    tableId: "t-1",
    tableName: "T1",
    customerName: "Anna White",
    guestCount: 2,
    startTime: hoursAgo(4),
    endTime: hoursAgo(2),
    status: "completed",
  },
];

// ============ Mock Membership Requests ============
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const mockMembershipRequests: MembershipRequestRecord[] = [
  {
    id: "mr-1",
    customerId: "cust-101",
    fullName: "Olivia Martinez",
    email: "olivia.martinez@email.com",
    phone: "+1 (555) 234-5678",
    additionalDetails: "Regular diner for 2 years. Interested in the VIP perks and wine-tasting events.",
    status: "pending",
    createdAt: daysAgo(1),
  },
  {
    id: "mr-2",
    customerId: "cust-102",
    fullName: "Daniel Kim",
    email: "daniel.kim@email.com",
    phone: "+1 (555) 345-6789",
    additionalDetails: "Referred by member Sarah Mitchell. Works nearby and visits weekly.",
    status: "pending",
    createdAt: daysAgo(2),
  },
  {
    id: "mr-3",
    customerId: "cust-103",
    fullName: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+1 (555) 456-7890",
    status: "active",
    createdAt: daysAgo(14),
    reviewedAt: daysAgo(12),
  },
  {
    id: "mr-4",
    customerId: "cust-104",
    fullName: "James O'Brien",
    email: "james.obrien@email.com",
    phone: "+1 (555) 567-8901",
    additionalDetails: "Corporate account for team lunches.",
    status: "active",
    createdAt: daysAgo(30),
    reviewedAt: daysAgo(28),
  },
  {
    id: "mr-5",
    customerId: "cust-105",
    fullName: "Sophie Laurent",
    email: "sophie.laurent@email.com",
    phone: "+1 (555) 678-9012",
    additionalDetails: "Tourist, visiting for only one month.",
    status: "rejected",
    createdAt: daysAgo(7),
    reviewedAt: daysAgo(5),
  },
  {
    id: "mr-6",
    customerId: "cust-106",
    fullName: "Marcus Johnson",
    email: "marcus.johnson@email.com",
    phone: "+1 (555) 789-0123",
    additionalDetails: "Food blogger with 50k followers. Would love to feature the restaurant.",
    status: "pending",
    createdAt: daysAgo(0),
  },
];

// ============ Mock Menu Modules ============

export const mockSubMenus: SubMenu[] = [
  {
    id: "submenu-1",
    name: "Hot Beverages",
    description: "Warm drinks and coffee",
    categoryIds: ["cat-5"],
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "submenu-2",
    name: "Cold Beverages",
    description: "Refreshing cold drinks",
    categoryIds: ["cat-6"],
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "submenu-3",
    name: "Main Dishes",
    description: "Entrees and main courses",
    categoryIds: ["cat-7", "cat-8"],
    displayOrder: 3,
    isActive: true,
  },
  {
    id: "submenu-4",
    name: "Desserts & Sweets",
    description: "Sweet treats",
    categoryIds: ["cat-9"],
    displayOrder: 4,
    isActive: true,
  },
];

export const mockMenuSets: MenuSet[] = [
  {
    id: "mset-1",
    name: "Breakfast Menu",
    description: "Morning specialties",
    type: "breakfast",
    productIds: ["p-1", "p-2", "p-3"],
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "mset-2",
    name: "Lunch Menu",
    description: "Midday selections",
    type: "lunch",
    productIds: ["p-8", "p-9", "p-10"],
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "mset-3",
    name: "Dinner Menu",
    description: "Evening specialties",
    type: "dinner",
    productIds: ["p-10", "p-11", "p-12"],
    displayOrder: 3,
    isActive: true,
  },
  {
    id: "mset-4",
    name: "Weekend Special",
    description: "Limited time offers",
    type: "special",
    productIds: ["p-7", "p-14", "p-15"],
    displayOrder: 4,
    isActive: true,
  },
];

export const mockAddOns: AddOn[] = [
  {
    id: "addon-1",
    name: "Extra Shot",
    description: "Additional espresso shot",
    price: 0.75,
    category: "custom",
    isAvailable: true,
  },
  {
    id: "addon-2",
    name: "Vanilla Syrup",
    description: "Vanilla flavoring",
    price: 0.50,
    category: "sauce",
    isAvailable: true,
  },
  {
    id: "addon-3",
    name: "Whipped Cream",
    description: "Topped with whipped cream",
    price: 0.75,
    category: "topping",
    isAvailable: true,
  },
  {
    id: "addon-4",
    name: "French Fries",
    description: "Crispy side of fries",
    price: 3.00,
    category: "side",
    isAvailable: true,
  },
  {
    id: "addon-5",
    name: "Iced Tea",
    description: "Cold iced tea",
    price: 2.50,
    category: "drink",
    isAvailable: true,
  },
  {
    id: "addon-6",
    name: "Chocolate Cake",
    description: "Rich chocolate cake slice",
    price: 5.00,
    category: "dessert",
    isAvailable: true,
  },
];

export const mockComboOffers: ComboOffer[] = [
  {
    id: "combo-1",
    name: "Classic Breakfast Combo",
    description: "Includes coffee and pastry",
    basePrice: 12.00,
    discountPrice: 9.99,
    productIds: ["p-1", "p-3"],
    addOnIds: ["addon-1"],
    quantity: 2,
    isActive: true,
    displayOrder: 1,
  },
  {
    id: "combo-2",
    name: "Lunch Plate Special",
    description: "Main dish with salad and drink",
    basePrice: 20.00,
    discountPrice: 15.99,
    productIds: ["p-8", "p-9"],
    addOnIds: ["addon-4", "addon-5"],
    quantity: 4,
    isActive: true,
    displayOrder: 2,
  },
  {
    id: "combo-3",
    name: "Dinner for Two",
    description: "Two main courses with dessert",
    basePrice: 55.00,
    discountPrice: 44.99,
    productIds: ["p-10", "p-11"],
    addOnIds: ["addon-6"],
    quantity: 3,
    isActive: true,
    displayOrder: 3,
  },
  {
    id: "combo-4",
    name: "Happy Hour Bundle",
    description: "Appetizers and drink combo",
    basePrice: 25.00,
    discountPrice: 18.99,
    productIds: ["p-7", "p-14"],
    addOnIds: ["addon-5"],
    quantity: 3,
    isActive: true,
    displayOrder: 4,
  },
];


// ============ Customer Management (Admin) ============

import type { CustomerAttribute, CustomerProfile } from "@/types";

export const mockCustomerAttributes: CustomerAttribute[] = [
  {
    id: "attr-vip",
    name: "VIP",
    description: "High priority customer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "attr-smoking",
    name: "Smoking",
    description: "Customer prefers smoking area",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "attr-no-smoking",
    name: "No Smoking",
    description: "Customer prefers non-smoking area",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "attr-owners-friend",
    name: "Owner's Friend",
    description: "Special handling required",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "attr-seat-reservation",
    name: "Seat Reservation",
    description: "Usually makes reservations in advance",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockCustomersAdmin: CustomerProfile[] = [
  {
    id: "cust-1001",
    fullName: "Sujan Maharjan",
    telephone: "9841-000-111",
    email: "sujan@example.com",
    gender: "male",
    birthday: "1994-07-12",
    homeAddress: "Bhaktapur, Nepal",
    companyName: "Infotraid Technology",
    department: "Engineering",
    jobTitle: "Software Engineer",
    workAddress: "Kathmandu, Nepal",
    allergy: "Peanuts",
    favoriteThings: "Spicy momo, black coffee",
    whatIHate: "Too much noise",
    remarks: "Prefers window seats",
    attributeIds: ["attr-vip", "attr-seat-reservation"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cust-1002",
    fullName: "Anusha Shrestha",
    telephone: "9800-222-333",
    email: "anusha@example.com",
    gender: "female",
    birthday: "1997-02-21",
    homeAddress: "Lalitpur, Nepal",
    companyName: "Blue Ocean Recruitment",
    department: "HR",
    jobTitle: "Recruiter",
    workAddress: "Kathmandu, Nepal",
    allergy: "",
    favoriteThings: "Cheesecake",
    whatIHate: "Overcooked pasta",
    remarks: "",
    attributeIds: ["attr-no-smoking"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
