import Stripe from "stripe";
import {randomBytes} from "node:crypto";
import {db} from "@/lib/db";
import {remaining} from "@/lib/avail";
import {sendConfirmation} from "@/lib/mail";
import {PRICES,SLOTS,total,validDate} from "@/lib/config";

export async function POST(req){
  const b=await req.json().catch(()=>({}));
  const g=+b.guests,m=+b.menu,w=+b.wine,occ=+b.occ||0,diet=+b.diet||0;
  const ok=g>=1&&g<=10&&PRICES[m]&&[0,1,2].includes(w)&&SLOTS.includes(b.time)&&validDate(b.date)
    &&/^\S+@\S+\.\S+$/.test(b.email||"")&&(b.name||"").trim()&&occ>=0&&occ<5&&diet>=0&&diet<5;
  if(!ok) return Response.json({error:"invalid"},{status:400});
  const demo=!process.env.STRIPE_SECRET_KEY;
  const amount=Math.round(total(m,g,w)/2*100); // el precio SIEMPRE se calcula en el servidor
  let booking;
  try{
    // transacción: comprobar cupo y crear la reserva de forma atómica
    booking=await db.$transaction(async tx=>{
      if((await remaining(b.date,tx))[b.time]<g) throw new Error("FULL");
      return tx.booking.create({data:{code:"AMB-"+randomBytes(3).toString("hex").toUpperCase(),token:randomBytes(16).toString("hex"),
        name:b.name.trim().slice(0,80),email:b.email.trim(),menu:m,guests:g,wine:w,occ,diet,
        note:String(b.note||"").slice(0,300),date:b.date,time:b.time,amount,lang:b.lang==="en"?"en":"es",
        status:demo?"PAID":"PENDING"}});
    });
  }catch(e){
    return Response.json({error:e.message==="FULL"?"full":"server"},{status:e.message==="FULL"?409:500});
  }
  if(demo){ await sendConfirmation(booking); return Response.json({demo:true,code:booking.code,token:booking.token}); }
  const s=new Stripe(process.env.STRIPE_SECRET_KEY);
  const pi=await s.paymentIntents.create({amount,currency:"usd",receipt_email:booking.email,
    metadata:{bookingId:booking.id,code:booking.code},automatic_payment_methods:{enabled:true}});
  await db.booking.update({where:{id:booking.id},data:{paymentIntentId:pi.id}});
  return Response.json({clientSecret:pi.client_secret,code:booking.code,token:booking.token});
}
