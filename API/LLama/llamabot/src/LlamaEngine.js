import Groq from "groq-sdk";

const groq = new Groq({
    //apiKey: ProcessingInstruction.env.GROQ_API_KEY
    apiKey: "",
    dangerouslyAllowBrowser: true
});

export async function getLlamaResponse(){
    const llamaResponse = await getResponse();

    return(llamaResponse.choices[0]?.message?.content || "");
}

export async function getResponse(){
    return groq.chat.completions.create({
        messages: [{
            role: "user",
            content: "Explain the riemann hypothesis",
        }],
        model: "llama3-8b-8192",
    });
}