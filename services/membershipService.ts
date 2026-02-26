import type { MembershipRequestRecord, MembershipStatus } from "@/types";
import { simulateDelay, generateId } from "./api";
import { mockMembershipRequests } from "@/lib/mock-data";

const STORAGE_KEY = "restrohub_membership_requests";

function getStoredRequests(): MembershipRequestRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Seed with mock data on first load
    saveRequests(mockMembershipRequests);
    return [...mockMembershipRequests];
  } catch {
    return [];
  }
}

function saveRequests(requests: MembershipRequestRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export async function createMembershipRequest(
  customerId: string,
  fullName: string,
  email: string,
  phone: string,
  additionalDetails?: string
): Promise<MembershipRequestRecord> {
  await simulateDelay();
  const requests = getStoredRequests();

  // Check if there's already a pending request for this customer
  const existing = requests.find(
    (r) => r.customerId === customerId && r.status === "pending"
  );
  if (existing) {
    throw new Error("You already have a pending membership request.");
  }

  const request: MembershipRequestRecord = {
    id: generateId("mr"),
    customerId,
    fullName,
    email,
    phone,
    additionalDetails,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  requests.push(request);
  saveRequests(requests);
  return request;
}

export async function getMembershipRequests(): Promise<MembershipRequestRecord[]> {
  await simulateDelay();
  return getStoredRequests();
}

export async function getPendingMembershipRequests(): Promise<MembershipRequestRecord[]> {
  await simulateDelay();
  return getStoredRequests().filter((r) => r.status === "pending");
}

export async function updateMembershipRequestStatus(
  requestId: string,
  status: MembershipStatus
): Promise<MembershipRequestRecord> {
  await simulateDelay();
  const requests = getStoredRequests();
  const index = requests.findIndex((r) => r.id === requestId);
  if (index === -1) throw new Error("Membership request not found.");

  requests[index] = {
    ...requests[index],
    status,
    reviewedAt: new Date().toISOString(),
  };
  saveRequests(requests);
  return requests[index];
}

export async function getMembershipRequestByCustomerId(
  customerId: string
): Promise<MembershipRequestRecord | undefined> {
  await simulateDelay(100);
  const requests = getStoredRequests();
  // Return the most recent request for this customer
  return requests
    .filter((r) => r.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}
