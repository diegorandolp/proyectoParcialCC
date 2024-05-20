from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from .database import Base

# aca van las clases que interactuan con la base de datos
class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    conversation_id = Column(Integer)
    rol = Column(String)
    ai_model = Column(String)
