import {db} from "@/lib/db";
import {cancelBooking,reschedule,hoursLeft} from "@/lib/booking";
const find=async p=>db.booking.findUnique({where:{token:(await p).token}});
const pub=b=>({code:b.code,name:b.name,date:b.date,time:b.time,guests:b.guests,menu:b.menu,wine:b.wine,status:b.status,refunded:b.refunded,hours:Math.floor(hoursLeft(b))});
const nf=()=>Response.json({error:"notfound"},{status:404});
export async function GET(_,{params}){const b=await find(params);return b?Response.json(pub(b)):nf()}
export async function PATCH(req,{params}){
  const b=await find(params);if(!b)return nf();
  const {date,time}=await req.json().catch(()=>({}));
  try{return Response.json(pub(await reschedule(b,date,time)))}
  catch(e){return Response.json({error:e.message},{status:e.message==="FULL"?409:400})}}
export async function DELETE(_,{params}){const b=await find(params);if(!b)return nf();return Response.json(pub(await cancelBooking(b)))}
