# 動保行動機會雷達：prototype 邊界

目前實作使用瀏覽器 localStorage，示範搜尋、偏好、收藏、申請、合作單位刊登、管理審核與站內通知流程。示範資料不代表任何單位目前正在招募，也不會將申請送到外部。

## 未來後端工作

- 建立 opportunity、source、subscription、notification、application、review audit 資料表。
- 依學生、教師、合作單位與管理員角色實作資料列權限；service role key 只能存在伺服器端。
- 建立排程與來源 adapter，串接官方 API／RSS；網站資料需逐站確認授權與格式。
- 建立來源正規化、重複比對、人工審核及長期未更新的待確認流程。
- 建立 Email／Web Push opt-in、退訂、錯誤重試與通知稽核。
- 對未成年申請加入教師／家長確認與管理員可檢視的結構化通訊紀錄。
