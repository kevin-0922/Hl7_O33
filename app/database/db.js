const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 確認數據庫目錄存在
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  console.log(`數據庫目錄不存在，正在創建: ${dbDir}`);
  fs.mkdirSync(dbDir, { recursive: true });
} else {
  console.log(`數據庫目錄已存在: ${dbDir}`);
}

// 設置數據庫文件路徑
const dbPath = path.join(dbDir, 'hl7_messages.db');
console.log(`數據庫文件路徑: ${dbPath}`);

// 創建連接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('連接數據庫失敗:', err.message);
  } else {
    console.log(`成功連接到 SQLite 數據庫: ${dbPath}`);
    initializeDatabase();
  }
});

// 初始化數據庫表
function initializeDatabase() {
  console.log('開始初始化數據庫表...');
  
  // 使用序列化操作確保表按順序創建
  db.serialize(() => {
    // 創建發送消息表
    db.run(`CREATE TABLE IF NOT EXISTS sent_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_type TEXT NOT NULL,
      message_control_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      receiver TEXT NOT NULL,
      message_content JSON NOT NULL, 
      status TEXT DEFAULT 'sent',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('創建 sent_messages 表失敗:', err.message);
      } else {
        console.log('sent_messages 表已創建或已存在');
      }
    });

    // 創建接收消息表
    db.run(`CREATE TABLE IF NOT EXISTS received_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_type TEXT NOT NULL,
      message_control_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      receiver TEXT NOT NULL,
      message_content JSON NOT NULL,  -- 改為 JSON 格式，儲存結構化的 HL7 訊息
      status TEXT DEFAULT 'received',
      response_message_id INTEGER,
      received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (response_message_id) REFERENCES sent_messages (id)
    )`, (err) => {
      if (err) {
        console.error('創建 received_messages 表失敗:', err.message);
      } else {
        console.log('received_messages 表已創建或已存在');
      }
    });
    
    // 創建切片排程表
    db.run(`CREATE TABLE IF NOT EXISTS slicing_schedule (
      order_id TEXT PRIMARY KEY,
      message_content JSON NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('創建 slicing_schedule 表失敗:', err.message);
      } else {
        console.log('slicing_schedule 表已創建或已存在');
      }
    });
    
    // 檢查數據庫表是否存在和工作正常
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='sent_messages'", (err, row) => {
      if (err) {
        console.error('檢查表結構失敗:', err.message);
      } else if (row) {
        console.log('確認: sent_messages 表存在並可訪問');
      } else {
        console.warn('警告: sent_messages 表似乎未成功創建');
      }
    });
    
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='received_messages'", (err, row) => {
      if (err) {
        console.error('檢查表結構失敗:', err.message);
      } else if (row) {
        console.log('確認: received_messages 表存在並可訪問');
      } else {
        console.warn('警告: received_messages 表似乎未成功創建');
      }
    });
    
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='slicing_schedule'", (err, row) => {
      if (err) {
        console.error('檢查表結構失敗:', err.message);
      } else if (row) {
        console.log('確認: slicing_schedule 表存在並可訪問');
      } else {
        console.warn('警告: slicing_schedule 表似乎未成功創建');
      }
    });
    
    // 執行數據庫測試查詢
    console.log('執行數據庫測試查詢...');
    db.get("SELECT COUNT(*) as count FROM sent_messages", (err, row) => {
      if (err) {
        console.error('測試查詢 sent_messages 失敗:', err.message);
      } else {
        console.log(`測試查詢成功: sent_messages 表中有 ${row.count} 條記錄`);
      }
    });
    
    db.get("SELECT COUNT(*) as count FROM received_messages", (err, row) => {
      if (err) {
        console.error('測試查詢 received_messages 失敗:', err.message);
      } else {
        console.log(`測試查詢成功: received_messages 表中有 ${row.count} 條記錄`);
      }
    });
    
    db.get("SELECT COUNT(*) as count FROM slicing_schedule", (err, row) => {
      if (err) {
        console.error('測試查詢 slicing_schedule 失敗:', err.message);
      } else {
        console.log(`測試查詢成功: slicing_schedule 表中有 ${row.count} 條記錄`);
      }
    });
    
    console.log('===== HL7 消息數據庫初始化完成 =====');
  });
}

// promise包裝的查詢函數
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('SQL 查詢錯誤:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// promise包裝的獲取單行函數
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('SQL 獲取錯誤:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// promise包裝的執行函數
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('SQL 執行錯誤:', err);
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// 監聽進程結束，關閉數據庫連接
process.on('SIGINT', () => {
  console.log('接收到終止信號，關閉數據庫連接...');
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('關閉數據庫失敗:', err.message);
      } else {
        console.log('數據庫連接已關閉');
      }
      process.exit(0);
    });
  } else {
    console.log('數據庫連接已關閉');
    process.exit(0);
  }
});

// 在 db.js 中
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('SQL 錯誤:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}


module.exports = { db, query, get, run,all }; 