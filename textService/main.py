from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware


models.Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:63342",
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/messages", response_model=list[schemas.Message])
def read_messages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    messages = crud.get_messages(db, skip=skip, limit=limit)
    return messages

@app.get("/c/{conversation_id}", response_model=list[schemas.Message])
def read_conversation(conversation_id: int, db: Session = Depends(get_db)):
    messages = crud.get_conversation(db, conversation_id=conversation_id)
    return messages

@app.get("/messages/{message_id}", response_model=schemas.Message)
def read_message(message_id: int, db: Session = Depends(get_db)):
    db_message = crud.get_message(db, message_id=message_id)
    if db_message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    return db_message

@app.post("/messages", response_model=schemas.Message)
def create_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    #db_message = 
    #if db_message is None:
    #    raise HTTPException(status_code=404, detail="Message not found")
    return crud.create_message(db, message)

@app.post("/messagesGemini", response_model=schemas.MessageProcess)
def create_messageGemini(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    #db_message = 
    #if db_message is None:
    #    raise HTTPException(status_code=404, detail="Message not found")
    return crud.create_messageGemini(db, message)




#@app.put("/messages/{message_id}")
#def update_message(message_id: int, message: Message):
#    return {"message_content": message.content, "conversation_id": message.conversation_id, "message_id": message_id}

#@app.delete("/messages/{message_id}")
#def delete_message(message_id: int):
#    return {"message_id": message_id}
