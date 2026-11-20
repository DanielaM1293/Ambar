"use client";
import {createContext,useContext,useState,useEffect} from "react";
import {PRICES,total} from "./config";
export {PRICES,total};
const D={es:{
 nav:["Carta","Reservas","Reseñas"],book:"Reservar",h:["FUEGO","BRASA","HUMO"],sub:"Cocina de brasa en Bogotá. Una mesa, una noche, doce tiempos.",
 tick:["Cocina de fuego","Producto local","Leña de roble","Bogotá · Chapinero","Menú degustación"],
 menuT:"La carta",menuH:"Cinco platos para empezar a hablar",
 dishes:["Cebolla ahumada","Trucha a la brasa","Ibérico de leña","Maíz y ceniza","Cacao fermentado"],
 steps:["Experiencia","Fecha","Tú","Pago"],
 menus:[["Brasa","8 tiempos · 2 h"],["Fuego Lento","12 tiempos · 3 h"],["Cenizas","16 tiempos · chef’s table"]],
 date:"Fecha",guests:"Comensales",time:"Hora",closed:"Cerrado",name:"Nombre",email:"Correo",
 occ:"¿Celebramos algo?",occs:["Nada especial","Cumpleaños","Aniversario","Propuesta","Negocios"],
 perks:["","Postre de cortesía con vela","Copa de espumoso para brindar","Mesa junto al fuego, sin preguntas","Mesa silenciosa y factura detallada"],
 diet:"Alimentación",diets:["Ninguna","Vegetariano","Sin gluten","Sin mariscos","Sin lácteos"],
 wine:"Maridaje",wines:["Sin maridaje","Vinos","Zero proof"],note:"Nota para el chef",
 next:"Continuar",back:"Atrás",pay:"Pagar depósito",hi:"Hola, {n}",hi0:"Diseña tu noche",
 sum:"Tu reserva",today:"Depósito hoy (50%)",rest:"El resto se paga en el restaurante.",
 demo:"Modo demo: añade tus llaves de Stripe en .env para cobrar de verdad.",
 done:"Mesa confirmada",doneM:"Te esperamos, {n}. Enviamos todo a {e}.",bad:"Completa nombre y correo válidos.",full:"Esa hora se agotó. Elige otra.",fail:"No se pudo procesar. Inténtalo de nuevo.",left:"quedan",manage:"Gestionar mi reserva",mTitle:"Tu reserva",cancel:"Cancelar reserva",confirmCancel:"¿Seguro que quieres cancelar tu reserva?",refundYes:"Cancelación gratuita: te devolvemos el depósito.",refundNo:"Faltan menos de 48 h: el depósito no es reembolsable.",resched:"Cambiar fecha u hora",save:"Guardar cambio",cancelled:"Reserva cancelada",refunded:"Depósito reembolsado",saved:"Cambio guardado ✓",late:"Faltan menos de 24 h: ya no se puede modificar online. Escríbenos.",notfound:"No encontramos esta reserva.",
 revT:"Reseñas",revs:["Una noche que no he podido dejar de contar.","El mejor servicio de Bogotá, sin discusión.","Pedimos matrimonio aquí y lo cuidaron todo."],
 stats:["tiempos","productores","años"]},
en:{
 nav:["Menu","Booking","Reviews"],book:"Book",h:["FIRE","EMBER","SMOKE"],sub:"Open-fire cooking in Bogotá. One table, one night, twelve courses.",
 tick:["Fire kitchen","Local produce","Oak wood","Bogotá · Chapinero","Tasting menu"],
 menuT:"The menu",menuH:"Five dishes to get the conversation going",
 dishes:["Smoked onion","Embered trout","Wood-fired pork","Corn & ash","Fermented cacao"],
 steps:["Experience","Date","You","Payment"],
 menus:[["Ember","8 courses · 2 h"],["Slow Fire","12 courses · 3 h"],["Ash","16 courses · chef’s table"]],
 date:"Date",guests:"Guests",time:"Time",closed:"Closed",name:"Name",email:"Email",
 occ:"Celebrating something?",occs:["Nothing special","Birthday","Anniversary","Proposal","Business"],
 perks:["","Complimentary dessert with a candle","A glass of sparkling to toast","Table by the fire, no questions asked","Quiet table and itemized invoice"],
 diet:"Dietary",diets:["None","Vegetarian","Gluten-free","No shellfish","Dairy-free"],
 wine:"Pairing",wines:["No pairing","Wine","Zero proof"],note:"Note for the chef",
 next:"Continue",back:"Back",pay:"Pay deposit",hi:"Hi, {n}",hi0:"Design your night",
 sum:"Your booking",today:"Deposit today (50%)",rest:"The rest is paid at the restaurant.",
 demo:"Demo mode: add your Stripe keys in .env to charge for real.",
 done:"Table confirmed",doneM:"See you soon, {n}. Details sent to {e}.",bad:"Enter a valid name and email.",full:"That time just sold out. Pick another.",fail:"Could not process. Please try again.",left:"left",manage:"Manage my booking",mTitle:"Your booking",cancel:"Cancel booking",confirmCancel:"Are you sure you want to cancel?",refundYes:"Free cancellation: your deposit will be refunded.",refundNo:"Less than 48 h left: the deposit is non-refundable.",resched:"Change date or time",save:"Save change",cancelled:"Booking cancelled",refunded:"Deposit refunded",saved:"Change saved ✓",late:"Less than 24 h left: it can no longer be changed online. Please contact us.",notfound:"We could not find this booking.",
 revT:"Reviews",revs:["A night I haven’t stopped talking about.","The best service in Bogotá, no contest.","We got engaged here and they handled everything."],
 stats:["courses","growers","years"]}};
const C=createContext();
export const useI18n=()=>useContext(C);
export function I18n({children}){
 const [l,setL]=useState("es");
 useEffect(()=>{const s=localStorage.getItem("l");if(s){setL(s);document.documentElement.lang=s}},[]);
 const set=x=>{setL(x);localStorage.setItem("l",x);document.documentElement.lang=x};
 return <C.Provider value={{l,set,t:D[l]}}>{children}</C.Provider>}
