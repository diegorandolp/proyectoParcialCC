from sqlalchemy.orm import Session
from openai import OpenAI

import google.generativeai as genai

import os
from dotenv import load_dotenv

from . import models, schemas



def get_message(db: Session, message_id: int):
    return db.query(models.Message).filter(models.Message.id == message_id).first()

def get_messages(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Message).offset(skip).limit(limit).all()

def get_conversation(db: Session, conversation_id: int):
    return db.query(models.Message).filter(models.Message.conversation_id == conversation_id).all()

def create_message(db: Session, message: schemas.MessageCreate):

    db_message = models.Message(content=message.content, conversation_id=message.conversation_id, rol='user', ai_model=message.ai_model)
    db.add(db_message)
    #db.commit()
    #db.refresh(db_message)

    aiMessage = process_message(db, db_message)
    db_ai_message = models.Message(content=aiMessage.content, conversation_id=aiMessage.conversation_id, rol='system', ai_model=message.ai_model)
    db.add(db_ai_message)

    db.commit()
    db.refresh(db_ai_message)
    return db_ai_message


def process_message(db: Session, message: models.Message):

    if(message.ai_model[0:3] == 'gpt'):
        return process_messageGPT(db, message)
    else:
        return process_messageGemini(db, message)


def process_messageGPT(db: Session, message: models.Message):
    client = OpenAI()

    question = message.content;

    completion = client.chat.completions.create(
        model=message.ai_model,
        messages=[
            {"role": "system", "content": "You are an assistant who gives consice answers to questions."},
            {"role": "user", "content": question}
            ]
    )
    ai_message = schemas.MessageProcess(content=completion.choices[0].message.content, conversation_id=message.conversation_id,ai_model=message.ai_model)

    return ai_message

def process_messageGemini(db: Session, message: models.Message):
    load_dotenv()
    geminiKey = os.getenv('GOOGLE_API_KEY')

    genai.configure(api_key=geminiKey)
    #gemini-pro
    model = genai.GenerativeModel(message.ai_model)
    response = model.generate_content(message.content)

    ai_message = schemas.MessageProcess(content=response.text, conversation_id=message.conversation_id, ai_model=message.ai_model)

    return ai_message
