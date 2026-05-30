import os

from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

from langchain_groq import ChatGroq

from schemas import QuestionSchema

from auth_dependency import get_current_user
from database import get_db
from models import UserDocument, UserRagState, ChatMessage

load_dotenv()

router = APIRouter(
    prefix="/rag",
    tags=["RAG"]
)

os.makedirs("uploads", exist_ok=True)
os.makedirs("chroma_db", exist_ok=True)


def _chroma_dir(user_id: int) -> str:
    return f"chroma_db/{user_id}"


def _upload_dir(user_id: int) -> str:
    return f"uploads/{user_id}"


def _is_indexed(user_id: int) -> bool:
    return os.path.exists(_chroma_dir(user_id))


def _get_user_files(db: Session, user_id: int) -> list[str]:
    rows = (
        db.query(UserDocument)
        .filter(UserDocument.user_id == user_id)
        .order_by(UserDocument.created_at.asc())
        .all()
    )
    return [row.filename for row in rows]


@router.get("/status")
def get_status(
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    files = _get_user_files(db, current_user)
    indexed = _is_indexed(current_user)
    rag_state = db.query(UserRagState).filter(UserRagState.user_id == current_user).first()

    pending_uploads = []
    upload_path = _upload_dir(current_user)
    if os.path.exists(upload_path):
        pending_uploads = [
            name for name in os.listdir(upload_path)
            if name.lower().endswith(".pdf")
        ]

    if not files and pending_uploads:
        files = pending_uploads

    if indexed:
        process_status = "ready"
    elif pending_uploads or files:
        process_status = "uploaded"
    else:
        process_status = "idle"

    return {
        "files": files,
        "process_status": process_status,
        "total_documents": rag_state.total_documents if rag_state else 0,
        "total_chunks": rag_state.total_chunks if rag_state else 0,
    }


@router.get("/chat/history")
def get_chat_history(
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return {
        "messages": [
            {
                "role": msg.role,
                "content": msg.content,
                "sources_used": msg.sources_used,
            }
            for msg in messages
        ]
    }


@router.post("/upload")
async def upload(
    files: list[UploadFile] = File(...),
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload_dir = _upload_dir(current_user)
    os.makedirs(upload_dir, exist_ok=True)

    uploaded_files = []

    for file in files:
        file_path = os.path.join(upload_dir, file.filename)

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        existing = (
            db.query(UserDocument)
            .filter(
                UserDocument.user_id == current_user,
                UserDocument.filename == file.filename,
            )
            .first()
        )

        if existing:
            existing.indexed = False
        else:
            db.add(
                UserDocument(
                    user_id=current_user,
                    filename=file.filename,
                    indexed=False,
                )
            )

        uploaded_files.append(file.filename)

    db.commit()

    return {
        "message": "Files uploaded successfully",
        "files": _get_user_files(db, current_user),
    }


@router.post("/process")
def process_documents(
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload_dir = _upload_dir(current_user)

    if not os.path.exists(upload_dir):
        raise HTTPException(
            status_code=404,
            detail="No uploaded documents found"
        )

    documents = []
    processed_names = []

    for file in os.listdir(upload_dir):
        if file.endswith(".pdf"):
            processed_names.append(file)
            loader = PyPDFLoader(os.path.join(upload_dir, file))
            documents.extend(loader.load())

    if not documents:
        raise HTTPException(
            status_code=404,
            detail="No PDF documents found"
        )

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    persist_dir = _chroma_dir(current_user)

    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=persist_dir
    )

    for file in os.listdir(upload_dir):
        os.remove(os.path.join(upload_dir, file))

    for name in processed_names:
        doc_row = (
            db.query(UserDocument)
            .filter(
                UserDocument.user_id == current_user,
                UserDocument.filename == name,
            )
            .first()
        )
        if doc_row:
            doc_row.indexed = True
        else:
            db.add(
                UserDocument(
                    user_id=current_user,
                    filename=name,
                    indexed=True,
                )
            )

    rag_state = db.query(UserRagState).filter(UserRagState.user_id == current_user).first()
    if rag_state:
        rag_state.total_documents = len(documents)
        rag_state.total_chunks = len(chunks)
    else:
        db.add(
            UserRagState(
                user_id=current_user,
                total_documents=len(documents),
                total_chunks=len(chunks),
            )
        )

    db.commit()

    return {
        "message": "Documents processed successfully",
        "total_documents": len(documents),
        "total_chunks": len(chunks),
        "files": _get_user_files(db, current_user),
    }


@router.post("/chat")
def chat(
    data: QuestionSchema,
    current_user: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    persist_dir = _chroma_dir(current_user)

    if not os.path.exists(persist_dir):
        raise HTTPException(
            status_code=404,
            detail="Please process documents first"
        )

    db.add(
        ChatMessage(
            user_id=current_user,
            role="user",
            content=data.question,
        )
    )

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vector_db = Chroma(
        persist_directory=persist_dir,
        embedding_function=embeddings
    )

    docs = vector_db.similarity_search(data.question, k=4)

    context = "\n\n".join([doc.page_content for doc in docs])

    llm = ChatGroq(model="llama-3.1-8b-instant")

    prompt = f"""
    You are a helpful AI assistant answering questions from uploaded documents.

    Rules:
    1. Use ONLY the provided context.
    2. If the answer is not present in the context, reply:
      "I could not find this information in the uploaded documents."
    3. Do not make up facts.
    4. Give concise and accurate answers.
    5. If numbers, dates, percentages, or names are present, include them exactly.
    6. When possible, quote the relevant information from the context.

    Context:
    ----------------
    {context}
    ----------------

    Question:
    {data.question}

    Answer:
    """

    response = llm.invoke(prompt)
    answer = response.content
    sources_used = len(docs)

    db.add(
        ChatMessage(
            user_id=current_user,
            role="assistant",
            content=answer,
            sources_used=sources_used,
        )
    )
    db.commit()

    return {
        "question": data.question,
        "answer": answer,
        "sources_used": sources_used,
    }
