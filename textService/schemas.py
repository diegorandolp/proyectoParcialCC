from pydantic import BaseModel


class MessageBase(BaseModel):
    content: str
    conversation_id: int
    ai_model: str
 

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    rol: str

    class Config:
        orm_mode = True
    
class MessageProcess(MessageBase):
    pass