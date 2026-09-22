import { notFound, redirect } from "next/navigation";
export default async function RoleEntry({ params }: { params: Promise<{role:string}> }) { const {role}=await params; if(role==="student")redirect("/student"); if(role==="teacher")redirect("/teacher"); if(role==="shelter")redirect("/shelter"); notFound(); }
