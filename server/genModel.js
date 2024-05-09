const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const fs = require('fs');


const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.GEMINI_API_KEY;

async function startChat(chat_history = null) {
    if ( API_KEY )
        console.log("API Key found:"+API_KEY.slice(0,5));
    else
        console.log("Expect API failure.");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({model: MODEL_NAME});

    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
    ];

    let starting_prompt = JSON.parse(fs.readFileSync('./starting_prompt.json', 'utf8'));
    starting_prompt.forEach( function(side) {
        Object.keys(side).forEach(function(k){
            if(k === "parts"){
                const content = side[k][0];
                side[k] = [{"text" : content}];
                // console.log(side[k]);
            }
        });
    });

    if(chat_history){
        starting_prompt = starting_prompt.concat(chat_history);
    }

    return model.startChat({
        generationConfig,
        safetySettings,
        history: starting_prompt
    });
}

async function getStreamResponse(chat, input){
    const result = await chat.sendMessageStream(input);
    let text = '';
    for await(const chunk of result.stream){
        const chunkText = chunk.text();
        // console.log(chunkText);
        text += chunkText;
    }
    return text;
}

async function getResponse(chat, input){
    const result = await chat.sendMessage(input);
    const response = result.response;
    // console.log(response.text());
    return response.text();
}

module.exports = {
    startChat,
    getStreamResponse,
    getResponse
};
