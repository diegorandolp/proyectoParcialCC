from fastapi import FastAPI, Request, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
from bson import ObjectId
import os
import PIL.Image 
import google.generativeai as genai 
from pymongo import MongoClient

app = FastAPI()

# Configuración de CORS
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000"  # Agrega aquí los orígenes permitidos según tu caso
    # Puedes agregar más orígenes permitidos según sea necesario
]
API_TOKEN = "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"
API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
headers = {"Authorization": f"Bearer {API_TOKEN}"}


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
    collection_name = "Images"
    db = client[db_name] #<- data base name
    collection = db[collection_name] #<- collection name
    return client, collection
# documents  = collection.find_one()
# print(dumps(documents))
# output = [{item: data[item] for item in data if item != '_id'} for data in documents]


def disconnect_from_server(client):
    client.close()


@app.get("/all_images")
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
@app.post("/get_image")
async def get_image(request: Request):
    try:
        client, collection = connect_to_server()
        form = await request.form()
        filename_salida = str(form.get("name")) + ".mp3"
        audio_id = str(form.get("id"))
        consulta = {
            "_id": ObjectId(str(audio_id))
        }
        columnas = {"link":1,"_id":0}
        image_file = collection.find_one(consulta,columnas)
        image_path = image_file["link"]
        disconnect_from_server(client)
        
        return FileResponse(path=image_path,filename=filename_salida,media_type="image/jpeg")  
    except Exception as e:
        raise HTTPException(status_code=500, detail=(e))

# body de entrada:
# {
#     name: file name,
#     file: File(),
# }
@app.post("/text_to_image") #insertar texto y conseguir una imagen
async def insert_one_image(request: Request):
    try:
        client, collection = connect_to_server()
        form = await request.form()
        name = form.get("name")
        inputText = str(form.get("input"))
        payload = {
            "inputs":inputText
        }
        response = requests.post(API_URL, headers=headers, json=payload)
        
        UPLOAD_DIRECTORY = "./image_files"
        if not os.path.exists(UPLOAD_DIRECTORY):
            os.makedirs(UPLOAD_DIRECTORY)
        data = {
            "name": str(name),
            "link": str(name) + ".jpg"
        }
        file_location = os.path.join(UPLOAD_DIRECTORY, str(name) + ".jpg")
        with open(file_location, "wb") as buffer:
            buffer.write(response.content)
        response = collection.insert_one(data)
        disconnect_from_server(client)

        
        image_path = "./image_files" + str(name) + ".jpg"
        filename_salida = str(name) + ".jpg"
        return FileResponse(path=image_path,filename=filename_salida,media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=(e))

@app.post("/image_to_text")#insertar imagen y conseguir texto
async def get_image_from_text(request: Request):
    try:
        client, collection = connect_to_server()
        form = await request.form()
        name = form.get("name")
        file: UploadFile = form.get("imgInput")
        description = str(form.get("description"))

        UPLOAD_DIRECTORY = "./image_files"
        if not os.path.exists(UPLOAD_DIRECTORY):
            os.makedirs(UPLOAD_DIRECTORY)

        file_location = os.path.join(UPLOAD_DIRECTORY, str(name) + ".jpg")
        with open(file_location, "wb") as buffer:
            buffer.write(await file.read())
        
        img = PIL.Image.open("./image_files/" + str(name) + ".jpg")
        GOOGLE_API_KEY='AIzaSyD9M_AH_hpKMonOaZs10TgfPOdel9gZ5OE' 
        genai.configure(api_key=GOOGLE_API_KEY) 
        model = genai.GenerativeModel('gemini-pro-vision') 
        response = model.generate_content([description, img], stream=True) 
        response.resolve()

        data = {
            "name": str(name),
            "link": str(name) + ".jpg"
        }
        collection.insert_one(data)
        disconnect_from_server(client)


        return JSONResponse(content={
            "text":response.text
        })
    except HTTPException as e:
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

