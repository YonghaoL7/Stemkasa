/*
    Questions:
    what is the purpose of the context in chat prompt 

    Tasks:
    -retrieve all user's unique chats
    -post new chat
    -creating new bot
**/

/*
    @brief: retrieves all the conversations of the user
    @params: int of the user's id
    @return: returns array the most recent messages of all the unique conversations
*/

export const fetchConvo = async(userId) => {
    try{
        //retrieve all the bot lists
        const response = await fetch(`http://www.onezeus.com:3000/bots`);
        if(!response.ok){
            throw new Error("network response was not ok");
        }
        const bots = await response.json();
        //retrieve the history between each bot and user
        const fetchHistories = bots.map(bot => fetchHistory(bot.BOT_ID, userId));
        const histories = await Promise.all(fetchHistories);
        //get all the recent messages between the bots
        let conversations = []
        for(let i = 0; i < histories.length; i++){
            if(histories[i].length > 0){
                conversations.push(histories[i][0])
            }
        }
        return conversations;
    }
    catch(error){
        console.error("there was a problem fetching the unique conversations")
    }
}
/*
    @brief: check if bot exists in the database
    @params: int of botID
    @return: returns boolean if bot exists or not
*/
export const existBot = async(botID) => {
    try{
        const response = await fetch(`http://www.onezeus.com:3000/bots`);
        if(!response.ok){
            throw new Error("network response was not okay")
        }
        const bots = await response.json();
        for(let i = 0; i < bots.length; i++){
            if(bots.BOT_ID === botID){
                return true;
            }
        }
        return false
    }
    catch(error){
        console.error("there was a problem validating bot id")
    }
}

/*
    @brief: retrieves chat history of the user and bot from the database
    @params: int of botID, int of UserID
    @return: returns array the database's chat history between the bot and the user
*/
export const fetchHistory = async (botId ,userId) => {
    try{
        //retrieve all the chats between the bot and user
        const response = await fetch(`http://www.onezeus.com:3000/chats?BOT_ID=${botId}&FROM_USER_ID=${userId}&TO_USER_ID=${userId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const history = await response.json()
        //return the array where the recent messages are first
        return (history).reverse();
    }
    catch (error){
        console.error("there was a problem with fetching the chat history", error);
        throw error;
    }
}
// /*
//     @brief: convert the database's chat history into format claudeAI accepts
//     @params: array of the database chat history between userID and botID
//     @return: returns array of claude formatted history 
// */
// export const getClaudeHistory = (data) => {
//     let history = []
//     for(let i = 0; i < data.length; i++){
//         history.push({
//             role: "user",
//             content: data[i].CHAT_PROMPT
//         })
//         history.push({
//             role: "assistant",
//             content: data[i].CHAT_RESPONSE
//         })
//     }
//     return history;
// }

// export const updateMessage = async(userID, convo, message) => {
//     //get context
//     console.log(sendMessage)
//     let context;
//     if (convo.length == 0){
//         try{
//             let response = await fetch("http://www.onezeus.com:3000/GenerateUUID")
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             context = await response.json().UUID
//         }
//         catch(error){
//             console.error("there was a problem fetching the new context", error)
//             throw error
//         }
//     }else{
//         context = convo[0].CONTEXT
//     }
//     return
//     let history = getClaudeHistory(convo);
//     console.log(history)
//     let aiResponse = await sendMessage(history, message)
//     await storeConversation(userID, message, aiResponse.content[0].text, context)
// }
// export const storeConversation = async(userID, prompt, aiResponse, context) => {
//     try{
//         const date = new Date();
//         const formattedDate = date.toISOString().replace('Z', '+00:00');
//         const response = await fetch(`http://www.onezeus.com:3000/chatsdmlpost`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 CHAT_PROMPT: prompt,
//                 CHAT_RESPONSE: aiResponse,
//                 AI_MODEL: "Claude",
//                 FROM_USER_ID: userID,
//                 TO_USER_ID: userID,
//                 BOT_ID: 31,
//                 CONTEXT: context,
//                 CREATION_DATE: formattedDate,
//                 CREATED_BY: "Claude Team",
//                 LAST_UPDATE_DATE: formattedDate,
//                 LAST_UPDATED_BY: "Claude Team"
//             })
//         })
//         console.log(response);
//     }
//     catch(error){
//         throw new Error('Error sending conversation:', error)
//     }
// }
// getData();
