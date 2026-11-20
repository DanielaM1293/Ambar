"use client";
import {useEffect,useRef,useState} from "react";
import {loadStripe} from "@stripe/stripe-js";
import {Elements,PaymentElement,useStripe,useElements} from "@stripe/react-stripe-js";
const pk=process.env.NEXT_PUBLIC_STRIPE_PK;
const stripePromise=pk?loadStripe(pk):null;
function Form({onPaid,label}){
  const stripe=useStripe(),els=useElements();const [busy,setBusy]=useState(false),[err,setErr]=useState("");
  const submit=async e=>{e.preventDefault();setBusy(true);
    const r=await stripe.confirmPayment({elements:els,redirect:"if_required"});
    if(r.error){setErr(r.error.message);setBusy(false)}else onPaid()};
  return <form onSubmit={submit}><PaymentElement/><p className="err">{err}</p><button className="btn" disabled={!stripe||busy}>{busy?"…":label}</button></form>}
export default function Checkout({payload,label,demoMsg,msgs,onPaid}){
  const [st,setSt]=useState({}),once=useRef(false);
  useEffect(()=>{ if(once.current) return; once.current=true; // evita doble reserva en StrictMode
    fetch("/api/create-intent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})
      .then(async r=>({r,j:await r.json()}))
      .then(({r,j})=>{
        if(!r.ok) return setSt({error:j.error==="full"?msgs.full:msgs.fail});
        if(j.demo||!stripePromise) return setSt({demo:true,code:j.code,token:j.token});
        setSt({secret:j.clientSecret,code:j.code,token:j.token});
      }).catch(()=>setSt({error:msgs.fail}));
  },[]);
  if(st.error) return <p className="err">{st.error}</p>;
  if(st.demo) return <div><p className="mono">{demoMsg}</p><button className="btn" onClick={()=>onPaid(st.code,st.token)}>{label} (demo)</button></div>;
  if(!st.secret) return <div className="spin"/>;
  return <Elements stripe={stripePromise} options={{clientSecret:st.secret,appearance:{theme:"flat",variables:{colorPrimary:"#ff4a1c",borderRadius:"0px"}}}}>
    <Form onPaid={()=>onPaid(st.code,st.token)} label={label}/></Elements>}
