import type { BellRequest, BellRequestStatus } from "@/types";
import { simulateDelay, generateId } from "./api";

const STORAGE_KEY = "restrohub_bell_requests";

function getStoredRequests(): BellRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch {
    return [];
  }
}

function saveRequests(requests: BellRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export async function createBellRequest(
  tableId: string,
  tableName: string,
  reason: string
): Promise<BellRequest> {
  await simulateDelay();
  const requests = getStoredRequests();
  
  const request: BellRequest = {
    id: generateId("bell"),
    tableId,
    tableName,
    reason,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  
  requests.push(request);
  saveRequests(requests);
  return request;
}

export async function getBellRequests(): Promise<BellRequest[]> {
  await simulateDelay();
  return getStoredRequests().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getPendingBellRequests(): Promise<BellRequest[]> {
  await simulateDelay();
  return getStoredRequests()
    .filter((r) => r.status === "pending")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function resolveBellRequest(requestId: string): Promise<BellRequest> {
  await simulateDelay();
  const requests = getStoredRequests();
  const index = requests.findIndex((r) => r.id === requestId);
  if (index === -1) throw new Error("Bell request not found.");
  
  requests[index] = {
    ...requests[index],
    status: "resolved",
    resolvedAt: new Date().toISOString(),
  };
  saveRequests(requests);
  return requests[index];
}
