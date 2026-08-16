import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "../../../lib/session";
import OrdersPage from "./OrdersClient";

// Server-side admin gate — runs before any client JS ships, so a
// non-admin visiting this URL directly never sees the admin shell at all.
export default async function Page() {
  const session = await getIronSession<{ isAdmin?: boolean }>(await cookies(), sessionOptions);
  if (!session.isAdmin) redirect("/");
  return <OrdersPage />;
}
