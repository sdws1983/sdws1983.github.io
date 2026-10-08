import { z } from 'zod';
import defaults from './defaults.json';
const text = z.string().max(2000), short = z.string().max(160), id = z.string().min(1).max(100);
const amount = z.number().finite().min(0).max(1e10).nullable(), count = z.number().int().min(0).max(100000).nullable();
const date = z.string().refine(v => v === '' || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v+'T00:00:00Z')) && new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v), '请输入有效日期');
export const taskStatuses = ['未开始','进行中','待决定','受阻','已完成','不适用'] as const;
export const phases = ['第1阶段','第2阶段','第3阶段','第4阶段','第5阶段','第6阶段','第7阶段','第8阶段','婚礼当天','婚后'] as const;
export const guestStatuses = ['待询问','已邀请','待确认','确认出席','不出席'] as const;
export const itemStatuses = ['待确认','待采购','已订未到','已到货','已打包','已交接','不需要'] as const;
export const taskSchema = z.object({id,phase:z.enum(phases),title:short.min(1),priority:z.enum(['P0','P1','P2']),role:short,owner:short,offset:z.number().int().min(-1000).max(1000),dueOverride:date,status:z.enum(taskStatuses),deliverable:text,depends:short,notes:text}).strict();
export const budgetSchema = z.object({id,title:short.min(1),include:z.enum(['待定','计入','不计入']),estimated:amount,agreed:amount,paid:amount,nextDate:date,owner:short,notes:text}).strict();
export const guestSchema = z.object({id,name:short.min(1),side:z.enum(['新人A','新人B','共同']),contact:short,status:z.enum(guestStatuses),people:count,children:count,city:short,lodging:count,arrival:short,departure:short,diet:text,table:short,owner:short,notes:text}).strict().refine(g=>g.people===null||((g.children??0)<=g.people&&(g.lodging??0)<=g.people),'儿童和住宿人数不能大于该组总人数');
export const vendorSchema = z.object({id,service:short.min(1),company:short,contact:short,phone:short,status:z.enum(['待联系','已报价','待决定','已确认','不需要']),arrival:text,scope:text,payment:text,contract:text,changes:text,deadline:date,notes:text}).strict();
export const flowSchema = z.object({id,title:short.min(1),offset:z.number().int().min(-1440).max(1440),duration:z.number().int().min(1).max(1440),owner:short,location:text,items:text,backup:text}).strict();
export const itemSchema = z.object({id,group:short.min(1),title:short.min(1),condition:short,quantity:count,status:z.enum(itemStatuses),keeper:short,recipient:short,handover:short,notes:text}).strict();
export const settingsSchema = z.object({date,city:short,nameA:short,nameB:short,budget:amount,reservePercent:z.number().min(0).max(50),currency:z.string().min(1).max(20),expectedGuests:count,format:short,meal:z.enum(['待定','午宴','晚宴','其他']),coordinator:short,priorities:text,omit:text,budgetScope:text,ceremonyTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)}).strict();
export const planSchema = z.object({settings:settingsSchema,tasks:z.array(taskSchema).max(500),budget:z.array(budgetSchema).max(200),guests:z.array(guestSchema).max(1000),vendors:z.array(vendorSchema).max(100),flows:z.array(flowSchema).max(100),items:z.array(itemSchema).max(500)}).strict().superRefine((p,ctx)=>{
  for(const k of ['tasks','budget','guests','vendors','flows','items'] as const)if(new Set(p[k].map(x=>x.id)).size!==p[k].length)ctx.addIssue({code:z.ZodIssueCode.custom,path:[k],message:'记录编号重复'});
});
export type Plan=z.infer<typeof planSchema>;
export type Task=Plan['tasks'][number];
export type Guest=Plan['guests'][number];
export type Budget=Plan['budget'][number];
export type Vendor=Plan['vendors'][number];
export type Flow=Plan['flows'][number];
export type Item=Plan['items'][number];
export const initialPlan:Plan=planSchema.parse(defaults);
export function todayInChina(){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const get=(t:string)=>parts.find(p=>p.type===t)?.value;return `${get('year')}-${get('month')}-${get('day')}`;}
export function addDays(date:string,offset:number){if(!date)return '';return new Date(Date.parse(date+'T00:00:00Z')+offset*86400000).toISOString().slice(0,10);}
export function daysBetween(date:string,today:string){return Math.round((Date.parse(date+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);}
export function taskDate(task:Task,date:string){return task.dueOverride||addDays(date,task.offset);}
export function shortDate(date:string){if(!date)return '婚期未定';const [,m,d]=date.split('-');return `${Number(m)}月${Number(d)}日`;}
export function timeAt(time:string,offset:number){const [h,m]=time.split(':').map(Number),total=h*60+m+offset,shift=Math.floor(total/1440),t=((total%1440)+1440)%1440;return `${shift<0?'前日 ':shift>0?'次日 ':''}${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;}
export function budgetTotals(p:Plan){const rows=p.budget.filter(x=>x.include==='计入'),sum=(k:'estimated'|'agreed'|'paid')=>rows.reduce((a,x)=>a+(x[k]??0),0),reserve=p.settings.budget===null?null:p.settings.budget*p.settings.reservePercent/100,available=p.settings.budget===null?null:p.settings.budget-(reserve??0);return {estimated:sum('estimated'),agreed:sum('agreed'),paid:sum('paid'),remaining:rows.reduce((a,x)=>a+(x.agreed===null?0:Math.max(0,x.agreed-(x.paid??0))),0),reserve,available,pending:p.budget.filter(x=>x.include==='待定').length};}
export function taskTotals(p:Plan){const relevant=p.tasks.filter(x=>x.status!=='不适用'),done=relevant.filter(x=>x.status==='已完成').length;return {done,total:relevant.length,percent:relevant.length?Math.round(done/relevant.length*100):0};}
export function guestTotals(p:Plan){const confirmed=p.guests.filter(g=>g.status==='确认出席');return {people:confirmed.reduce((a,g)=>a+(g.people??0),0),children:confirmed.reduce((a,g)=>a+(g.children??0),0),lodging:confirmed.reduce((a,g)=>a+(g.lodging??0),0),pending:p.guests.filter(g=>!['确认出席','不出席'].includes(g.status)).length};}
export function mergeChanges(base:unknown,local:unknown,remote:unknown):unknown{
  const eq=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
  if(eq(base,local))return remote;if(eq(base,remote)||eq(local,remote))return local;
  if(Array.isArray(base)&&Array.isArray(local)&&Array.isArray(remote)){
    const b=new Map(base.map(x=>[x.id,x])),l=new Map(local.map(x=>[x.id,x])),r=new Map(remote.map(x=>[x.id,x]));
    return [...local.map(x=>x.id),...remote.filter(x=>!l.has(x.id)).map(x=>x.id)].flatMap(id=>{if(!l.has(id))return b.has(id)?[]:[r.get(id)];if(!r.has(id))return b.has(id)&&eq(l.get(id),b.get(id))?[]:[l.get(id)];return [mergeChanges(b.get(id),l.get(id),r.get(id))];});
  }
  if(base&&local&&remote&&typeof base==='object'&&typeof local==='object'&&typeof remote==='object'){
    const b=base as Record<string,unknown>,l=local as Record<string,unknown>,r=remote as Record<string,unknown>;
    return Object.fromEntries([...new Set([...Object.keys(l),...Object.keys(r)])].map(k=>[k,mergeChanges(b[k],l[k],r[k])]));
  }return local;
}
