import SettingsForm from "./settings-form";
export default function SettingsPage() { return <main className="mx-auto max-w-3xl px-5 py-10"><h1 className="text-3xl font-bold">教師設定</h1><p className="my-4">填寫五項班級資訊即可開始。縣市由學校名錄自動帶入，不需要詳細地址。</p><SettingsForm /></main>; }
