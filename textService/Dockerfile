# Utiliza la imagen oficial de Python como base
FROM python:3.10-slim

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el código de la aplicación al directorio de trabajo
COPY . .

# Instala las dependencias necesarias
RUN pip install --no-cache-dir -r requirements.txt

# Expone el puerto en el que FastAPI servirá la aplicación
EXPOSE 8000

# Comando para ejecutar la aplicación FastAPI utilizando uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
