

echo "creando la base de datos"
docker run -d --rm --name mongo_c -p 27017:27017 -v mongo_data:/data/db mongo:latest

docker exec -it mongo_c bash

mongosh

use Cloud_Computing-Entrega_parcial

db.createCollection("Audio")
db.createCollection("Images")
exit
exit
