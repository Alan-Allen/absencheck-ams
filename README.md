# AbsenCheck AMS

AbsenCheck AMS (Attendance Management System) 是一款商用級的輕量化考勤管理系統，採用 **React (Vite) + Node.js (Express) + PostgreSQL** 的經典技術堆疊，並透過 **Docker Compose** 達成全容器化的一鍵部署。

本系統核心設計圍繞於「記憶體防禦閘門」與「數據防竄改快照」兩大安全性標準，並針對 PostgreSQL 的嚴格大小寫約束進行了底層標準化校正，確保前後端大動脈在最流暢、嚴謹的雙軌分流架構下穩定運行。

---

## 核心架構與防禦防線

### 1. 開課日誌主導防線 (classrecords)
為了徹底解決「將當天修課名單無條件全撈出來」導致記憶體空轉塞爆的效能痛點，後端引入了嚴格的攔截閘門：
* **無紀錄不放行**：不論是今日即時看板還是歷史查詢，只要該課程在特定日期於 `classrecords` 內沒有預先註冊的開課紀錄，後端 API 將立即攔截並阻斷，絕不盲目調取學生明細，將伺服器記憶體消耗降至最低。
* **簽到通道鎖死**：若某門課程未於管理端或資料庫預先啟用點名，學生端便完全無法對該課程進行任何簽到。

### 2. 純淨二元狀態業務邏輯
* **取消遲到判定**：考量到資料庫目前僅記錄日期（YMD）而無詳細課表分鐘級時間，且為杜絕學生自主宣告的作弊人性，系統已全面移除遲到機制。
* **二元狀態**：點名系統專注處理 **「出席」** 與 **「缺席」** 兩種純淨狀態。學生成功簽到一律硬性寫入為「出席」；未簽到者則透過大名單的 `LEFT JOIN` 於前端預設顯示為「缺席」。

### 3. 歷史快照防竄改機制
* **即時看板 (DashboardView)**：當天點名數據採用實時計算，學生觸發簽到時，大看板的統計卡片（應到、出席率、未簽到）會零延遲跳動同步更新。
* **歷史日誌 (HistoryView)**：一旦點名通道結算封存（可透過 `/api/class-records/freeze` 接口手動封存或經由深夜排程自動強制快照），歷史頁面的統計數據將不再動態數人頭，而是直接讀取寫死在 `classrecords` 裡的統計欄位數值（`Present`, `Absent`），兼顧極速讀取效能並防止歷史遭惡意竄改。

---

## 資料庫與大小寫約束規範 (PostgreSQL)

本專案底層實體表皆為全小寫規格（如 `studentlist`、`studentrecords`、`classrecords`）。由於 PostgreSQL 對於欄位大小寫與雙引號具有嚴格約束，任何後端原生 SQL 語句（Raw SQL）在涉及學號等特定欄位比對時，必須嚴格採用完整路徑與雙引號對齊：

* 正確撰寫範例：`studentlist."StdNumber"`、`classrecords."ClassId"`、`classrecords."YMD"`
* 嚴禁使用全小寫簡寫（如 `studentlist.stdnumber`），以避免引發資料庫 `500 Column does not exist` 報錯。

---

## 專案目錄結構

```text
roll_cal_system/
├── docker-compose.yml       # 多容器編排定義檔 (DB, Backend, Frontend)
├── backend/
│   ├── db.js                # PostgreSQL Pool 連線設定
│   ├── server.js            # Express 核心 API、路由與快照結算邏輯
│   └── package.json
└── frontend/
    ├── Dockerfile           # React (node:20-alpine) 容器化配置
    ├── vite.config.js       # Vite 設定（含前後端 http-proxy 代理）
    └── src/
        ├── CheckInView.jsx  # 學生自主簽到頁面（動態過濾今日開課、無課防護）
        ├── DashboardView.jsx# 今日即時統計看板（零延遲回饋、一鍵封存歷史）
        └── HistoryView.jsx  # 歷史出缺席日誌總覽（隨日期起舞選單、快照讀取）