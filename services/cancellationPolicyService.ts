import { mockCancellationPolicy } from "@/lib/mock-data";
import { simulateDelay } from "./api";

let policyText = mockCancellationPolicy;

export async function getCancellationPolicy(): Promise<string> {
  await simulateDelay();
  return policyText;
}

export async function updateCancellationPolicy(
  text: string
): Promise<string> {
  await simulateDelay();
  policyText = text;
  return policyText;
}
