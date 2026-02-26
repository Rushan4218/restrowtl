
export type MembershipRequestStatus = "PENDING" | "APPROVED" | "DECLINED";

export interface MembershipRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  requestedAt: string;
  status: MembershipRequestStatus;
}

const STORAGE_KEY = "admin_membership_requests";

const seedData: MembershipRequest[] = [
  {
    id: "1",
    fullName: "John Doe",
    email: "john@example.com",
    phone: "9800000000",
    requestedAt: new Date().toISOString(),
    status: "PENDING",
  },
];

function getStorage(): MembershipRequest[] {
  if (typeof window === "undefined") return seedData;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return seedData;
  }
  return JSON.parse(raw);
}

function saveStorage(data: MembershipRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const adminMembershipRequestService = {
  getAll(): MembershipRequest[] {
    return getStorage();
  },

  updateStatus(id: string, status: MembershipRequestStatus) {
    const data = getStorage();
    const updated = data.map((req) =>
      req.id === id ? { ...req, status } : req
    );
    saveStorage(updated);
    return updated;
  },
};
