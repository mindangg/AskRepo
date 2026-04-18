# Repo RAG — Chat với Bất Kỳ GitHub Repository Nào

Đặt câu hỏi về bất kỳ codebase nào trên GitHub và nhận câu trả lời với trích dẫn chính xác file và số dòng. Chạy hoàn toàn local — không cần API key, không cần internet sau khi cài đặt.

---

## Nó làm gì?

Dán link GitHub → hệ thống tự clone repo, chia code thành các chunks nhỏ, nhúng vào vector database local, và cho phép bạn đặt câu hỏi bằng ngôn ngữ tự nhiên. Mỗi câu trả lời đều trích dẫn chính xác tên file và số dòng để bạn biết thông tin đó đến từ đâu.

---

## Yêu cầu

Trước khi bắt đầu, hãy đảm bảo đã cài đặt những thứ sau:

| Công cụ | Phiên bản | Tải về |
|---|---|---|
| Python | 3.11.14 | https://www.python.org |
| Node.js | 18+ | https://nodejs.org |
| Git | Bất kỳ | https://git-scm.com |
| Ollama | Mới nhất | https://ollama.ai |

---

## Cài đặt

### Bước 1 — Tải model về

Mở terminal và chạy:

```bash
ollama pull deepseek-coder:6.7b
```

Dung lượng khoảng 3.8GB. Chỉ cần tải một lần duy nhất.

### Bước 2 — Backend

```bash
cd backend

# Tạo môi trường ảo
python -m venv venv

# Kích hoạt môi trường ảo
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac / Linux

# Cài thư viện
pip install -r requirements.txt

# Tạo file cấu hình
copy .env.example .env       # Windows
cp .env.example .env         # Mac / Linux
```

Nội dung file `.env` của bạn nên như sau:

```env
CHROMA_PATH=./chroma_db
REPOS_PATH=./cloned_repos
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-coder:6.7b
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
COLLECTION_NAME=repo_rag
ANONYMIZED_TELEMETRY=False
```

Khởi động backend:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Nếu thấy dòng này là thành công:
```
INFO: Uvicorn running on http://0.0.0.0:8000
```

### Bước 3 — Frontend

Mở **terminal thứ hai**:

```bash
cd frontend
npm install
npm run dev
```

Nếu thấy dòng này là thành công:
```
VITE ready on http://localhost:5173
```

### Bước 4 — Khởi động Ollama

Mở **terminal thứ ba**:

```bash
ollama serve
```

---

## Chạy ứng dụng

Cả ba cần chạy cùng lúc:

| Dịch vụ | Terminal | Địa chỉ |
|---|---|---|
| Ollama | Terminal 1 | http://localhost:11434 |
| Backend | Terminal 2 | http://localhost:8000 |
| Frontend | Terminal 3 | http://localhost:5173 |

Mở **http://localhost:5173** trên trình duyệt.

---

## Cách sử dụng

**1. Index một repository**

Dán bất kỳ link GitHub public nào vào ô nhập liệu và nhấn **Index**.

```
https://github.com/pallets/flask
```

Lần đầu index sẽ tải thêm embedding model (~130MB). Chỉ xảy ra một lần duy nhất.

**2. Đặt câu hỏi**

Sau khi index xong, nhấn vào thẻ repo và bắt đầu hỏi:

- *"Routing hoạt động như thế nào?"*
- *"Authentication được xử lý ở đâu?"*
- *"Hàm run làm gì?"*
- *"Kết nối database được quản lý như thế nào?"*

**3. Đọc trích dẫn**

Mỗi câu trả lời đều có tên file và số dòng chính xác. Nhấn **show code** trên bất kỳ trích dẫn nào để xem đoạn code liên quan.

---

## Ví dụ câu trả lời

**Câu hỏi:** Request context được quản lý ở đâu?

**Trả lời:**
```
File: src/flask/ctx.py
Dòng: 210-248

Request context được quản lý thông qua class RequestContext.
Nó được đẩy vào một local stack qua push() và được lấy ra
sau khi request hoàn tất. Phương thức app.wsgi_app() xử lý
vòng đời này tự động cho mỗi request đến.
```

---

## Mẹo tối ưu hiệu suất

**Nếu phản hồi chậm hoặc bị timeout:**

Model chạy trên CPU nếu bạn không có GPU NVIDIA. Một số cách giúp nhanh hơn:

- Đóng các tab trình duyệt và ứng dụng không cần thiết để giải phóng RAM
- Giảm số chunks gửi lên model — trong `config.py` đặt `TOP_K_FINAL = 3`
- Giảm context window — trong `llm/ollama_client.py` đặt `num_ctx = 4096`
- Tăng timeout — trong `llm/ollama_client.py` đặt `timeout = 300`

**Nếu bạn có GPU NVIDIA:**

Kiểm tra Ollama có đang dùng GPU không:

```bash
nvidia-smi
```

Nếu card GPU xuất hiện, Ollama sẽ tự động dùng nó và phản hồi sẽ nhanh hơn rất nhiều (khoảng 10 giây thay vì 3 phút).

---

## Cấu trúc dự án

```
repo-rag/
├── backend/
│   ├── main.py               # Điểm khởi động FastAPI
│   ├── config.py             # Toàn bộ cấu hình
│   ├── requirements.txt      # Thư viện Python
│   ├── .env.example          # Template cấu hình
│   ├── ingestion/            # Clone và thu thập file repo
│   ├── chunking/             # Chia file thành chunks
│   ├── embeddings/           # Tạo embeddings (BGE-small)
│   ├── retrieval/            # Tìm kiếm Vector + BM25
│   ├── llm/                  # Ollama API client
│   └── api/                  # FastAPI routes
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   └── api/client.js
    ├── vite.config.js
    └── package.json
```

---

## API endpoints

| Phương thức | Endpoint | Mô tả |
|---|---|---|
| POST | `/index` | Index một GitHub repository |
| POST | `/chat` | Đặt câu hỏi về repo đã index |
| GET | `/repos` | Liệt kê tất cả repo đã index |

---

## Xử lý lỗi thường gặp

**`OPTIONS /index 400 Bad Request`**
CORS preflight thất bại. Đảm bảo `main.py` có `OPTIONS` trong `allow_methods`.

**`LLM response timed out`**
Model chạy quá chậm. Giải phóng RAM, giảm `TOP_K_FINAL` trong `config.py`, hoặc tăng timeout lên 300 giây trong `llm/ollama_client.py`.

**`Model not found in Ollama`**
Chạy `ollama pull deepseek-coder:6.7b` và đảm bảo `OLLAMA_MODEL=deepseek-coder:6.7b` trong file `.env`.

**`No supported code files found`**
Repository có thể là private, rỗng, hoặc chỉ chứa file binary.

**Cảnh báo telemetry trong terminal**
```
Failed to send telemetry event: capture() takes 1 positional argument
```
Đây là lỗi của ChromaDB, không ảnh hưởng gì. Thêm `ANONYMIZED_TELEMETRY=False` vào `.env` để tắt.

---

## Cách hoạt động

```
Link GitHub
    ↓
Clone repo về máy local
    ↓
Thu thập tất cả file code (.py, .js, .ts, .go, ...)
    ↓
Chia thành các chunks 1000–1500 token, overlap 200 token
    ↓
Tạo embeddings với BAAI/bge-small-en-v1.5
    ↓
Lưu vào ChromaDB (lưu trữ trên ổ cứng)
    ↓
Khi có câu hỏi: Tìm kiếm kết hợp (Vector + BM25)
    ↓
Rerank với cross-encoder/ms-marco-MiniLM-L-6-v2
    ↓
Gửi top chunks + câu hỏi tới deepseek-coder:6.7b qua Ollama
    ↓
Trả về câu trả lời kèm trích dẫn file và số dòng
```
