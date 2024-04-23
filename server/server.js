const express = require('express')
const app = express()
const PORT = process.env.PORT || 3500
app.use(express.json())
const {startChat, getResponse} = require('./genModel')

let chatObject = null;
let patients = [];
let chatHistory = {};
let activePatient = "";


async function initialiseChat(chat_history = null) {
    chatObject = await startChat(chat_history);
    if (chatObject) {
        console.log("Chat started.");
    } else {
        console.log('Chat failed to start.');
    }
}
initialiseChat();

app.post('/chatResponse', async (req, res) => {
    let response = "Could not fulfill request. Check error logs";
    const { message } = req.body;
    if (chatObject) {
        try{
            response = await getResponse(chatObject, message);
            chatHistory[activePatient].push({"role": "user", "parts": [{"text": message}]});
            chatHistory[activePatient].push({"role": "model", "parts": [{"text": response}]});
            console.log("history appended for "+activePatient);
        } catch (e){
            console.log(e);
        }
    }
    console.log(response);
    res.json({
        modelResponse : response
    })
});


app.put('/changePatient', async (req, res) => {
    try{
        const {patient} = req.body;
        if(!patients.includes(patient)){
            patients.push(patient);
            chatHistory[patient] = []
        }
        await initialiseChat(chatHistory[patient]);
        activePatient = patient;
        console.log("Successfully changed context to patient - " + activePatient);
        res.status(201).send("Success in changing patient");
    } catch (e){
        console.log(e);
        res.status(400).send("Error in changing patient.");
    }

});


app.get('/getChat', async (req, res) => {
    console.log("returning history for current active - " + activePatient);
    res.status(200).json({
        history : chatHistory[activePatient]
    })
});

app.get('/getPatients', async (req, res) => {
    console.log("returning list of patients " + patients);
    res.status(200).json({
        patients : patients
    })
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;