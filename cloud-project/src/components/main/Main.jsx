
import {useContext, useState} from 'react';
import './Main.css'
import {assets} from "../../assets/assets.js";
import {processMessage} from "../processText.jsx"
import {Context} from "../../Context.jsx";
import Conversation from "./Conversation.jsx";


function Main() {

    const {prevPrompts,
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
        currentConversation,
        setCurrentConversation,
        changedConversation,
        messages} = useContext(Context);


    let formatedResponse = "" ;
    const handleSend = async () => {

        let splitedRespose = "";
        setResultData("");
        setLoading(true);
        setShowResult(true);
        setRecentPrompt(input);

        const newConversation = { conversationId: currentConversation, title: input };
        setPrevPrompts(prev=>[...prev, newConversation]);

        const response = await processMessage(input, model, currentConversation);

        let rawResponse = response.content;
        rawResponse = rawResponse.replace(/(?:\r\n|\r|\n)/g, '<br>');
        splitedRespose = rawResponse.split("**");
        for (let i = 0; i < splitedRespose.length; i++) {
            if (i % 2 === 0){
                formatedResponse += splitedRespose[i];
            } else{
                formatedResponse += "<b>" + splitedRespose[i] + "</b>";
            }
        }
        formatedResponse = formatedResponse.split("```");
        let formatedResponseTwo = "";

        for (let i = 0; i < formatedResponse.length; i++) {
            if (i % 2 === 0){
                formatedResponseTwo += formatedResponse[i];
            } else{
                formatedResponseTwo += "<div style=\"background-color: black; border-radius: 15px\"><p style=\"color: azure; font-size: 14px; font-weight: 300; line-height: 1.8; padding: 10px\">" + formatedResponse[i] + "</p></div>";
            }
        }
        console.log(formatedResponseTwo);
        // formatedResponseTwo = formatedResponseTwo.split("*").join(" <br>");
        setResultData(formatedResponseTwo);
        console.log("klok");
        setLoading(false);
        setInput('');

    };
    // ---------------- Images ----------------

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Selecciona un archivo antes de subirlo.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('http://127.0.0.1:8000/image_to_text', {
                method: 'POST',
                description: input,
                imgInput: formData,
                name: currentConversation,
                type: 3 // 2 audio, 1 text
            });

            if (response.ok) {
                setUploadStatus('Archivo subido correctamente.');
                console.log(response);
            } else {
                setUploadStatus('Error');
            }
        } catch (error) {
            console.error('Error al subir', error);
            setUploadStatus('Fail');
        }
    };

    return (
        <div className="main">
            <div className="nav">
                <p>AIBot</p>
                <img src={assets.user_icon} alt=""/>
            </div>
            <div className="main-container">
                {!changedConversation ? (
                    !showResult ? (
                        <>
                            <div className="greet">
                                <p><span>Hola, ¿En qué puedo ayudarte?</span></p>
                            </div>
                            <div className="cards">
                                <div className="card">
                                    <p>¿Como centrar un div?</p>
                                    <img src={assets.code_icon} alt=""/>
                                </div>
                                <div className="card">
                                    <p>Ideas para nombres de productos</p>
                                    <img src={assets.bulb_icon} alt=""/>
                                </div>
                                <div className="card">
                                    <p>Frases en una lengua extranjera</p>
                                    <img src={assets.message_icon} alt=""/>
                                </div>
                                <div className="card">
                                    <p>Cómo funciona algo</p>
                                    <img src={assets.compass_icon} alt=""/>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='result'>
                            <div className="result-title">
                                <img src={assets.user_icon} alt=""/>
                                <p>{recentPrompt}</p>
                            </div>
                            <div className="result-data">
                                <img src={assets.gemini_icon} alt=""/>
                                {loading ? (
                                    <div className="loader">
                                        <hr/>
                                        <hr/>
                                        <hr/>
                                        <hr/>
                                    </div>
                                ) : (
                                    <div dangerouslySetInnerHTML={{ __html: resultData }}/>
                                )}
                            </div>
                        </div>
                    )
                ) : (
                    <Conversation/>
                )
                }


                    <div className="main-bottom">
                        <div className="search-box">
                            <input onChange={(e) => setInput(e.target.value)}
                                   value={input} type="text" placeholder="Introduce una petición aqui"
                                   onKeyPress={(e) => e.key === 'Enter' ? handleSend() : null}/>
                            <div>
                                <select className="select-model"
                                        onChange={(e) => setModel(e.target.value)}
                                        value={model}>
                                    <option value="gpt-4-1106-preview">GPT 4</option>
                                    <option value="gemini-pro">Gemini</option>
                                </select>
                            </div>
                            <div className='datatypes'>
                                <input type="file" onChange={handleFileChange}/>
                                <img onClick={handleUpload} src={assets.gallery_icon} alt=""/>
                                <img src={assets.mic_icon} alt=""/>
                                <img onClick={handleSend} src={assets.send_icon} alt=""/>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    )
}

export default Main
