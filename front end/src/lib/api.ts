import { mockFetch, MOCK_ENABLED } from "@/src/lib/mockData";

async function smartFetch(url: string, options?: RequestInit): Promise<any> {
  // 1. Try mock layer first (instant, no network)
  if (MOCK_ENABLED) {
    const mockResult = await mockFetch(url, options);
    if (mockResult !== undefined) return mockResult;
  }

  // 2. Fall through to real backend
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API Error ${res.status}`);
  return res.json();
}

export const api = {
  get: (url: string) =>
    smartFetch(url, { method: "GET" }),

  post: (url: string, data: any) =>
    smartFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  put: (url: string, data: any) =>
    smartFetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  delete: (url: string) =>
    smartFetch(url, { method: "DELETE" }),
};
