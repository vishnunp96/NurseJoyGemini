const express = require('express')
const app = express()
const PORT = process.env.PORT || 3500
app.use(express.json())

const {startChat, getStreamResponse, getResponse} = require('./genModel')

let chatObject = null;

async function initialiseChat() {
    chatObject = await startChat();
    if (chatObject) {
        console.log("Chat started.");
    } else {
        console.log('Chat failed to start.');
    }
}
initialiseChat();

app.post('/api', async (req, res) => {
    let response = "Dummy";
    const { message } = req.body;
    if (chatObject) {
        response = await getResponse(chatObject, message);
    }
    console.log(response);
    res.json({
        modelResponse : response
    })
})


app.listen(PORT, () => console.log(`Server running on port ${PORT}`))