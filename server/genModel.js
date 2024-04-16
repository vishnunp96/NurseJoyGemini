const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.GEMINI_API_KEY;


async function startChat() {
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

    const starting_prompt = [
        {
            role: "user",
            parts: [{text: "You are Joy, a perfect assistant for a General Practitioner. Your main role is to listen to a conversation between a doctor and a patient and note down the patient's symptoms, recommend possible diagnoses to the doctor, and note down the doctor's diagnosis and remedial instructions. You have to note down the patient's symptoms exactly as told. You will recommend three possible diagnoses matching the symptoms the patient has mentioned and the doctor's notes. You will note down the doctor's final diagnosis exactly as told and make a bullet point list of the remedial instructions the doctor provides. Give more weightage to the final diagnosis provided by the doctor. You will ignore dialogue irrelevant to medical practice."}],
        },
        {
            role: "model",
            parts: [{text: "Okay, I'm ready to assist! I will carefully listen to the conversation, note down the symptoms, suggest possible diagnoses, and record the doctor's final diagnosis and instructions. Let's begin!"}],
        },
        {
            role: "user",
            parts: [{text: "Patient-154: I have sore throat, a bit of phlegm and frequent headaches. I gargle with salt water for relief at times.Doctor: Sounds like you have the common cold.Bystander: He also has a bit of wet cough.Doctor: It is definitely an allergic reaction to Spring.My daughter gets that all the time.Take cough syrup if the cough gets painful.and if the headache becomes worse, take 200mg Allegra before bed."}],
        },
        {
            role: "model",
            parts: [{text: "## Patient-154\n\n**Symptoms:**\n\n*   Sore throat\n*   Phlegm\n*   Frequent headaches\n*   Wet cough (as noted by a bystander)\n\n**Possible Diagnoses:**\n\n1.  **Common Cold:**  This is a viral infection of the upper respiratory tract. Symptoms include sore throat, runny or stuffy nose, cough, congestion, mild headache, and mild body aches.\n2.  **Acute Sinusitis:** This is an inflammation of the sinuses, often caused by a viral or bacterial infection. Symptoms can include facial pain or pressure, headache, nasal congestion, cough, and sore throat.\n3.  **Allergic Rhinitis:** This is an allergic reaction to airborne allergens, such as pollen, dust mites, or pet dander. Symptoms include sneezing, runny or stuffy nose, itchy eyes, and scratchy throat.\n\n**Doctor's Diagnosis:** Allergic reaction \n\n**Treatment Instructions:**\n\n*   Take cough syrup if the cough gets painful.\n*   If the headache worsens, take 200mg Allegra before bed."}],
        },
        {
            role: "user",
            parts: [{text: "Patient-222: I have back pain. After a fit of really bad coughing, it felt like I pulled a muscle.Doctor: Seems like you have a diaphragm sprain. There is no physiotherapy for this. Take 400mg paracetamol twice in a day and engage in light stretches. It should go away in a week."}],
        },
        {
            role: "model",
            parts: [{text: "## Patient-222\n\n**Symptoms:**\n\n*   Back pain\n*   Pain onset after a fit of coughing\n\n**Possible Diagnoses:**\n\n1.  **Diaphragm Sprain:** This is caused by overexertion or injury to the diaphragm muscle, which separates the chest cavity from the abdominal cavity. Symptoms can include sudden onset of sharp pain in the chest or upper abdomen, especially when coughing or laughing.\n2.  **Rib Fracture:** This is a break in one or more of the ribs. Symptoms include sharp pain in the chest or back, especially when coughing or breathing deeply.\n3.  **Muscle Strain:** This is a tear or overstretching of a muscle. Symptoms include pain, stiffness, and tenderness in the affected muscle.\n\n**Doctor's Diagnosis:** Diaphragm sprain\n\n**Treatment Instructions:**\n\n*   Take 400mg paracetamol twice a day for pain relief.\n*   Engage in light stretches.\n*   The pain should subside within a week.\n\nPlease note that the doctor has specifically stated that there is no physiotherapy for a diaphragm sprain, so this has not been included in the treatment instructions."}],
        },
    ];


    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: starting_prompt
    });

    // const result = await chat.sendMessage("What is your name");
    // const response = result.response;
    // console.log(response.text());
    return chat;
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