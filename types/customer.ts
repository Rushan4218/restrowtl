export type Gender = "male" | "female" | "other" | "prefer_not_say";

export interface CustomerProfile {
  id: string;
  fullName: string;
  telephone: string;
  email: string;
  gender?: Gender;
  birthday?: string; // ISO date (YYYY-MM-DD)
  homeAddress?: string;

  companyName?: string;
  department?: string;
  jobTitle?: string;
  workAddress?: string;

  allergy?: string;
  favoriteThings?: string;
  whatIHate?: string;
  remarks?: string;

  attributeIds: string[];

  createdAt: string;
  updatedAt: string;
}

export type CustomerCreateInput = Omit<CustomerProfile, "id" | "createdAt" | "updatedAt">;
export type CustomerUpdateInput = Partial<Omit<CustomerProfile, "id" | "createdAt" | "updatedAt">>;
