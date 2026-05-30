from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import Text
from sqlalchemy.sql import func

from database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )


class UserDocument(Base):

    __tablename__ = "user_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    filename = Column(String, nullable=False)
    indexed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserRagState(Base):

    __tablename__ = "user_rag_state"

    user_id = Column(Integer, primary_key=True, index=True)
    total_documents = Column(Integer, default=0)
    total_chunks = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ChatMessage(Base):

    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    sources_used = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())