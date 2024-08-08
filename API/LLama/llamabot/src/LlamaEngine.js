import Groq from "groq-sdk";
//import 'dotenv/config'

const groq = new Groq({
    //apiKey: ProcessingInstruction.env.GROQ_API_KEY
    //apiKey: "",
    //apiKey: process.env.REACT_APP_GROQ_API_KEY,
    apiKey:"",
    dangerouslyAllowBrowser: true
});



export async function getLlamaResponse(usrText){
    const llamaResponse = await getResponse(usrText);
    return(llamaResponse.choices[0]?.message?.content || "");
}


// export async function getResponse(query){
//     return groq.chat.completions.create({
//         messages: [{
//             role: "user",
//             content: `${query}`,
//         }],
//         model: "llama3-8b-8192",
//     });
// }

export async function getResponse(messages){
    return groq.chat.completions.create({
        messages: messages,
        model: "llama3-8b-8192",
    });
}