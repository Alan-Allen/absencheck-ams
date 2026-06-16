# AbsenCheck AMS - 考勤管理系統

這是一款基於 React (Vite) + Node.js (Express) + PostgreSQL 開發的輕量化考勤管理系統，並透過 Docker Compose 實作全容器化部署。

---

## 核心設計原則

### 1. 開課日誌主導防線 (classrecords)

* **無紀錄不放行**：不論是即時看板還是歷史查詢，只要 `classrecords` 在該日期沒有開課紀錄，後端一律立即攔截並阻斷，不盲目調取學生名單明細，將記憶體消耗降至最低。
* **權限鎖死**：若當天某門課程未預先註冊開課，學生端完全無法進行簽到。

### 2. 純淨二元狀態

* **取消遲到機制**：系統全面移除遲到判定，只專注處理「出席」與「缺席」兩種狀態。
* **二元狀態**：學生簽到成功硬性寫入為「出席」；未簽到者透過 `LEFT JOIN` 預設顯示為「缺席」。

### 3. 看板與歷史分流

* **今日即時看板 (DashboardView)**：採用實時計算，學生簽到成功後，大看板數據（應到人數、出席率、未簽到人數）隨之即時跳動與同步更新。
* **歷史出缺席日誌 (HistoryView)**：一旦點名通道封存（透過手動或深夜排程），歷史頁面直接讀取寫死在 `classrecords` 裡的統計欄位數值（`Present`, `Absent`），確保讀取效能並防止歷史數據遭竄改。

### 4. 資料庫大小寫約束

* 底層實體表（如 `studentlist`、`studentrecords`、`classrecords`）皆為全小寫。
* 涉及修課名單或特定欄位比對時，原生 SQL 查詢語句嚴格採用完整路徑與雙引號對齊（如 `studentlist."StdNumber"`），避免引發 PostgreSQL 報錯。

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

```

---

## 快速開始與部署

### 環境準備

* 確保主機已安裝 Docker 與 Docker Compose。
* 確保埠口 `3000` (前端) 與 `8080` (後端) 未被佔用。

### 機密資料設定

請在 `backend/` 目錄下建立 `.env` 檔案，用於存放資料庫連線設定：

```text
DB_USER=postgres
DB_PASSWORD=admin1234
DB_NAME=amsdb
DB_HOST=ams-db
DB_PORT=5432

```

*註：`backend/.env` 已加入 `.gitignore`，切勿推上 Git 倉庫。*

### 啟動指令

於專案根目錄執行以下指令，即可一鍵編排並啟動所有服務：

```bash
docker compose up -d --build

```

* **前端網頁**：`http://localhost:3000`
* **後端 API**：`http://localhost:8080`

### 依賴套件更新

若修改了前後端的 `package.json`，請執行以下指令重新編排容器以更新內部的 `node_modules`：

```bash
docker compose up -d --build ams-frontend ams-backend

```