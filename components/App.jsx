"use client";
import {useState,useEffect,useRef} from "react";
import {motion,AnimatePresence,useScroll,useTransform,useMotionValue,animate,useInView} from "framer-motion";
import Image from "next/image";
import {useTheme} from "next-themes";
import {useI18n,PRICES,total} from "@/lib/i18n";
import {SLOTS} from "@/lib/config";
import Checkout from "./Checkout";

const UNS="https://unsplash.com/?utm_source=ambar&utm_medium=referral";
const COLORS=[["#ff4a1c","#ffb347"],["#ff9a76","#c0392b"],["#8b2d1a","#e67e22"],["#f1c40f","#6d4c1d"],["#4b2e1e","#c08a5b"]];
const money=n=>"$"+n.toLocaleString("en-US");
const Rv=({children,d=0,...p})=><motion.div initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-60px"}} transition={{duration:.8,delay:d,ease:[.2,.8,.2,1]}} {...p}>{children}</motion.div>;

function Count({to}){const r=useRef(),v=useInView(r,{once:true});const [n,setN]=useState(0);
 useEffect(()=>{if(v){const c=animate(0,to,{duration:1.6,ease:"easeOut",onUpdate:x=>setN(Math.round(x))});return()=>c.stop()}},[v,to]);
 return <b ref={r}>{n}</b>}

function Drag({children,className=""}){const w=useRef(),i=useRef(),[c,setC]=useState(0);
 useEffect(()=>{const f=()=>setC(Math.min(0,w.current.clientWidth-i.current.scrollWidth));f();addEventListener("resize",f);return()=>removeEventListener("resize",f)},[]);
 return <div ref={w} style={{overflow:"hidden"}}><motion.div ref={i} className="trk" drag="x" dragConstraints={{left:c,right:0}} dragElastic={.08}>{children}</motion.div></div>}

export default function App({photos={}}){
 const {t,l,set}=useI18n(),{resolvedTheme,setTheme}=useTheme();
 const [S,setS]=useState({step:0,menu:1,date:null,time:null,g:2,occ:0,diet:0,wine:0,name:"",email:"",note:""});
 const [avail,setAvail]=useState(null),[dates,setDates]=useState([]),[code,setCode]=useState(null),[tok,setTok]=useState(null),[bad,setBad]=useState(false);
 const up=o=>setS(s=>({...s,...o}));
 const mx=useMotionValue(-999),my=useMotionValue(-999);
 const {scrollY}=useScroll(),y1=useTransform(scrollY,[0,600],[0,-80]),y3=useTransform(scrollY,[0,600],[0,60]);
 useEffect(()=>{const d=[];for(let i=1;d.length<10;i++){const x=new Date();x.setDate(x.getDate()+i);d.push(x)}setDates(d);
  try{const n=localStorage.getItem("n");if(n)up({name:n})}catch{}},[]);
 const dkey=d=>!d?"":`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
 useEffect(()=>{if(S.date===null||!dates[S.date])return;setAvail(null);let ok=true;
  fetch("/api/availability?date="+dkey(dates[S.date])).then(r=>r.json()).then(j=>ok&&setAvail(j.slots||{})).catch(()=>ok&&setAvail({}));return()=>{ok=false}},[S.date,dates]);
 useEffect(()=>{if(S.time&&avail&&(avail[S.time]??0)<S.g)up({time:null})},[S.g,avail]);
 const tot=total(S.menu,S.g,S.wine),dep=Math.round(tot/2),first=S.name.trim().split(" ")[0];
 const goto=n=>{if(n<=S.step||code===null)up({step:n})};
 const next=()=>{
  if(S.step===2){if(!S.name.trim()||!/^\S+@\S+\.\S+$/.test(S.email)){setBad(true);return}setBad(false);try{localStorage.setItem("n",S.name)}catch{}}
  up({step:S.step+1})};
 const dfmt=(d,o)=>d.toLocaleDateString(l,o);
 const Chips=({k,arr})=><div className="chips">{arr.map((x,i)=><button key={i} className={"chip"+(S[k]===i?" on":"")} onClick={()=>up({[k]:i})}>{x}</button>)}</div>;
 const steps=[
 <div key="0">{t.menus.map((m,i)=><button key={i} className={"opt"+(S.menu===i?" on":"")} onClick={()=>up({menu:i})}><div><h4>{m[0]}</h4><span className="mono" style={{color:"inherit",opacity:.7}}>{m[1]}</span></div><b>{money(PRICES[i])}</b></button>)}</div>,
 <div key="1"><span className="mono lb">{t.date}</span><div className="chips">{dates.map((d,i)=><button key={i} disabled={d.getDay()===1} className={"chip"+(S.date===i?" on":"")} onClick={()=>up({date:i,time:null})}>{dfmt(d,{weekday:"short",day:"numeric",month:"short"})}</button>)}</div>
  <span className="mono lb">{t.guests}</span><div className="cnt"><button onClick={()=>up({g:Math.max(1,S.g-1)})}>−</button><b>{S.g}</b><button onClick={()=>up({g:Math.min(10,S.g+1)})}>+</button></div>
  <span className="mono lb">{t.time}</span><div className="chips">{S.date!==null?SLOTS.map(h=><button key={h} disabled={avail===null||(avail[h]??0)<S.g} className={"chip"+(S.time===h?" on":"")} onClick={()=>up({time:h})}>{h}{avail&&avail[h]>0&&avail[h]<=6?` · ${avail[h]} ${t.left}`:""}</button>):"—"}</div></div>,
 <div key="2"><div className="row"><div><span className="mono lb" style={{marginTop:0}}>{t.name}</span><input value={S.name} onChange={e=>up({name:e.target.value})} autoComplete="name"/></div><div><span className="mono lb" style={{marginTop:0}}>{t.email}</span><input type="email" value={S.email} onChange={e=>up({email:e.target.value})} autoComplete="email"/></div></div>
  {bad&&<p className="err">{t.bad}</p>}
  <span className="mono lb">{t.occ}</span><Chips k="occ" arr={t.occs}/><span className="mono lb">{t.diet}</span><Chips k="diet" arr={t.diets}/><span className="mono lb">{t.wine}</span><Chips k="wine" arr={t.wines}/>
  <span className="mono lb">{t.note}</span><textarea rows={2} value={S.note} onChange={e=>up({note:e.target.value})}/></div>,
 <Checkout key="3" label={t.pay+" "+money(dep)} demoMsg={t.demo} msgs={{full:t.full,fail:t.fail}} onPaid={(c,tk)=>{setCode(c);setTok(tk);up({step:4})}} payload={{menu:S.menu,guests:S.g,wine:S.wine,name:S.name,email:S.email,occ:S.occ,diet:S.diet,note:S.note,date:dkey(dates[S.date]),time:S.time,lang:l}}/>,
 <div key="4" className="ok"><span className="mono">{code}</span><h3>{t.done}<span style={{color:"var(--ac)"}}>.</span></h3><p style={{color:"var(--mut)"}}>{t.doneM.replace("{n}",first).replace("{e}",S.email)}</p><div className="code">{code}</div>{tok&&<p><a className="btn g" style={{marginTop:22}} href={"/reserva/"+tok}>{t.manage}</a></p>}</div>];
 const rows=[[t.steps[0],t.menus[S.menu][0]],[t.date,S.date!==null?dfmt(dates[S.date],{weekday:"long",day:"numeric",month:"long"}):"—"],[t.time,S.time||"—"],[t.guests,S.g],[t.wine,t.wines[S.wine]]];
 const tick=[...t.tick,...t.tick,...t.tick,...t.tick];
 return <>
 <nav><a className="logo" href="#top">ámbar<b>.</b></a>
  <div className="l"><a href="#menu">{t.nav[0]}</a><a href="#book">{t.nav[1]}</a><a href="#rev">{t.nav[2]}</a></div>
  <div className="r"><button className="pill" onClick={()=>set(l==="es"?"en":"es")}>{l==="es"?"EN":"ES"}</button><button className="pill" aria-label="theme" onClick={()=>setTheme(resolvedTheme==="dark"?"light":"dark")}>◐</button><a className="btn" style={{padding:"8px 16px",boxShadow:"none"}} href="#book">{t.book}</a></div></nav>

 <header id="top" className="hero" onMouseMove={e=>{mx.set(e.clientX);my.set(e.clientY+scrollY.get())}}>
  <motion.div className="glow" style={{left:mx,top:my}} transition={{type:"spring"}}/>
  {photos.hero&&<motion.figure className="himg" style={{y:y3}} initial={{opacity:0,clipPath:"inset(100% 0 0 0)"}} animate={{opacity:1,clipPath:"inset(0% 0 0 0)"}} transition={{duration:1.3,delay:.4,ease:[.2,.8,.2,1]}}><Image src={photos.hero.url} alt={photos.hero.alt} fill priority unoptimized sizes="420px"/><figcaption className="cr">Photo by <a href={photos.hero.link} target="_blank" rel="noreferrer">{photos.hero.author}</a> on <a href={UNS} target="_blank" rel="noreferrer">Unsplash</a></figcaption></motion.figure>}
  <h1 className="big" style={{position:"relative",zIndex:1}}>{t.h.map((w,i)=><span key={w}><motion.span style={{display:"block",y:i===1?y1:i===2?y3:0}} initial={{y:"110%"}} animate={{y:0}} transition={{duration:1,delay:.15*i,ease:[.2,.8,.2,1]}}>{w}</motion.span></span>)}</h1>
  <div className="hf"><p>{t.sub}</p><div style={{display:"flex",gap:14,flexWrap:"wrap"}}><a className="btn" href="#book">{t.book} →</a><a className="btn g" href="#menu">{t.nav[0]}</a></div></div>
 </header>
 <div className="mq"><div>{tick.map((x,i)=><span key={i}>{x} <i>✺</i></span>)}</div></div>
 <div className="stats">{[[12,0],[38,1],[9,2]].map(([n,i])=><div key={i}><Count to={n}/><span className="mono">{t.stats[i]}</span></div>)}</div>

 <section id="menu"><Rv><span className="mono">01 — {t.menuT}</span><h2>{t.menuH}</h2></Rv>
  <Drag>{t.dishes.map((d,i)=><div className="dish" key={i}><div className="pl">{photos.dishes?.[i]?<><Image src={photos.dishes[i].url} alt={photos.dishes[i].alt} fill sizes="320px" className="ph" draggable={false} unoptimized/><span className="cr">Photo by <a href={photos.dishes[i].link} target="_blank" rel="noreferrer">{photos.dishes[i].author}</a> on <a href={UNS} target="_blank" rel="noreferrer">Unsplash</a></span></>:<i style={{background:`conic-gradient(from ${i*40}deg,${COLORS[i][0]},${COLORS[i][1]},${COLORS[i][0]})`}}/>}</div><h3>{d}</h3><span className="mono">0{i+1} / 05</span></div>)}</Drag></section>

 <section id="book"><Rv><span className="mono">02 — {t.nav[1]}</span><h2>{t.hi0}</h2></Rv>
  <div className="bk">
   <div className="st">{t.steps.map((s,i)=><button key={i} className={S.step===i?"on":""} onClick={()=>goto(i)}><em>0{i+1}</em>{s}</button>)}</div>
   <div className="main">
    {S.step<4&&<p className="hi">{first?t.hi.replace("{n}",first):t.steps[S.step]}<b>.</b></p>}
    <AnimatePresence mode="wait"><motion.div key={S.step} initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} transition={{duration:.3}}>{steps[S.step]}</motion.div></AnimatePresence>
    {S.step<3&&<div className="nx"><button className="btn g" style={{visibility:S.step?"visible":"hidden"}} onClick={()=>up({step:S.step-1})}>{t.back}</button><button className="btn" disabled={S.step===1&&(S.date===null||!S.time)} onClick={next}>{t.next} →</button></div>}
   </div>
   <aside className="sm"><span className="mono">{t.sum}</span><dl>{rows.map((r,i)=><div className="l" key={i}><span>{r[0]}</span><span>{r[1]}</span></div>)}</dl>
    <span className="mono">{t.today}</span><div className="tot">{money(dep)}</div><span className="mono" style={{textTransform:"none"}}>{t.rest}</span>
    <AnimatePresence>{S.occ>0&&<motion.div key={S.occ} className="perk" initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}}>✺ {t.perks[S.occ]}</motion.div>}</AnimatePresence></aside>
  </div></section>

 <section id="rev" style={{paddingTop:0}}><Rv><span className="mono">03 — {t.revT}</span></Rv>
  <Drag>{t.revs.map((r,i)=><div className="rev" key={i}><p>“{r}”</p><span className="mono">★★★★★</span></div>)}</Drag></section>
 <footer className="mono">© 2026 Ámbar — Bogotá</footer>
 </>}
