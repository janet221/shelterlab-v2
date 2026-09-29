import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { assertSameOrigin, body, endpoint, RequestError } from "@/lib/classroom/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime="nodejs";
const schema=z.object({email:z.string().trim().email().max(254).transform(value=>value.toLowerCase()),password:z.string().min(8).max(128),partnershipCode:z.string().trim().min(8).max(128)}).strict();
const hash=(value:string)=>createHash("sha256").update(value,"utf8").digest("hex");

export async function POST(request:Request){return endpoint(async()=>{
  assertSameOrigin(request);const input=await body(request,schema),admin=createAdminSupabaseClient(),codeHash=hash(input.partnershipCode);
  const {data:invitation}=await admin.from("shelter_partnership_codes").select("id,shelter_id,code_hash,expires_at,used_at").eq("code_hash",codeHash).maybeSingle();
  if(!invitation||invitation.used_at||(invitation.expires_at&&new Date(invitation.expires_at)<=new Date()))throw new RequestError(422,"收容所合作代碼無效或已使用。");
  const expected=Buffer.from(invitation.code_hash,"hex"),provided=Buffer.from(codeHash,"hex");if(expected.length!==provided.length||!timingSafeEqual(expected,provided))throw new RequestError(422,"收容所合作代碼無效。");
  const {data:created,error}=await admin.auth.admin.createUser({email:input.email,password:input.password,email_confirm:true,app_metadata:{shelterlab_role:"shelter"}});if(error||!created.user)throw new RequestError(422,error?.message?.includes("registered")?"此電子郵件已經註冊。":"目前無法建立收容所帳號。");
  const userId=created.user.id;const {error:bindError}=await admin.rpc("bind_shelter_account",{p_user_id:userId,p_code_id:invitation.id});
  if(bindError){await admin.auth.admin.deleteUser(userId);throw new RequestError(409,"合作代碼已被使用，帳號未建立。");}
  return{ok:true};
});}
