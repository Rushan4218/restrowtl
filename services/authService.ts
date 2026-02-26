import type { Customer, MembershipRequest } from "@/types";
import { simulateDelay, generateId } from "./api";
import { createMembershipRequest } from "./membershipService";

const STORAGE_KEY = "restrohub_customers";
const SESSION_KEY = "restrohub_session";

function getStoredCustomers(): (Customer & { password?: string })[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCustomers(customers: (Customer & { password?: string })[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

function setSession(customer: Customer) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(customer));
}

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export async function signUp(
  data: MembershipRequest
): Promise<Customer> {
  await simulateDelay();
  const customers = getStoredCustomers();
  const exists = customers.find((c) => c.email === data.email);
  if (exists) throw new Error("An account with this email already exists.");

  const newCustomer: Customer & { password: string } = {
    id: generateId("cust"),
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    provider: "email",
    createdAt: new Date().toISOString(),
    orderIds: [],
    password: data.password,
    membershipStatus: "pending",
    role: "customer",
  };
  customers.push(newCustomer);
  saveCustomers(customers);

  // Create a membership request record for admin approval
  await createMembershipRequest(
    newCustomer.id,
    newCustomer.fullName,
    newCustomer.email,
    newCustomer.phone,
    data.additionalDetails
  );

  const { password: _, ...safeCustomer } = newCustomer;
  void _;
  setSession(safeCustomer);
  return safeCustomer;
}

export async function login(
  email: string,
  password: string
): Promise<Customer> {
  await simulateDelay();
  const customers = getStoredCustomers();
  const found = customers.find(
    (c) => c.email === email && c.password === password
  );
  if (!found) throw new Error("Invalid email or password.");

  const { password: _, ...safeCustomer } = found;
  void _;
  setSession(safeCustomer);
  return safeCustomer;
}

export async function loginWithGoogle(): Promise<Customer> {
  await simulateDelay(800);
  const customers = getStoredCustomers();
  const mockEmail = "demo.user@gmail.com";
  let existing = customers.find((c) => c.email === mockEmail);

  if (!existing) {
    existing = {
      id: generateId("cust"),
      fullName: "Demo Google User",
      email: mockEmail,
      phone: "",
      provider: "google",
      avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=DG`,
      createdAt: new Date().toISOString(),
      orderIds: [],
      membershipStatus: "pending",
      role: "customer",
    };
    customers.push(existing);
    saveCustomers(customers);

    await createMembershipRequest(
      existing.id,
      existing.fullName,
      existing.email,
      existing.phone
    );
  }

  const { password: _, ...safeCustomer } = existing as Customer & { password?: string };
  void _;
  setSession(safeCustomer);
  return safeCustomer;
}

export async function loginWithFacebook(): Promise<Customer> {
  await simulateDelay(800);
  const customers = getStoredCustomers();
  const mockEmail = "demo.user@facebook.com";
  let existing = customers.find((c) => c.email === mockEmail);

  if (!existing) {
    existing = {
      id: generateId("cust"),
      fullName: "Demo Facebook User",
      email: mockEmail,
      phone: "",
      provider: "facebook",
      avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=DF`,
      createdAt: new Date().toISOString(),
      orderIds: [],
      membershipStatus: "pending",
      role: "customer",
    };
    customers.push(existing);
    saveCustomers(customers);

    await createMembershipRequest(
      existing.id,
      existing.fullName,
      existing.email,
      existing.phone
    );
  }

  const { password: _, ...safeCustomer } = existing as Customer & { password?: string };
  void _;
  setSession(safeCustomer);
  return safeCustomer;
}

export async function logout(): Promise<void> {
  await simulateDelay(100);
  clearSession();
}

export function getCurrentUser(): Customer | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Re-sync session from the customers store.
 * Useful when admin updates membership status externally.
 */
export function refreshSessionFromStore(): void {
  const session = getCurrentUser();
  if (!session) return;
  const customers = getStoredCustomers();
  const found = customers.find((c) => c.id === session.id);
  if (found) {
    const { password: _, ...safeCustomer } = found;
    void _;
    setSession(safeCustomer);
  }
}

export async function updateProfile(
  customerId: string,
  data: Partial<Pick<Customer, "fullName" | "phone">>
): Promise<Customer> {
  await simulateDelay();
  const customers = getStoredCustomers();
  const index = customers.findIndex((c) => c.id === customerId);
  if (index === -1) throw new Error("Customer not found.");

  customers[index] = { ...customers[index], ...data };
  saveCustomers(customers);

  const { password: _, ...safeCustomer } = customers[index];
  void _;
  setSession(safeCustomer);
  return safeCustomer;
}

export async function updateCustomerMembership(
  customerId: string,
  membershipStatus: Customer["membershipStatus"],
  role: Customer["role"]
): Promise<Customer> {
  await simulateDelay(100);
  const customers = getStoredCustomers();
  const index = customers.findIndex((c) => c.id === customerId);
  if (index === -1) throw new Error("Customer not found.");

  customers[index] = { ...customers[index], membershipStatus, role };
  saveCustomers(customers);

  const { password: _, ...safeCustomer } = customers[index];
  void _;

  // Also update session if this is the current user
  const session = getCurrentUser();
  if (session && session.id === customerId) {
    setSession(safeCustomer);
  }

  return safeCustomer;
}

export async function linkOrderToCustomer(
  customerId: string,
  orderId: string
): Promise<void> {
  const customers = getStoredCustomers();
  const index = customers.findIndex((c) => c.id === customerId);
  if (index === -1) return;

  if (!customers[index].orderIds.includes(orderId)) {
    customers[index].orderIds.push(orderId);
    saveCustomers(customers);
  }
}
