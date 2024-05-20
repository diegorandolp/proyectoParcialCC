import { createContext, useState } from "react";

export const Context = createContext(
    {
    prevPrompts: [],
    recentPrompt: '',
    showResult: false,
    loading: false,
    resultData: "",
    input: '',
    model: 'gemini-pro',
    currentConversation: 1,
        messages: []
}
);

const ContextProvider = (props) => {
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [recentPrompt, setRecentPrompt] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [input, setInput] = useState('');
    const [model, setModel] = useState('gemini-pro');
    const[currentConversation, setCurrentConversation] = useState(1);
    const[changedConversation, setChangedConversation] = useState(false);

    const [messages, setMessages] = useState([]);


    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        recentPrompt,
        setRecentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        setShowResult,
        setLoading,
        setResultData,
        model,
        setModel,
        newChat,
        currentConversation,
        setCurrentConversation,
        getConversation,
        messages,
        setMessages,
        changedConversation,
        setChangedConversation,
        buttonAudio,
        buttonImage,
        streamToBlob,
    };

    function newChat  ()  {
        setShowResult(false);
        setLoading(false);
        setCurrentConversation(prev => prev + 1);
    }

    async function getConversation(ref){


        // const [loading, setLoading] = useState(true);
        // const [error, setError] = useState(null);
        const fetchMessages = async () => {
            try {
                console.log("fetch "+ currentConversation);
                const response = await fetch(`http://localhost:8000/c/${ref}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                return data;
            } catch (error) {
                console.log(error);
            }
        };
        return fetchMessages();

    }

    async function buttonAudio(){
        let urlmedia = 'http://localhost:8000/get_audio';
        fetch(urlmedia)
            .then(response => {
                if (!response.ok) {
                    throw new Error('La solicitud falló');
                }
                return response.body;
            })
            .then(stream => {
                streamToBlob(stream)
                    .then(blob => {
                        // Crear una URL de objeto (Object URL) a partir del Blob
                        const objectURL = URL.createObjectURL(blob);

                        // Obtener el elemento audio
                        const audioElement = document.getElementById('audio');

                        // Asignar la URL de objeto al atributo src del elemento audio
                        audioElement.src = objectURL;

                        // Reproducir el audio
                        audioElement.play();
                    })
                    .catch(error => {
                        console.error('Error al convertir el ReadableStream en Blob:', error);
                    });
            })
            .catch(error => {
                console.error('Error al obtener el ReadableStream:', error);
            });
    }

    async function buttonImage(){
        let urlimg = 'http://localhost:8000/get_image';
        fetch(urlimg,{
            method: 'GET'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('La solicitud no fue exitosa');
                }
                console.log(response)
                return response.blob();
            })
            .then(data => {
                const imageUrl = URL.createObjectURL(data);
                document.getElementById('image').src = imageUrl;
                console.log(data)
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function streamToBlob(stream) {
        return new Promise((resolve, reject) => {
            const reader = stream.getReader();
            const chunks = [];

            function read() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        resolve(new Blob(chunks));
                    } else {
                        chunks.push(value);
                        read();
                    }
                }).catch(error => {
                    reject(error);
                });
            }

            read();
        });
    }

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;