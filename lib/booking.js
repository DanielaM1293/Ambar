import Stripe from "stripe";
import {db} from "./db";
import {remaining} from "./avail";
import {sendMail} from "./mail";
import {SLOTS,validDate} from "./config";
// Hora local de Bogotá (UTC-5, sin horario de verano)
export const hoursLeft=b=>(new Date(`${b.date}T${b.time}:00-05:00`)-Date.now())/36e5;

// Política: ≥48 h → reembolso total del depósito. <48 h → sin reembolso. (force = decide el restaurante)
export async function cancelBooking(b,{force=false}={}){
  if(b.status==="CANCELLED") return b;
  const eligible=force||hoursLeft(b)>=48;
  let refunded=false;
  if(eligible&&b.status==="PAID"){
    if(!b.paymentIntentId) refunded=true; // modo demo: nada que devolver
    else if(process.env.STRIPE_SECRET_KEY){
      try{await new Stripe(process.env.STRIPE_SECRET_KEY).refunds.create({payment_intent:b.paymentIntentId});refunded=true}catch{}
    }
  }
  const u=await db.booking.update({where:{id:b.id},data:{status:"CANCELLED",refunded}});
  await sendMail(u,"cancel");
  return u;
}
// Cambiar fecha/hora (hasta 24 h antes, mismo número de comensales)
export async function reschedule(b,date,time){
  if(b.status!=="PAID") throw new Error("state");
  if(hoursLeft(b)<24) throw new Error("late");
  if(!validDate(date)||!SLOTS.includes(time)) throw new Error("invalid");
  if(date===b.date&&time===b.time) return b;
  const u=await db.$transaction(async tx=>{
    if((await remaining(date,tx))[time]<b.guests) throw new Error("FULL");
    return tx.booking.update({where:{id:b.id},data:{date,time,reminded:false}});
  });
  await sendMail(u,"resched");
  return u;
}
