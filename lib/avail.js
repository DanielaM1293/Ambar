import {db} from "./db";
import {SLOTS,SEATS} from "./config";
// Cupos restantes por franja. Las reservas PENDING retienen cupo 15 min.
export async function remaining(date,c=db){
  const hold=new Date(Date.now()-15*60e3);
  const rows=await c.booking.findMany({where:{date,OR:[{status:"PAID"},{status:"PENDING",createdAt:{gt:hold}}]},select:{time:true,guests:true}});
  const used={};rows.forEach(r=>{used[r.time]=(used[r.time]||0)+r.guests});
  return Object.fromEntries(SLOTS.map(s=>[s,Math.max(0,SEATS-(used[s]||0))]));
}
