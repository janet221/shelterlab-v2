"use client";
let scope = "";
export function setLearningStorageScope(accountId: string) { scope = `shelterlab-classroom:${accountId}:`; }
export function clearLearningDrafts() {
  if (!scope) return;
  for (let i = localStorage.length - 1; i >= 0; i--) { const key = localStorage.key(i); if (key?.startsWith(scope)) localStorage.removeItem(key); }
}
export const learningStorage = {
  getItem(key: string) { return scope ? localStorage.getItem(scope + key) : null; },
  setItem(key: string, value: string) { if (scope) localStorage.setItem(scope + key, value); },
  removeItem(key: string) { if (scope) localStorage.removeItem(scope + key); }
};
