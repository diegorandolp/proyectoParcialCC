import {useState} from "react";

function Chat(){
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [model, setModel] = useState('gemini-pro');

    // const response = document.getElementById('response')
    const url = 'http://127.0.0.1:8000/messages';


    async function getAIResponse(request){
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
    async function processMessage(question, model_){
        // const lista = document.getElementById("miLista").value;
        // const conversation = document.getElementById("conversationId").value;
        const data = {
            content: question,
            conversation_id: 4,
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


    const handleSend = async () => {
        if (input.trim() === '') return;

        const userMessage = { sender: 'user', text: input };
        setMessages([...messages, userMessage]);

        try {
            const response =  await processMessage(input, model);

            console.log("klok");
            const botMessage = { sender: 'bot', text: response.content };
            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Error:', error);
        }

        setInput('');
    };

    return (
        <div className="app">
            <div className="chat-window">
                <div className="messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.sender}`}>
                            {message.text}
                        </div>
                    ))}
                </div>
                <div className="input-container">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' ? handleSend() : null}
                        placeholder="Type your message..."
                    />

                    <label htmlFor="miLista">Modelo: </label><select value={model}
                                                                     onChange={(e) => setModel(e.target.value)}>
                    <option value="gpt-4-1106-preview">GPT 4</option>
                    <option value="gemini-pro">Gemini</option>
                </select> <br/>

                    <button onClick={handleSend}>Send</button>
                </div>
            </div>
        </div>
    );
}

export default Chat;