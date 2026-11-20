import Stripe from "stripe";
import {db} from "@/lib/db";
import {hoursLeft} from "@/lib/booking";
import {sendMail} from "@/lib/mail";
export const dynamic="force-dynamic";
// Se ejecuta cada ~15 min: libera reservas sin pagar y envía recordatorios (<24 h).
export async function GET(req){
  if(!process.env.CRON_SECRET||req.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`) return new Response("Unauthorized",{status:401});
  const stale=await db.booking.findMany({where:{status:"PENDING",createdAt:{lt:new Date(Date.now()-15*60e3)}}});
  const s=process.env.STRIPE_SECRET_KEY?new Stripe(process.env.STRIPE_SECRET_KEY):null;
  for(const b of stale){
    if(s&&b.paymentIntentId) await s.paymentIntents.cancel(b.paymentIntentId).catch(()=>{});
    await db.booking.update({where:{id:b.id},data:{status:"CANCELLED"}});
  }
  const today=new Date(Date.now()-5*3600e3).toISOString().slice(0,10),tmr=new Date(Date.now()+19*3600e3).toISOString().slice(0,10);
  const soon=(await db.booking.findMany({where:{status:"PAID",reminded:false,date:{in:[today,tmr]}}})).filter(b=>{const h=hoursLeft(b);return h>0&&h<=24});
  for(const b of soon){await sendMail(b,"remind");await db.booking.update({where:{id:b.id},data:{reminded:true}})}
  return Response.json({expired:stale.length,reminded:soon.length});
}
