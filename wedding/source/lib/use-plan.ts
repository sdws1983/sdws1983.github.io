import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Plan, mergeChanges, planSchema } from './plan';
import { freshPlan, persistPlan, readPlan, STORAGE_KEY } from './storage';

type Status = 'loading' | 'saved' | 'dirty' | 'saving' | 'error';
export function usePlan() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [status, setStatus] = useState<Status>('loading'), [error, setError] = useState('');
  const ref = useRef<Plan | null>(null), base = useRef<Plan | null>(null), pending = useRef(false);
  const fail = useCallback((message: string) => {
    setStatus('error'); setError(message); pending.current = !!ref.current;
  }, []);
  const flush = useCallback(async () => {
    if (!ref.current) return;
    setStatus('saving');
    try {
      const saved = persistPlan(window.localStorage, ref.current, base.current);
      ref.current = saved; base.current = saved; pending.current = false;
      setPlan(saved); setStatus('saved'); setError('');
    } catch {
      fail('无法保存到当前浏览器。修改仍在页面中，请先导出备份，再检查浏览器的存储权限或可用空间。');
    }
  }, [fail]);
  const load = useCallback(async () => {
    setStatus('loading'); setError('');
    let saved: Plan | null;
    try { saved = readPlan(window.localStorage); }
    catch (e) {
      if (e instanceof Error && !(e instanceof DOMException)) {
        fail('浏览器中的计划无法读取。请下载原始数据留存，或导入有效备份恢复。');
        return;
      }
      const draft = ref.current || freshPlan();
      ref.current = draft; setPlan(draft);
      fail('浏览器未允许本地存储。可以继续编辑，离开前请导出备份。');
      return;
    }
    const next = saved || freshPlan();
    ref.current = next; base.current = saved; pending.current = !saved;
    setPlan(next);
    if (saved) { setStatus('saved'); pending.current = false; }
    else await flush();
  }, [fail, flush]);
  const mutate = useCallback((fn: (p: Plan) => Plan) => {
    if (!ref.current) return;
    const result = planSchema.safeParse(fn(ref.current));
    if (!result.success) { toast.error(result.error.issues[0]?.message || '请检查输入内容。'); return; }
    ref.current = result.data; pending.current = true; setPlan(result.data); setStatus('dirty');
    void flush();
  }, [flush]);
  const importPlan = useCallback((candidate: Plan) => {
    const next = planSchema.parse(candidate);
    // Import is an explicit replacement, not a merge with an older plan.
    ref.current = next; setPlan(next); pending.current = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      base.current = next; pending.current = false; setStatus('saved'); setError(''); return true;
    } catch {
      fail('备份已载入页面，但浏览器未能保存。请保留备份文件并检查存储权限。'); return false;
    }
  }, [fail]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const stop = (e: BeforeUnloadEvent) => { if (pending.current) { e.preventDefault(); e.returnValue = ''; } };
    const sync = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY && e.key !== null) return;
      try {
        const remote = readPlan(window.localStorage);
        if (!remote) { fail('另一个窗口清除了保存的数据。当前内容仍在页面中，请导出备份或重新保存。'); return; }
        if (JSON.stringify(remote) === JSON.stringify(base.current)) return;
        const next = pending.current && ref.current ? planSchema.parse(mergeChanges(base.current, ref.current, remote)) : remote;
        base.current = remote; ref.current = next; setPlan(next);
        if (pending.current) void flush(); else { setStatus('saved'); setError(''); }
        toast.info('已读取另一窗口的更新，请核对刚修改的内容。');
      } catch { fail('另一窗口的保存内容无法读取。当前计划仍在页面中，请先导出备份。'); }
    };
    window.addEventListener('beforeunload', stop); window.addEventListener('storage', sync);
    return () => { window.removeEventListener('beforeunload', stop); window.removeEventListener('storage', sync); };
  }, [fail, flush]);
  const getSaved = useCallback(() => !!ref.current && !pending.current, []);
  return { plan, ref, status, error, load, mutate, flush, getSaved, importPlan };
}
