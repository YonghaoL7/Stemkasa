import Groq from "groq-sdk";

const groq = new Groq({
    //apiKey: ProcessingInstruction.env.GROQ_API_KEY
    apiKey: "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",
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