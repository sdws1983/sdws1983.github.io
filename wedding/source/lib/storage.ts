import { Plan, initialPlan, mergeChanges, planSchema } from './plan';

export const STORAGE_KEY = 'wedding-countdown:plan:v1';
export const BACKUP_APP = 'wedding-countdown';
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
export function parseBackup(raw: string): Plan {
  let value: unknown;
  try { value = JSON.parse(raw); }
  catch { throw new Error('文件不是有效的 JSON 备份。'); }
  if (value && typeof value === 'object' && 'app' in value) {
    const backup = value as { app: unknown; version?: unknown; plan?: unknown };
    if (backup.app !== BACKUP_APP || backup.version !== 1) throw new Error('备份来源或版本不受支持。');
    value = backup.plan;
  }
  const parsed = planSchema.safeParse(value);
  if (!parsed.success) throw new Error('备份内容不完整或有无效数据：' + (parsed.error.issues[0]?.message || '请检查文件。'));
  return parsed.data;
}
export function serializeBackup(plan: Plan): string {
  return JSON.stringify({ app: BACKUP_APP, version: 1, exportedAt: new Date().toISOString(), plan: planSchema.parse(plan) }, null, 2);
}
export function readPlan(storage: Pick<Storage, 'getItem'>): Plan | null {
  const raw = storage.getItem(STORAGE_KEY);
  return raw === null ? null : parseBackup(raw);
}
export function persistPlan(storage: Pick<Storage, 'getItem' | 'setItem'>, current: Plan, base: Plan | null): Plan {
  // Read immediately before writing to merge changes from another tab.
  // Invalid stored data throws instead of being silently replaced by defaults.
  const remote = readPlan(storage);
  const merged = base && remote ? planSchema.parse(mergeChanges(base, current, remote)) : planSchema.parse(current);
  storage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}
export function freshPlan(): Plan { return structuredClone(initialPlan); }
export function saveFile(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
