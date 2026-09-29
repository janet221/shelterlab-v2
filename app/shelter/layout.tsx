import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/classroom/auth";

export default async function ShelterLayout({children}:{children:React.ReactNode}){const account=await currentAccount("shelter");if(!account)redirect("/auth?role=shelter");if(account.role!=="shelter")redirect("/?authError=此帳號沒有收容所管理權限");return children;}
