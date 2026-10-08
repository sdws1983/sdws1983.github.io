import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshPlan, parseBackup, persistPlan, readPlan, serializeBackup, STORAGE_KEY } from '../lib/storage';
import { addDays, budgetTotals, taskDate, taskTotals, timeAt } from '../lib/plan';

class MemoryStorage {
  value: string | null = null;
  getItem(key: string) { assert.equal(key, STORAGE_KEY); return this.value; }
  setItem(key: string, value: string) { assert.equal(key, STORAGE_KEY); this.value = value; }
}
test('a saved plan survives a fresh read, including completed tasks and entered settings', () => {
  const storage = new MemoryStorage(), p = freshPlan();
  p.settings.date = '2026-12-08'; p.settings.budget = 100000; p.tasks[0].status = '已完成';
  persistPlan(storage, p, null);
  assert.deepEqual(readPlan(storage), p);
  assert.equal(freshPlan().settings.date, '');
});
test('export and import preserve all collections; invalid backups are rejected', () => {
  const p = freshPlan(); p.tasks[0].owner = '测试负责人';
  assert.deepEqual(parseBackup(serializeBackup(p)), p);
  assert.deepEqual(parseBackup(JSON.stringify(p)), p);
  assert.throws(() => parseBackup('{broken'));
  assert.throws(() => parseBackup(JSON.stringify({ app: 'wedding-countdown', version: 2, plan: p })));
  p.settings.date = '2026-02-30';
  assert.throws(() => parseBackup(JSON.stringify(p)));
});
test('separate tabs preserve independent updates and a removed record', () => {
  const storage = new MemoryStorage(), base = freshPlan();
  persistPlan(storage, base, null);
  const remote = structuredClone(base), local = structuredClone(base);
  remote.tasks[0].status = '已完成'; remote.items.pop();
  local.settings.city = '测试城市'; local.tasks[1].owner = '负责人';
  persistPlan(storage, remote, base);
  const merged = persistPlan(storage, local, base);
  assert.equal(merged.tasks[0].status, '已完成');
  assert.equal(merged.tasks[1].owner, '负责人');
  assert.equal(merged.settings.city, '测试城市');
  assert.equal(merged.items.length, base.items.length - 1);
});
test('corrupt stored data and storage failures never erase a previous plan', () => {
  const storage = new MemoryStorage(); storage.value = '{bad';
  assert.throws(() => persistPlan(storage, freshPlan(), null));
  assert.equal(storage.value, '{bad');
  const p = freshPlan(); storage.value = JSON.stringify(p);
  const old = storage.value;
  const blocked = { getItem: storage.getItem.bind(storage), setItem: () => { throw new DOMException('Full', 'QuotaExceededError'); } };
  p.settings.city = '尚未保存';
  assert.throws(() => persistPlan(blocked, p, freshPlan()));
  assert.equal(storage.value, old);
});
test('wedding-relative dates, midnight flow times, progress and budget exclusions remain correct', () => {
  const p = freshPlan();
  assert.equal(addDays('2026-12-08', -60), '2026-10-09');
  assert.equal(taskDate({ ...p.tasks[0], offset: -60 }, '2026-12-08'), '2026-10-09');
  assert.equal(timeAt('00:30', -60), '前日 23:30');
  p.tasks[0].status = '已完成'; p.tasks[1].status = '不适用';
  assert.equal(taskTotals(p).total, p.tasks.length - 1);
  assert.equal(taskTotals(p).done, 1);
  p.settings.budget = 10000;
  p.budget[0] = { ...p.budget[0], include: '计入', agreed: 3000, paid: 1000 };
  p.budget[1] = { ...p.budget[1], include: '不计入', agreed: 5000, paid: 2000 };
  const totals = budgetTotals(p);
  assert.equal(totals.agreed, 3000); assert.equal(totals.paid, 1000); assert.equal(totals.remaining, 2000);
  assert.equal(totals.reserve, 1000); assert.equal(totals.available, 9000);
});
