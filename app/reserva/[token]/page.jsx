import Manage from "@/components/Manage";
export const metadata={title:"Mi reserva · Ámbar",robots:{index:false}};
export default async function P({params}){const {token}=await params;return <Manage token={token}/>}
