import './normalize.css'
import './App.css';
import {useState} from "react";
import {useRef, useEffect} from "react";

function App() {
    const chatMsgRef = useRef(null);
    const [input, setInput] = useState("");
    const [chatLog, setChatLog] = useState([
        // {
        //     user: "user",
        //     message: "Hello Hello, I reached JS Hell!"
        // },
        // {
        //     user: "model",
        //     message: "NJ is here, have no fear."
        // }
    ]);
    const [patientList, setPatientList] = useState([
        // {
        //     id: "Patient-666"
        // },
        // {
        //     id: "Patient-420"
        // }
    ]);
    const [activePatient, setActivePatient] = useState(patientList[0] ? patientList[0]["id"] : 0);


    async function addNewPatient() {
        const userInput = prompt("Please enter patient identifier:");
        if(userInput !== null && userInput.trim() !== "") {
            setChatLog([]);
            console.log("New patient being added: " + userInput);
            try{
                const response = await fetch('/changePatient', {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        patient: userInput
                    })
                });
                if(response.status !== 201)
                    throw new Error("API response not good - " + response.status);
            } catch (e){
                console.log("Could not change to patient - "+ userInput);
                return;
            }

            await setPatientList([{id: `${userInput}`}, ...patientList]);
            await setActivePatient(userInput);
        }
    }

    async function getChatHistory() {
        try{
            const response = await fetch('/getChat', {
                method: "GET"
            });
            if(response.status !== 200)
                throw new Error("API response not good - " + response.status);

            const { history } = response.json();
            setChatLog([]);
            history.forEach( function(chat) {
                setChatLog([...chatLog, {
                    user: chat["role"],
                    message: chat["parts"][0]["text"]
                }]);
            });
        } catch (e){
            console.log("Could not get chatHistory");
            return;
        }
    }

    async function scrollChat() {
        if (chatMsgRef.current) {
            await new Promise(r => setTimeout(r, 50));
            chatMsgRef.current.scrollTop = chatMsgRef.current.scrollHeight;
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        console.log("Submit button is clicked.");
        let chatLogNew = [...chatLog, {user: "P", message: `${input}`}];
        await setChatLog(chatLogNew);
        await setInput("");
        await scrollChat();
        const response = await fetch('/api', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: input
            })
        });
        try{
            const {modelResponse} = await response.json();
            chatLogNew = [...chatLogNew, {
                user: "model",
                message: `${modelResponse}`
            }];
        } catch(e){
            console.log("Error with the response");
        }
        await setChatLog(chatLogNew);
        console.log("Chat appended success.");
        await scrollChat();
    }

    return (
        <div className="App">
            <div className="side-menu">
                <div className="new-patient-button" onClick={addNewPatient}>
                    <span>+</span>
                    New Patient
                </div>
                <div className="patient-list">
                    {
                        patientList.map((data, index)=> (
                            <PatientTab key={index} patientId={data.id} activePatient={activePatient}/>
                        ))
                    }
                </div>
            </div>
            <section className="chat-area">
                <h1>Nurse Joy Prototype</h1>
                <div ref={chatMsgRef} className="chat-log">
                    {
                        chatLog.map((message, index) => (
                            <ChatMessage key={index} message={message}/>
                        ))
                    }
                </div>
                <div className="chat-input-holder">
                    <form onSubmit={handleSubmit}>
                        <input className="chat-input-textarea"
                               placeholder="Add any details about the patient here!"
                               value={input}
                               onChange={(e) => setInput(e.target.value)}
                               rows="2" required={true}>
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
        ${message.user === "model" ? "model" : "user"}`}>
            <div className="chat-message-element-center">
                <div className={`chat-message-avatar 
                ${message.user === "model" ? "model" : "user"}`}>
                    {message.user === "model" ? "NJ" : "P"}
                </div>
                <div className="chat-message-text">
                    {message.message}
                </div>
            </div>
        </div>
    )
};

const PatientTab = ({patientId, activePatient}) => {
    return (
        <div className={`patient-tab ${activePatient === patientId ? "active" : ""}`}>{patientId}</div>
    )
}

export default App;
