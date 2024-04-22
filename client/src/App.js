import './normalize.css'
import './App.css';
import {useState} from "react";
import {useRef} from "react";

function App() {
    const chatMsgRef = useRef(null);
    const [input, setInput] = useState("");
    const [chatLog, setChatLog] = useState([
    ]);
    const [patientList, setPatientList] = useState([
    ]);
    const [activePatient, setActivePatient] = useState(patientList[0] ? patientList[0]["id"] : null);


    async function addNewPatient() {
        const userInput = prompt("Please enter patient identifier:");
        if(userInput !== null && userInput.trim() !== "") {
            try{
                await changePatient(userInput);
                await setPatientList([{id: `${userInput}`}, ...patientList]);
            } catch (e){
                console.log(e);
            }
        }
    }
    async function changePatient( patientId ) {
        setChatLog([]);
        console.log("Patient being changed to: " + patientId);
        try{
            const response = await fetch('/changePatient', {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    patient: patientId
                })
            });
            if(response.status !== 201)
                throw new Error("API response not good - " + response.status);
            await getChatHistory();
            await setActivePatient(patientId);
        } catch (e){
            console.log("Could not change to patient - "+ patientId);
        }
    }

    async function getChatHistory() {
        try{
            const response = await fetch('/getChat', {
                method: "GET"
            });
            if(response.status !== 200)
                throw new Error("API response not good - " + response.status);

            const { history } = await response.json();
            await setChatLog([]);
            const newChatLog = [];
            history.forEach( function(chat) {
                newChatLog.push({
                    user: chat["role"],
                    message: chat["parts"][0]["text"]
                });
            });
            setChatLog(newChatLog);
        } catch (e){
            console.log("Could not get chatHistory due to "+ e);
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
        const response = await fetch('/chatResponse', {
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
                            <PatientTab key={index} patientId={data.id} activePatient={activePatient}
                                        clickFn={changePatient}
                            />
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
                               placeholder={`${activePatient === null ? "Add a new patient!" :
                               "Add any details about the patient here!"}`}
                               value={input}
                               onChange={(e) => setInput(e.target.value)}
                               rows="2" required={true} disabled={activePatient === null}>
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

const PatientTab = ({patientId, activePatient, clickFn}) => {
    return (
        <div className={`patient-tab ${activePatient === patientId ? "active" : ""}`}
        onClick={activePatient === patientId ? null :
            ()=>{ clickFn(patientId)}}>{patientId}</div>
    )
}

export default App;
