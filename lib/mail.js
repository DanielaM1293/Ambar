import {PRICES,OCC,WINE} from "./config";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const T={es:{confirm:["Mesa confirmada","te esperamos."],cancel:["Reserva cancelada","hemos cancelado tu reserva."],resched:["Reserva modificada","actualizamos tu reserva."],remind:["Te esperamos mañana","un recordatorio de tu mesa."],g:"comensales",dep:"Depósito",manage:"Gestionar reserva",ref:"Depósito reembolsado",nref:"Depósito no reembolsable"},
 en:{confirm:["Table confirmed","we look forward to seeing you."],cancel:["Booking cancelled","we have cancelled your booking."],resched:["Booking updated","we updated your booking."],remind:["See you tomorrow","a reminder about your table."],g:"guests",dep:"Deposit",manage:"Manage booking",ref:"Deposit refunded",nref:"Deposit non-refundable"}};
export async function sendMail(b,kind){
  const k=process.env.RESEND_API_KEY; if(!k) return;
  const L=T[b.lang==="en"?"en":"es"],[h,p]=L[kind];
  const link=`${process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"}/reserva/${b.token}`;
  const body=kind==="cancel"
    ?`<p style="color:#666">${b.refunded?L.ref:L.nref}</p>`
    :`<p><b>${esc(b.date)} · ${esc(b.time)}</b><br>${b.guests} ${L.g} · ${PRICES[b.menu]} USD · ${WINE[b.wine]}${b.occ?"<br>"+OCC[b.occ]:""}</p>
      <p style="color:#666;font-size:13px">${L.dep}: $${(b.amount/100).toFixed(2)}</p>
      <p><a href="${link}" style="background:#ff4a1c;color:#fff;padding:12px 20px;text-decoration:none;font-weight:700">${L.manage}</a></p>`;
  const html=`<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;padding:24px;border:2px solid #111"><h1 style="margin:0 0 8px">${h} ✺</h1><p>${esc(b.name)}, ${p}</p>${body}<p style="font:700 18px monospace;color:#ff4a1c">${b.code}</p></div>`;
  await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${k}`,"Content-Type":"application/json"},
    body:JSON.stringify({from:process.env.MAIL_FROM||"Ámbar <onboarding@resend.dev>",to:b.email,subject:`${h} · ${b.code}`,html})}).catch(()=>{});
}
export const sendConfirmation=b=>sendMail(b,"confirm");
