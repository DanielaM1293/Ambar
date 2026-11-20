import Stripe from "stripe";
import {db} from "@/lib/db";
import {sendConfirmation} from "@/lib/mail";
export const runtime="nodejs";
export async function POST(req){
  const s=new Stripe(process.env.STRIPE_SECRET_KEY);
  const raw=await req.text(); // el body crudo es necesario para verificar la firma
  let ev;
  try{ ev=s.webhooks.constructEvent(raw,req.headers.get("stripe-signature"),process.env.STRIPE_WEBHOOK_SECRET); }
  catch{ return new Response("Invalid signature",{status:400}); }
  const pi=ev.data.object;
  if(ev.type==="payment_intent.succeeded"){
    const b=await db.booking.findUnique({where:{paymentIntentId:pi.id}});
    if(b&&b.status!=="PAID"){ await db.booking.update({where:{id:b.id},data:{status:"PAID"}}); await sendConfirmation({...b,status:"PAID"}); }
  }
  if(ev.type==="payment_intent.payment_failed"||ev.type==="payment_intent.canceled")
    await db.booking.updateMany({where:{paymentIntentId:pi.id,status:"PENDING"},data:{status:"CANCELLED"}});
  return Response.json({received:true});
}
