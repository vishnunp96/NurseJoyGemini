import './normalize.css'
import './App.css';
import {useState} from "react";
import {clear} from "@testing-library/user-event/dist/clear";

function App() {

    const [input, setInput] = useState("");
    const [chatLog, setChatLog] = useState([
        {
            user: "user",
            message: "Hello Hello, I reached JS Hell!"
        },
        {
            user: "model",
            message: "NJ is here, have no fear."
        }
    ]);

    function clearChat(){
        setChatLog([])
    }

    async function handleSubmit(e) {
        e.preventDefault();
        console.log("got here");
        let chatLogNew = [...chatLog, { user: "P", message: `${input}`}];
        await setChatLog(chatLogNew);
        await setInput("");
        console.log("input is->" + input)
        const response = await fetch('/api', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: input
            })
        });
        const { modelResponse } = await response.json();
        console.log(modelResponse);
        chatLogNew = [...chatLogNew, { user: "model", message: `${modelResponse}`}];
        await setChatLog(chatLogNew);
    }

    return (
        <div className="App">
            <aside className="sidemenu">
                <div className="new-patient-button" onClick={clearChat}>
                    <span>+</span>
                    New Patient
                </div>
            </aside>
            <section className="chatbox">
                <h1>Nurse Joy Prototype</h1>
                <div className="chat-log">
                    {
                        chatLog.map( (message, index) => (
                            <ChatMessage key={index} message={message} />
                        ))
                    }
                </div>
                <div className="chat-input-holder">
                    <form onSubmit={handleSubmit}>
                        <input className="chat-input-textarea"
                               placeholder="Add any details about the patient here!"
                               value={input}
                               onChange={(e) => setInput(e.target.value)}
                               rows="2">
                        </input>
                    </form>
                </div>
            </section>
        </div>
    );
}

const ChatMessage = ({message}) => {
    return (
        <div className={`chat-message-element 
        ${message.user === "model" ? "model": "user"}`}>
            <div className="chat-message-element-center">
                <div className={`chat-message-avatar 
                ${message.user === "model" ? "model": "user"}`}>
                    {message.user === "model" ? "NJ" : "P"}
                </div>
                <div className="chat-message-text">
                    {message.message}
                </div>
            </div>
        </div>
    )
}

export default App;
