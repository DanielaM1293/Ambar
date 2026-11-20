import {remaining} from "@/lib/avail";
import {validDate} from "@/lib/config";
export const dynamic="force-dynamic";
export async function GET(req){
  const d=new URL(req.url).searchParams.get("date");
  if(!validDate(d)) return Response.json({slots:{}});
  return Response.json({slots:await remaining(d)});
}
