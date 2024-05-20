from fastapi import FastAPI, Request, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient 
import requests
from bson import ObjectId   
import os


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


def connect_to_server():
    client = MongoClient("mongodb://localhost:27017/")
    db_name = "Cloud_Computing-Entrega_parcial"
    collection_name = "Audio"
    db = client[db_name] #<- data base name
    collection = db[collection_name] #<- collection name
    return client, collection
# documents  = collection.find_one()
# print(dumps(documents))
# output = [{item: data[item] for item in data if item != '_id'} for data in documents]


def disconnect_from_server(client):
    client.close()


@app.get("/all_audio")
def get_all_images():
    try:
        client, collection = connect_to_server()
        documents_list = collection.find()
        documents = [doc for doc in documents_list]
        disconnect_from_server(client)
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=(e))



# json de entrada:
# {
#     name: file name,
#     file: formFile(),
#     id: si se puede
# }
@app.get("/get_audio")
async def get_audio(request: Request):
    try:
        client, collection = connect_to_server()
        form = await request.form()
        filename_salida = str(form.get("name")) + ".mp3"
        audio_id = str(form.get("id"))
        consulta = {
            "_id": ObjectId(str(audio_id))
        }
        columnas = {"link":1,"_id":0}
        audio_file = collection.find_one(consulta,columnas)
        audio_path = "audio_files/" + str(audio_file["link"])
        disconnect_from_server(client)
        
        return FileResponse(path=audio_path,filename=filename_salida,media_type="audio/mpeg")  
    except Exception as e:
        raise HTTPException(status_code=500, detail=(e))

# body de entrada:
# {
#     name: file name,
#     file: File(),
# }
@app.post("/text_to_speech") # pasar de texto a audio
async def text_to_speech(request: Request):
    try:
        client, collection = connect_to_server()
        form = await request.form()
        name = form.get("name")
        inputText = str(form.get("textInput"))
        
        API_URL = "https://api.openai.com/v1/audio/speech"
      
        payload = {
            "model": "tts-1",
            "input": inputText,
            "voice": "alloy"
        }
        headers = {
            "Authorization": f"Bearer {API_TOKEN}"
        }
        response = requests.post(API_URL, headers=headers, json=payload)
        audio_path = "./audio_files/" + str(name) + ".mp3"

        UPLOAD_DIRECTORY = "./audio_files"
        if not os.path.exists(UPLOAD_DIRECTORY):
            os.makedirs(UPLOAD_DIRECTORY)
        data = {
            "name": str(name),
            "link": str(name) + ".mp3"
        }
        collection.insert_one(data)
        disconnect_from_server(client)

        file_location = os.path.join(UPLOAD_DIRECTORY, str(name) + ".mp3")
        with open(file_location, "wb") as buffer:
            buffer.write(response.content)

        return FileResponse(path=audio_path, filename=str(name) + ".mp3",media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=(e))

@app.post("/create_music") # pasar de texto a musica
async def text_to_music(request: Request):
    try:
        client, collection = connect_to_server()
        form = await request.form()
        name = form.get("name")
        inputText = str(form.get("textInput"))
        

        API_URL = "https://api-inference.huggingface.co/models/facebook/musicgen-small"
        API_TOKEN = "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"
        payload = {
            "inputs": inputText
        }
        headers = {
            "Authorization": f"Bearer {API_TOKEN}"
        }
        response = requests.post(API_URL, headers=headers, json=payload)
        audio_path = "./audio_files/" + str(name) + ".mp3"

        
        UPLOAD_DIRECTORY = "./audio_files"
        if not os.path.exists(UPLOAD_DIRECTORY):
            os.makedirs(UPLOAD_DIRECTORY)
        data = {
            "name": str(name),
            "link": str(name) + ".mp3"
        }
        file_location = os.path.join(UPLOAD_DIRECTORY, str(name) + ".mp3")
        with open(file_location, "wb") as buffer:
            buffer.write(response.content)
        collection.insert_one(data)
        disconnect_from_server(client)
        
        return FileResponse(path=audio_path, filename=str(name) + ".mp3",media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=(e))



@app.delete("/delete_all") 
async def delete_all_audio_documents():
    try:
        client, collection = connect_to_server()
        response = collection.delete_many()
        # documents = [attr for attr in response]
        disconnect_from_server(client)
        response_condition = {
            "condition" : False
        }
        if response.acknowledged:
            response_condition["condition"] = True
        return response_condition
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

