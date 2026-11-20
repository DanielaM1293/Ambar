import App from "@/components/App";
import {getPhoto,QUERIES} from "@/lib/photos";
export const revalidate=86400;
export default async function Page(){
  const [hero,...dishes]=await Promise.all([getPhoto(QUERIES.hero,"portrait"),...QUERIES.dishes.map(q=>getPhoto(q))]);
  return <App photos={{hero,dishes}}/>;
}
