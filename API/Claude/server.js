import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import sendMessage from "./claude.js";

const app = express();
// Enable CORS for all routes
app.use(cors());

const port = process.env.port || 5000;

app.use(express.json());

app.post('/api/send-message', async (req, res) => {
  try {
    const { userID, convo, message, image } = req.body;
    console.log(userID,convo,message)
    let context;
    if (convo.length === 0) {
      try {
        const response = await fetch("http://www.onezeus.com:3000/GenerateUUID");
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        context = data.UUID;
      } catch (error) {
        console.error("There was a problem fetching the new context", error);
        throw error;
      }
    } else {
      context = convo[0].CONTEXT;
    }
    const history = getClaudeHistory(convo);
    console.log("Formatted history:", message);
    const aiResponse = await sendMessage(history, message, image);
    const response = await storeConversation(userID, message, aiResponse.content[0].text, context);

    res.json(response);
  } catch (error) {
    console.error("Error in /api/send-message:", error);
    res.status(500).json({ error: error.message });
  }
});

/*
    @brief: convert the database's chat history into format claudeAI accepts
    @params: array of the database chat history between userID and botID
    @return: returns array of claude formatted history 
*/
export const getClaudeHistory = (data) => {
    let history = []
    for(let i = 0; i < data.length; i++){
        history.push({
            role: "user",
            content: data[i].CHAT_PROMPT
        })
        history.push({
            role: "assistant",
            content: data[i].CHAT_RESPONSE
        })
    }
    return history;
}
export const storeConversation = async(userID, prompt, aiResponse, context) => {
    try{
        const date = new Date();
        const formattedDate = date.toISOString().replace('Z', '+00:00');
        const response = await fetch(`http://www.onezeus.com:3000/chatsdmlpost`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                CHAT_PROMPT: prompt,
                CHAT_RESPONSE: aiResponse,
                AI_MODEL: "Claude",
                FROM_USER_ID: userID,
                TO_USER_ID: userID,
                BOT_ID: 31,
                CONTEXT: context,
                CREATION_DATE: formattedDate,
                CREATED_BY: "Claude Team",
                LAST_UPDATE_DATE: formattedDate,
                LAST_UPDATED_BY: "Claude Team"
            })
        })
        return response
    }
    catch(error){
        throw new Error('Error sending conversation:', error)
    }
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});