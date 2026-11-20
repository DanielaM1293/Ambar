import {Bricolage_Grotesque,JetBrains_Mono} from "next/font/google";
import {ThemeProvider} from "next-themes";
import {I18n} from "@/lib/i18n";
import "./globals.css";
const d=Bricolage_Grotesque({subsets:["latin"],variable:"--fd"});
const m=JetBrains_Mono({subsets:["latin"],variable:"--fm"});
export const metadata={title:"Ámbar — Cocina de fuego",description:"Reserva tu mesa en Ámbar, Bogotá."};
export default function Root({children}){return(
<html lang="es" suppressHydrationWarning><body className={`${d.variable} ${m.variable}`}>
<ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem><I18n>{children}</I18n></ThemeProvider>
</body></html>)}
