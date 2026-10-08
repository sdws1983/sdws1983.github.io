import { useEffect, useRef, useState } from 'react';
import { Download, Upload, HardDrive, CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plan, todayInChina } from '@/lib/plan';
import { MAX_BACKUP_BYTES, parseBackup, saveFile, serializeBackup, STORAGE_KEY } from '@/lib/storage';

export function BackupDialog({ open, onOpenChange, plan, onImport }: {
  open: boolean; onOpenChange: (value: boolean) => void; plan: Plan | null; onImport: (next: Plan) => boolean;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [candidate, setCandidate] = useState<Plan | null>(null), [filename, setFilename] = useState(''), [error, setError] = useState('');
  useEffect(() => { if (!open) { setCandidate(null); setFilename(''); setError(''); } }, [open]);
  const download = () => {
    try {
      if (plan) saveFile(serializeBackup(plan), `备婚计划-${todayInChina()}.json`);
      else {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) throw new Error('浏览器中没有可下载的数据。');
        saveFile(raw, `备婚原始数据-${todayInChina()}.json`);
      }
      toast.success(plan ? '备份文件已准备下载。请妥善保存。' : '原始数据已准备下载。');
    } catch (e) { setError(e instanceof Error ? e.message : '无法导出，请重试。'); }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="backup-dialog"><DialogHeader>
    <DialogTitle>备份与恢复</DialogTitle>
    <DialogDescription>进度保存在当前设备的这个浏览器中。换设备或清理浏览器前，请先导出备份。</DialogDescription>
  </DialogHeader>
    <div className="backup-info"><HardDrive size={22}/><p>不自动跨设备同步。你可以把备份文件传到另一台设备，再打开本网页导入。</p></div>
    <section className="backup-section"><h3>保存一份备份</h3><p>包含婚礼信息、全部任务、预算、宾客、服务商、流程和物品。{!plan && '当前无法读取计划，可先下载原始数据留存。'}</p><Button variant="outline" onClick={download}><Download size={17}/>{plan ? '导出备份' : '下载原始数据'}</Button></section>
    <section className="backup-section"><h3>从备份恢复</h3><p>选择本网页导出的 JSON 文件。先核对内容，再替换当前计划；建议先导出当前进度。</p>
      <input ref={file} type="file" accept=".json,application/json" aria-label="选择备婚备份文件" hidden onChange={async e => {
        const selected = e.target.files?.[0]; e.target.value = ''; setCandidate(null); setError('');
        if (!selected) return;
        if (selected.size > MAX_BACKUP_BYTES) { setError('文件超过 10 MB，请选择有效备份。'); return; }
        try { const next = parseBackup(await selected.text()); setCandidate(next); setFilename(selected.name); }
        catch (err) { setError(err instanceof Error ? err.message : '备份读取失败，请重试。'); }
      }}/>
      <Button variant="outline" onClick={() => file.current?.click()}><Upload size={17}/>选择备份文件</Button>
      {candidate && <div className="backup-preview"><strong>{filename}</strong><p>婚期：{candidate.settings.date || '未填写'} · 任务 {candidate.tasks.length} 项 · 宾客 {candidate.guests.length} 组</p><p>确认后，这份备份将替换当前浏览器中的全部计划。</p><Button onClick={() => {
        const saved = onImport(candidate);
        if (saved) toast.success('备份已恢复，并保存到当前浏览器。');
        else toast.warning('备份已载入，但尚未保存到浏览器。请保留备份文件。');
        onOpenChange(false);
      }}>确认替换当前计划</Button></div>}
    </section>
    {error && <p className="backup-error" role="alert"><CircleAlert size={17}/>{error}</p>}
    <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>关闭</Button></DialogFooter>
  </DialogContent></Dialog>;
}
