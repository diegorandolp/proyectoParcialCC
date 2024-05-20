import './Sidebar.css'
import {useState, useContext, useEffect, useRef} from 'react';
import {assets} from "../../assets/assets.js";
import {Context} from "../../Context.jsx";

function Sidebar() {
    const [extended, setExtended] = useState(false);
    const { prevPrompts, setRecentPrompt, newChat, getConversation, setCurrentConversation, currentConversation, messages, setMessages,setChangedConversation} = useContext(Context);

    // Ref para currentConversation
    const currentConversationRef = useRef(0);

    // Actualizar ref cuando currentConversation cambie
    useEffect(() => {

        console.log("currentConversation ha cambiado: ", currentConversation);
        // const fetchData = async () => {
        //     await getConversation(currentConversationRef.current); // Usa la ref aquí
        //     console.log(messages);
        // };
        // fetchData();
    }, [currentConversation]);

    // Implementar con el get
    async function loadConversation(prompt) {
        setRecentPrompt(prompt.title);
        setCurrentConversation(prompt.conversationId);
        currentConversationRef.current = prompt.conversationId;
        // setChangedConversation(true);

        let data = await getConversation(currentConversationRef.current);
        data = Object.values(data);
        setMessages(data);
        console.log(typeof messages);
        console.log(messages);
    }

    return (
        <div className="sidebar">
            <div className="top">
                <img onClick={() => setExtended(prev=> !prev)} src={assets.menu_icon} className="menu" alt="menu"/>
                <div onClick={()=>newChat()} className="new-chat">
                    <img src={assets.plus_icon} alt="plus"/>
                    {extended ? <p>New Chat</p> : null}
                </div>
                {extended ?
                <div className="recent">
                    <p className="recent-title">Recent</p>
                    {prevPrompts.map((item, index) => {
                        return (
                                <div key={index} className="recent-entry"
                                     onClick={() => loadConversation(item)}>
                                    <img src={assets.message_icon} alt="message"/>
                                    <p>{item.title.slice(0, 18) + item.conversationId}...</p>
                                </div>

                        )
                    })}
                </div>
                    : null}
            </div>
            <div className="bottom">
                <div className="bottom-item recent-entry">
                    <img src={assets.question_icon} alt=""/>
                    {extended ? <p>Help</p> : null}
                </div>
                <div className="bottom-item recent-entry">
                    <img src={assets.history_icon} alt=""/>
                    {extended ? <p>Activity</p> : null}
                </div>
                <div className="bottom-item recent-entry">
                    <img src={assets.setting_icon} alt=""/>
                    {extended ? <p>Settings</p> : null}
                </div>
            </div>
        </div>
    )
}

export default Sidebar;