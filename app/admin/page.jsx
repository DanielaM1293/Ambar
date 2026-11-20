import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {createHash} from "node:crypto";
import {db} from "@/lib/db";
import {cancelBooking} from "@/lib/booking";
import {PRICES,OCC,DIET,WINE} from "@/lib/config";
export const dynamic="force-dynamic";
const tok=()=>createHash("sha256").update("amb:"+process.env.ADMIN_KEY).digest("hex");
const authed=async()=>!!process.env.ADMIN_KEY&&(await cookies()).get("adm")?.value===tok();
async function login(fd){"use server";
  if(process.env.ADMIN_KEY&&fd.get("k")===process.env.ADMIN_KEY)
    (await cookies()).set("adm",tok(),{httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==="production",path:"/admin",maxAge:28800});
  redirect("/admin");}
async function logout(){"use server";(await cookies()).delete("adm");redirect("/admin");}
async function cancel(fd){"use server";if(!(await authed()))return;
  const b=await db.booking.findUnique({where:{id:String(fd.get("id"))}});if(b)await cancelBooking(b,{force:true});redirect("/admin");}
export default async function Admin(){
  if(!(await authed())) return <main style={{padding:40,fontFamily:"system-ui"}}><form action={login}><h1>Admin</h1><input name="k" type="password" placeholder="ADMIN_KEY" style={{padding:10,marginRight:8}}/><button style={{padding:10}}>Entrar</button></form></main>;
  const rows=await db.booking.findMany({where:{status:{not:"CANCELLED"}},orderBy:[{date:"asc"},{time:"asc"}]});
  const td={padding:"8px 10px",borderBottom:"1px solid #8885",textAlign:"left",fontSize:14,whiteSpace:"nowrap"};
  return <main style={{padding:24,fontFamily:"system-ui",overflowX:"auto"}}>
    <form action={logout} style={{float:"right"}}><button>Salir</button></form><h1>Reservas ({rows.length})</h1>
    <table style={{borderCollapse:"collapse",width:"100%"}}><thead><tr>{["Fecha","Hora","Código","Nombre","Email","Pax","Menú","Vino","Ocasión","Dieta","Nota","Depósito","Estado",""].map(h=><th key={h} style={td}>{h}</th>)}</tr></thead>
    <tbody>{rows.map(r=><tr key={r.id}>{[r.date,r.time,r.code,r.name,r.email,r.guests,PRICES[r.menu]+" USD",WINE[r.wine],OCC[r.occ],DIET[r.diet],r.note,"$"+(r.amount/100).toFixed(2),r.status].map((v,i)=><td key={i} style={td}>{v}</td>)}
      <td style={td}><form action={cancel}><input type="hidden" name="id" value={r.id}/><button>Cancelar + reembolsar</button></form></td></tr>)}</tbody></table></main>;}
