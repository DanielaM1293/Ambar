"use client";
import {useEffect,useState} from "react";
import {useI18n} from "@/lib/i18n";
import {SLOTS,WINE} from "@/lib/config";
const dk=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
export default function Manage({token}){
  const {t,l,set}=useI18n();
  const [b,setB]=useState(null),[nf,setNf]=useState(false),[msg,setMsg]=useState(""),[dates,setDates]=useState([]),[date,setDate]=useState(null),[time,setTime]=useState(null),[av,setAv]=useState(null),[busy,setBusy]=useState(false);
  useEffect(()=>{fetch("/api/booking/"+token).then(r=>r.ok?r.json():Promise.reject()).then(setB).catch(()=>setNf(true));
    const d=[];for(let i=1;d.length<14;i++){const x=new Date();x.setDate(x.getDate()+i);if(x.getDay()!==1)d.push(x)}setDates(d)},[token]);
  useEffect(()=>{if(!date)return;setAv(null);setTime(null);fetch("/api/availability?date="+date).then(r=>r.json()).then(j=>setAv(j.slots||{}))},[date]);
  const err=e=>e==="FULL"?t.full:e==="late"?t.late:t.fail;
  const save=async()=>{setBusy(true);const r=await fetch("/api/booking/"+token,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({date,time})});const j=await r.json();
    r.ok?(setB(j),setMsg(t.saved),setDate(null)):setMsg(err(j.error));setBusy(false)};
  const cancel=async()=>{if(!confirm(t.confirmCancel))return;setBusy(true);const r=await fetch("/api/booking/"+token,{method:"DELETE"});if(r.ok)setB(await r.json());setBusy(false)};
  const rows=b&&[[t.date,b.date],[t.time,b.time],[t.guests,b.guests],[t.steps[0],t.menus[b.menu][0]],[t.wine,t.wines[b.wine]]];
  return <main style={{padding:"60px clamp(16px,3vw,40px)",maxWidth:760,margin:"auto"}}>
    <a href="/" style={{color:"inherit",textDecoration:"none",fontWeight:800,fontSize:"1.5rem",letterSpacing:"-.04em"}}>ámbar<b style={{color:"var(--ac)"}}>.</b></a>
    <button className="pill" style={{float:"right"}} onClick={()=>set(l==="es"?"en":"es")}>{l==="es"?"EN":"ES"}</button>
    {nf?<p className="hi" style={{marginTop:50}}>{t.notfound}</p>:!b?<div className="spin"/>:<>
      <p className="hi" style={{marginTop:50}}>{t.mTitle}<b>.</b></p><span className="mono">{b.code}</span>
      <div className="sm" style={{border:"1px solid var(--ln)",margin:"20px 0"}}><dl>{rows.map((r,i)=><div className="l" key={i}><span>{r[0]}</span><span>{r[1]}</span></div>)}</dl></div>
      {b.status==="CANCELLED"?<p className="hi" style={{fontSize:"1.3rem"}}>{t.cancelled}{b.refunded?" · "+t.refunded:""}</p>
      :b.status!=="PAID"?<p className="mono">{b.status}</p>:<>
        <p className="mono" style={{marginBottom:20}}>{b.hours>=48?t.refundYes:t.refundNo}</p>
        {b.hours>=24?<><span className="mono lb">{t.resched}</span>
          <div className="chips">{dates.map(d=><button key={dk(d)} className={"chip"+(date===dk(d)?" on":"")} onClick={()=>setDate(dk(d))}>{d.toLocaleDateString(l,{weekday:"short",day:"numeric",month:"short"})}</button>)}</div>
          {date&&<div className="chips" style={{marginTop:10}}>{SLOTS.map(h=><button key={h} disabled={av===null||(av[h]??0)<b.guests} className={"chip"+(time===h?" on":"")} onClick={()=>setTime(h)}>{h}</button>)}</div>}
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:24}}><button className="btn" disabled={!date||!time||busy} onClick={save}>{t.save}</button><button className="btn g" disabled={busy} onClick={cancel}>{t.cancel}</button></div></>
        :<><p>{t.late}</p><button className="btn g" disabled={busy} onClick={cancel}>{t.cancel}</button></>}
        {msg&&<p className="mono" style={{marginTop:16}}>{msg}</p>}</>}
    </>}
  </main>}
