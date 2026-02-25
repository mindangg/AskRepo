from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(title="Repo RAG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

### `backend/requirements.txt`
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
pydantic==2.7.1
python-dotenv==1.0.1
chromadb==0.5.23
sentence-transformers==2.7.0
rank-bm25==0.2.2
requests==2.31.0
numpy==1.26.4
torch==2.3.0
transformers==4.41.0
huggingface-hub==0.23.2
tqdm==4.66.4