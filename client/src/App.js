import './normalize.css'
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import DownloadButton from "./DownloadButton";
import DOMPurify from 'dompurify';
import { marked } from 'marked';

function App() {
    const [isRecording, setIsRecording] = useState(false);
    const [timer, setTimer] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const timerIntervalRef = useRef(null);
    const chatMsgRef = useRef(null);
    const [input, setInput] = useState("");
    const [isShowModal, setShowModal] = useState(false);
    const mediaRecorderRef = useRef(null);
    const [chatLog, setChatLog] = useState([
    ]);
    const [patientList, setPatientList] = useState([
    ]);
    const [activePatient, setActivePatient] = useState(patientList[0] ? patientList[0]["id"] : null);
    useEffect(() => {
        loadPatients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);


    async function addNewPatient() {
        const userInput = prompt("Please enter patient identifier:");
        if(userInput !== null && userInput.trim() !== "") {
            try{
                if (await changePatient(userInput))
                    await setPatientList([{id: `${userInput}`}, ...patientList]);
            } catch (e){
                console.log("Could not add new patient - " + e);
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
            if(response.status === 201) {
                await getChatHistory();
                await setActivePatient(patientId);
                return true;
            } else {
                console.log("Error - API response for changing patient - " + response.status);
            }
        } catch (e){
            console.log("Could not change to patient - "+ patientId);
        }
        return false;
    }

    async function getChatHistory() {
        try{
            const response = await fetch('/getChat', {
                method: "GET"
            });
            if(response.status === 200) {
                const {history} = await response.json();
                await setChatLog([]);
                const newChatLog = [];
                history.forEach(function (chat) {
                    newChatLog.push({
                        user: chat["role"],
                        message: chat["parts"][0]["text"]
                    });
                });
                setChatLog(newChatLog);
            } else {
                console.log("Error - API response for getting chat history - " + response.status);
            }
        } catch (e){
            console.log("Could not get chatHistory due to "+ e);
        }
    }


    async function loadPatients() {
        try{
            const response = await fetch('/getPatients', {
                method: "GET"
            });
            if(response.status === 200){
                const { patients } = await response.json();
                const patientIds = [];
                patients.forEach( function(patient) {
                    patientIds.push({ id: patient})
                });
                if(patientIds.length > 0){
                    setPatientList(patientIds.reverse());
                    await changePatient(patientIds[0]["id"]);
                }
            } else {
                console.log("Error - API response for loading patients - " + response.status);
            }

        } catch (e){
            console.log("Could not get patient list due to "+ e);
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
        console.log("Input being submitted.");
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
        console.log("Chat response appended.");
        await scrollChat();
    }

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
      
            const audioChunks = [];
            mediaRecorder.addEventListener('dataavailable', (event) => {
              audioChunks.push(event.data);
            });
      
            mediaRecorder.addEventListener('stop', () => {
              const audioBlob = new Blob(audioChunks);
              console.log('set audio');
              setRecordedBlob(audioBlob);
            });
      
            setIsRecording(true);
            setTimer(0);
      
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
            }
      
            timerIntervalRef.current = setInterval(() => {
              setTimer((prevTimer) => prevTimer + 1);
            }, 1000);
      
            return () => {
              mediaRecorder.stop();
              stream.getTracks().forEach((track) => track.stop());
              clearInterval(timerIntervalRef.current);
            };
          })
          .catch((error) => {
            console.error('Error accessing media devices:', error);
          });
      };

      function createAudioUrl(blob) {
        return window.URL.createObjectURL(blob);
      }
      
      const stopRecording = () => {
        console.log('stopped');
        setIsRecording(false);
        setTimer(0);
      
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          console.log('media recorder stopped');
        }
      
        if (recordedBlob) {
          console.log('there\'s a blob');
        //   const audioUrl = createAudioUrl(recordedBlob);
        //   const audioElement = new Audio(audioUrl);
        //   audioElement.play();
        }
      };

      useEffect(() => {
        return () => {
          if (recordedBlob) {
            const audioUrl = createAudioUrl(recordedBlob)
            console.log(audioUrl)
            window.URL.revokeObjectURL(audioUrl);
          }
        };
      }, [recordedBlob]);

      const showModal = () => {
        console.log('open modal');
        setShowModal(true);
      };
      
      const hideModal = () => {
        setShowModal(false);
      };

    return (
        <div className="App">
            <div className="side-menu">
                <h1>DOCJOY</h1>
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
                {/*<button className="report-button" >Download Report</button>*/}
                <DownloadButton onClick={showModal} />
                <div ref={chatMsgRef} className="chat-log">
                    {
                        chatLog.map((message, index) => (
                            <ChatMessage key={index} message={message}/>
                        ))
                    }
                </div>
                <div className="chat-input-holder">
                    {chatLog.length === 0 && (
                            <div className="record-button-container">
                            <button
                                className={`record-button ${isRecording ? 'recording' : ''}`}
                                onClick={isRecording ? stopRecording : startRecording}
                            >
                            {isRecording ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M50 85C69.33 85 85 69.33 85 50C85 30.67 69.33 15 50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85ZM41.25 36.875C38.8338 36.875 36.875 38.8338 36.875 41.25V58.75C36.875 61.1662 38.8338 63.125 41.25 63.125H58.75C61.1662 63.125 63.125 61.1662 63.125 58.75V41.25C63.125 38.8338 61.1662 36.875 58.75 36.875H41.25Z" fill="white"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
                                    <path d="M38.3333 26.6667C38.3333 20.2233 43.5567 15 50 15C56.4433 15 61.6667 20.2233 61.6667 26.6667V42.2222C61.6667 48.6655 56.4433 53.8889 50 53.8889C43.5567 53.8889 38.3333 48.6655 38.3333 42.2222V26.6667Z" fill="white"/>
                                    <path d="M53.8889 69.1688C67.0811 67.2818 77.2222 55.9363 77.2222 42.2222C77.2222 40.0744 75.4811 38.3333 73.3333 38.3333C71.1856 38.3333 69.4445 40.0744 69.4445 42.2222C69.4445 52.9611 60.7389 61.6667 50 61.6667C39.2611 61.6667 30.5556 52.9611 30.5556 42.2222C30.5556 40.0744 28.8144 38.3333 26.6667 38.3333C24.5189 38.3333 22.7778 40.0744 22.7778 42.2222C22.7778 55.9363 32.9189 67.2818 46.1111 69.1688V77.2222H34.4444C32.2967 77.2222 30.5556 78.9633 30.5556 81.1111C30.5556 83.2589 32.2967 85 34.4444 85H65.5556C67.7033 85 69.4445 83.2589 69.4445 81.1111C69.4445 78.9633 67.7033 77.2222 65.5556 77.2222H53.8889V69.1688Z" fill="white"/>
                                </svg>
                            )}
                            </button>
                            {isRecording && <div> Recording...<div className="timer">{timer}s</div></div>}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <input className="chat-input-textarea"
                               placeholder={`${activePatient === null ? "Add a new patient!" :
                               "Add any details about the patient here!"}`}
                               value={input}
                               onChange={(e) => setInput(e.target.value)}
                               required={true} disabled={activePatient === null}>
                        </input>
                    </form>
                </div>
            </section>
            {isShowModal && (
            <div className="modal-overlay">
                <div className="modal">
                <div className="modal-content">
                    <span className="close-button" onClick={hideModal}>
                    &times;
                    </span>
                    <p>Download successful!</p>
                </div>
                </div>
            </div>
            )}
        </div>
    );
}

const ChatMessage = ({message}) => {

    marked.setOptions({
        breaks: true,
    });

    const markdownToHtml = marked(message.message);
    const sanitizedMessage = DOMPurify.sanitize(markdownToHtml);

    return (
        <div className={`chat-message-element 
        ${message.user === "model" ? "model" : "user"}`}>
            <div className="chat-message-element-center">
                <div className={`chat-message-avatar 
                ${message.user === "model" ? "model" : "user"}`}>
                    {message.user === "model" ? "NJ" : "P"}
                </div>
                <div className="chat-message-text" dangerouslySetInnerHTML={{__html: sanitizedMessage}}>
                    {/* {message.message} */}
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
