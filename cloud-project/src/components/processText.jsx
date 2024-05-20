async function getAIResponse(request) {
    const url = 'http://127.0.0.1:8000/messages';
    let newResponse;
    await fetch(url, request)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.status);
            }
            return response.json(); // Parsea la respuesta JSON
        })
        .then(data => {
            newResponse = data;
        })
        .catch(error => {
            console.error('Error al realizar la solicitud:', error);
        });
    return newResponse;
}

export async function processMessage(question, model_, currentConversation) {
    // const lista = document.getElementById("miLista").value;
    // const conversation = document.getElementById("conversationId").value;
    const data = {
        content: question,
        conversation_id: currentConversation,
        ai_model: model_
    };
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Indica que el cuerpo de la solicitud es JSON
        },
        body: JSON.stringify(data) // Convierte el objeto JavaScript en una cadena JSON
    };
    let aIData = await getAIResponse(requestOptions);
    console.log(aIData);
    return aIData;
    // response.innerHTML = aIData.content + " " + aIData.conversation_id + " " + aIData.rol + " " + aIData.id + " "+ aIData.ai_model;
}
