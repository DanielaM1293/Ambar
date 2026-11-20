// Módulo compartido (sin "use client"): lo usan el cliente y el servidor.
export const PRICES=[95,145,220];
export const SLOTS=["18:30","19:00","19:30","20:00","20:30","21:00"];
export const SEATS=24; // cupos por franja
export const OCC=["—","Cumpleaños","Aniversario","Propuesta","Negocios"];
export const DIET=["—","Vegetariano","Sin gluten","Sin mariscos","Sin lácteos"];
export const WINE=["Sin maridaje","Vinos","Zero proof"];
export const total=(m,g,w)=>PRICES[m]*g+(w===1?Math.round(PRICES[m]*.55)*g:w===2?35*g:0);
export const validDate=d=>{
  if(typeof d!=="string"||!/^\d{4}-\d\d-\d\d$/.test(d)) return false;
  const x=new Date(d+"T12:00:00"),n=new Date();n.setHours(0,0,0,0);
  const diff=(x-n)/864e5;
  return diff>=0.5&&diff<=60&&x.getDay()!==1; // lunes cerrado
};
