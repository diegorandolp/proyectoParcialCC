import {useContext} from 'react'
import {Context} from "../../Context.jsx";
import {assets} from "../../assets/assets.js";

const Conversation = () => {

    const {messages} = useContext(Context);
    // useEffect(() => {
    const messagesArray = Object.values(messages);
    // }, [currentConversation]);

    return (
        <div className='result'>
            {messagesArray.map((item, index) => (

                (item.rol === 'user') ? (
                    <div key={index} className="result-title">
                        <img src={assets.user_icon} alt=""/>
                        <p>{item.content}</p>
                    </div>
                ) : (
                        <div key={index} className="result-title">
                            <img src={assets.gemini_icon} alt=""/>
                            <p>{item.content}</p>
                        </div>
                    )
                ))}
</div>
)
;
// <div className='result'>
    //     <div className="result-title">
    //         <img src={assets.user_icon} alt=""/>
    //         <p>{recentPrompt}</p>
    //     </div>
    //     <div className="result-data">
    //         <img src={assets.gemini_icon} alt=""/>
    //         {loading ? (
    //             <div className="loader">
    //                 <hr/>
    //                 <hr/>
    //                 <hr/>
    //                 <hr/>
    //             </div>
    //         ) : (
    //             <div dangerouslySetInnerHTML={{__html: resultData}}/>
    //         )}
    //     </div>
    // </div>

}
export default Conversation
