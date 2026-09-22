# ShelterLab 學生地圖交接說明

更新日期：2026-09-15  
Repository：`oysunny752-maker/shelterlab`  
指定分支：`feature/student-map`  
交接基準 Commit：`03f054ee8c3bb1827324d335193bd208aeec1e6b`

## 給接手隊友

這是私人 Repository。請先確認你的 GitHub 帳號已取得 Repository 存取權，再於自己的電腦執行：

```powershell
git clone --branch feature/student-map --single-branch https://github.com/oysunny752-maker/shelterlab.git shelterlab-student-map
cd shelterlab-student-map
npm install
npm run dev
```

終端機出現 `Ready` 後，開啟畫面顯示的最新 localhost 網址。

若已經 clone 過：

```powershell
cd 你的專案資料夾
git switch feature/student-map
git pull --ff-only origin feature/student-map
npm install
npm run dev
```

也可以使用根目錄內的：

- `更新ShelterLab.cmd`：取得 `feature/student-map` 最新版本。
- `修復並啟動ShelterLab.cmd`：關閉本專案舊的開發程序、清除 Next.js 暫存並重新啟動。

## 目前完成進度

第一週學生關卡已完成下列調整：

1. 四種犬隻介紹改為獨立翻面卡片。
2. 角色轉換站包含家庭犬、工作犬、校犬與街頭犬四條路徑。
3. 點選路徑後直接顯示「可能獲得」與「可能承受」。
4. 四條路徑各有獨立配套挑戰。
5. 每關有三顆心；放錯扣一顆，歸零時重新開始該關。
6. 每張卡片提供正確或錯誤原因及教學依據。
7. 完成的路徑會打勾並鎖定，完成四條路徑後進入影像觀察站。
8. 影像觀察站包含愛學網《校犬豆豆1》官方頁面與三題責任小測驗。
9. Open Data 個案改為灰黑毛色犬隻入所天數的資料判讀題。
10. 角色轉換情境圖已換成完整構圖，左上家庭與右上消防員不再被裁掉。

## 主要檔案

- `app/student/week/[week]/_components/week-one-game.tsx`
  - 第一週流程、四路選擇、心數、完成狀態、影像測驗及 Open Data 題目。
- `app/student/week/[week]/_components/week-one-game.module.css`
  - 第一週完整 UI、翻面卡片、角色選擇、配套箱、心數與測驗樣式。
- `app/student/_components/student-learning-progress.tsx`
  - 學生進度與 localStorage 保存機制。
- `public/student/week-one/stray-role-crossroads-full.webp`
  - 完整版四路角色轉換情境圖。
- `更新ShelterLab.cmd`
  - Windows 一鍵更新腳本。
- `修復並啟動ShelterLab.cmd`
  - Windows 清除暫存並啟動腳本。

## 進度資料注意事項

- 學習紀錄保存在瀏覽器 localStorage，Key 為 `shelterlab-learning-progress-v2`。
- 四條路徑完成狀態保存在 `weekOne.sourceTags`，格式為：
  - `path:home`
  - `path:work`
  - `path:school`
  - `path:street`
- 四項完成判斷使用指定路徑逐項確認，不能再改回單純計算標籤數量。
- 若測試需要完全重玩，可使用第一週完成頁的「重新體驗第一週」。除錯時也可在瀏覽器開發者工具清除上述 localStorage 項目。

## 已知注意事項

- 愛學網官方頁面可能設定禁止 iframe 內嵌。畫面已保留「在愛學網開啟官方影片」連結。
- Open Data 題目目前使用條件式敘述。只要修改毛色、入所天數、統計數字、圖表或資料來源，必須重新查核政府官方原始資料並驗證整理結果。
- 修改第一週導覽時，請測試：
  1. 四條路徑能依任意順序完成。
  2. 完成後能回到角色選擇頁。
  3. 已完成路徑不能重複挑戰。
  4. 第四條路徑完成後能進入影像觀察站。
  5. 重新整理瀏覽器後仍能依紀錄繼續。

## 建議接手 GPT 的第一段指令

```text
請先閱讀根目錄 HANDOFF-STUDENT-MAP.md，確認目前位於 feature/student-map 分支，
再檢查 app/student/week/[week]/_components/week-one-game.tsx、
week-one-game.module.css 與 student-learning-progress.tsx。
保留既有四路闖關、三顆心、完成鎖定與 localStorage 進度機制。
任何涉及圖表、數據、數字敘述或資料來源的修改，都要回查官方原始資料並驗證後再改。
完成修改後請執行 typecheck、build 或相關測試，並清楚回報 Commit。
```
