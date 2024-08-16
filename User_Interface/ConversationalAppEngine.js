import   OpenAI from "openai";
import * as fs from 'node:fs';
import Anthropic from "@anthropic-ai/sdk"

const DATA_DIRECTORY_PATH = './data/';
const APP_RESOURCES_DIRECTORY_PATH = './app-resources/';
const APP_RESOURCES_WEB_BASE_PATH = '/app-resources/'
export class ConversationalAppEngine {
    userMessages = {};
    openai = null;
    anthropic = null;
    defaultMessages = [];

    constructor(appClass) {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        
        const context = {
            openai: this.openai,
            anthropic: this.anthropic
        };
        this.app = new appClass(context);
        context.filesDirectoryPath = APP_RESOURCES_DIRECTORY_PATH + this.getFilesDirectoryName() + '/';
        context.webBasePath = APP_RESOURCES_WEB_BASE_PATH + this.getFilesDirectoryName() + '/';


        this.defaultMessages = this.app.getDefaultMessages();
        // console.log("defaultMessage" + JSON.stringify(this.defaultMessages))

        if (!fs.existsSync(DATA_DIRECTORY_PATH)) {
            fs.mkdirSync(DATA_DIRECTORY_PATH);
        }

        if (!fs.existsSync(APP_RESOURCES_DIRECTORY_PATH + this.getFilesDirectoryName())) {
            fs.mkdirSync(APP_RESOURCES_DIRECTORY_PATH + this.getFilesDirectoryName());
        }

        this.loadData()
    }

    async loadData() {
        try {
            const response = await fetch(`http://www.onezeus.com:3000/chats?BOT_ID=${this.app.botid}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const chatData = await response.json();

        //format the data into {userid: {contextId: { messages: [ {role: user, content: message}, {role: asistant, content: response} ]}}}
            this.userMessages  = chatData.reduce((acc, item) => {
                const userId = (item.FROM_USER_ID);
                const contextId = item.CONTEXT;

                if (!acc[userId]) {
                    acc[userId] = {};
                }

                if (!acc[userId][contextId]) {
                    acc[userId][contextId] = {
                        messages: [...this.defaultMessages],
                        name: contextId,
                        usage: [],
                        state: {}
                     };
                }

                acc[userId][contextId].messages.push(
                    { role: "user", content: item.CHAT_PROMPT },
                    { role: "assistant", content: item.CHAT_RESPONSE }
                );
                acc[userId][contextId].usage.push(
                    { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
                );
                return acc;
            }, {}); 
            console.log("loadData" + JSON.stringify(this.userMessages, null, 2))
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        // fs.readFile(this.getDataFileName(), 'utf8', (error, data) => {
        //     if (error) {
        //         console.log("Error: " + error);
        //     } else {
        //         this.userMessages = JSON.parse(data);
        //         console.log("loadData ",this.userMessages)
        //     }
        // });
    }

    getDataFileName() {
        return DATA_DIRECTORY_PATH + this.app.constructor.name + '-data.json';
    }

    getFilesDirectoryName() {
        return this.app.constructor.name;
    }

    async storeData(user_id, context_id, user_message, assistant_response) {
        let date = new Date()
        const formattedDate = date.toISOString().replace('Z', '+00:00');
        
        const params = {
            CHAT_PROMPT: user_message,
            CHAT_RESPONSE: assistant_response,
            AI_MODEL: this.app.model,
            FROM_USER_ID: user_id,
            TO_USER_ID: this.app.model,
            CONTEXT: context_id,
            BOT_ID: this.app.botid,
            CREATION_DATE: formattedDate,
            CREATED_BY: "NLP Dashboard Team",
            LAST_UPDATE_DATE: formattedDate,
            LAST_UPDATED_BY: "NLP Dashboard Team"
        }
        try {
            const response = await fetch('http://www.onezeus.com:3000/chatsdmlpost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
            })
            console.log("storeData"+response)
        } catch (error){
            console.error('Error:', error);
        };
        
    }

    // storeData() {
    //     const json = JSON.stringify(this.userMessages, null, 2);
    //     fs.writeFile(this.getDataFileName(), json, 'utf8', (error) => {
    //         if (error) {
    //             console.log("Error: " + error);
    //         }
    //     });
    // }

    getUserChats(userid) {
        const user = this.getUser(userid);
        const chats = [];
        for (const chatid of Object.keys(user)) {
            const chat = user[chatid];
            chats.push({ name: chat.name, id: chatid });
        }
        console.log("getuserchats", chats)
        return chats;
    }

    getUser(userId) {
        this.userMessages[userId] = this.userMessages[userId] || {};
        console.log("getUser", this.userMessages[userId])
        return this.userMessages[userId]
    }

    getChat(user, chatId) {
        user[chatId] = user[chatId] || { messages: [...this.defaultMessages], name: "", usage: [], state: {} };
        console.log("getChat", user[chatId])
        return user[chatId]
    }

    async getUserChat(userid, chatid) {
        console.log("getUserChat")
        const user = this.getUser(userid);
        const chat = this.getChat(user, chatid);
        const chatMessages = [];

        let i = 0;
        for (const message of chat.messages.slice(this.defaultMessages.length)) {
            if (message.role == 'function' || message.function_call) {
                continue;
            }

            const msg = {
                message: message.role == 'assistant' ? await Promise.resolve(this.app.getTextMessage(message.content)) : message.content,
                appContent: message.role == 'assistant' ? await Promise.resolve(this.app.getAppContent(message.content)) : message.content
            };

            if (message.role == 'assistant') {
                msg.usage = chat.usage[i++];
            }

            chatMessages.push(msg);
        }
        return chatMessages;
    }

    async deleteUserChat(userid, chatid) {
        const user = this.getUser(userid);
        delete user[chatid];
        try { 
            const response = await fetch(`http://www.onezeus.com:3000/chats?CONTEXT=${chatid}`, {
                method: "DELETE",
                headers: {'Content-Type': 'application/json',}
            })
            console.log("deleteUserChat", response)
        } catch (error) {
            console.log(error)
        }
        
        // this.storeData();
    }

    postMessage(userid, chatid, message, callback) {
        console.log("postmessage")
        const user = this.getUser(userid);
        const chat = this.getChat(user, chatid);
        const messages = chat.messages;
        const availableFunctions = this.app.getAvailableFunctions();

        messages.push({ "role": "user", "content": message });

        if (this.app.ApiName == "Claude"){
            try {
                this.anthropic.messages.create({
                    messages: messages,
                    max_tokens: 1024,
                    model: this.app.model,
                }).then(async (completion) => {//Handle successful response
                    console.log("Received from Claude: ");
                    console.log(JSON.stringify(completion, null, 2));
                    let responseMessageObject = completion;

                    if (responseMessageObject.function_call) {
                        ({ responseMessageObject, completion } = await this.handleFunctionCall(responseMessageObject, availableFunctions, completion, messages));
                    }

                    //Handle response by app
                    const responseMessage = responseMessageObject.content[0].text;
                    let chatName = await Promise.resolve(this.app.getChatNameFromMessage(responseMessage, message, chat));
                    if (chatName) {
                        chat.name = chatName;
                    }

                    messages.push(responseMessageObject);
                    chat.usage.push(completion.usage);
                    // this.storeData();
                    // await this.storeData(userid, chatid, message, responseMessage)

                    const response = {
                        status: 'success',
                        message: await Promise.resolve(this.app.getTextMessage(responseMessage)),
                        appContent: await Promise.resolve(this.app.getAppContent(responseMessage)),
                        chatName: chat.name,
                        usage: completion.usage
                    };

                    callback(null, response);
                }).catch(error => {
                    messages.pop();
                    console.error(error);
                    callback({
                        message: error?.message || error
                    }, null);
                });
            } catch (error) {
                messages.pop();
                console.error(error);
                callback({
                    message: error.message || error
                }, null);
            }
        }
        else {
            try {
                this.openai.chat.completions.create({
                    model: this.app.model,
                    temperature: this.app.temperature,
                    messages: messages,
                    functions: availableFunctions
                }).then(async (completion) => {//Handle successful response
                    console.log("Received from ChatGPT: ");
                    console.log(JSON.stringify(completion, null, 2));
                    let responseMessageObject = completion.choices[0].message;

                    if (responseMessageObject.function_call) {
                        ({ responseMessageObject, completion } = await this.handleFunctionCall(responseMessageObject, availableFunctions, completion, messages));
                    }

                    //Handle response by app
                    const responseMessage = responseMessageObject.content;
                    let chatName = await Promise.resolve(this.app.getChatNameFromMessage(responseMessage, message, chat));
                    if (chatName) {
                        chat.name = chatName;
                    }

                    messages.push(responseMessageObject);
                    chat.usage.push(completion.usage);
                    // this.storeData();
                    // await this.storeData(userid, chatid, message, responseMessage)

                    const response = {
                        status: 'success',
                        message: await Promise.resolve(this.app.getTextMessage(responseMessage)),
                        appContent: await Promise.resolve(this.app.getAppContent(responseMessage)),
                        chatName: chat.name,
                        usage: completion.usage
                    };

                    callback(null, response);
                }).catch(error => {
                    messages.pop();
                    console.error(error);
                    callback({
                        message: error?.message || error
                    }, null);
                });
            } catch (error) {
                messages.pop();
                console.error(error);
                callback({
                    message: error.message || error
                }, null);
            }
        }
    }
    
    //handles the invocation of functions if the ChatGPT response includes a function call.
    async handleFunctionCall(responseMessageObject, availableFunctions, completion, messages) {
        while (responseMessageObject.function_call) {
            const functionName = responseMessageObject.function_call.name;
            const hallucinatedFunctionMessages = [];
            //Checking for Available Functions
            if (availableFunctions.find(f => f.name == functionName)) {
                messages.push(responseMessageObject);
                const functionParams = JSON.parse(responseMessageObject.function_call.arguments || '{}');
                const functionResponse = await Promise.resolve(this.app.callFunction(responseMessageObject.function_call.name, functionParams));
                messages.push({
                    "role": "function",
                    "name": functionName,
                    "content": functionResponse || 'none'
                });
            } else {
                hallucinatedFunctionMessages.push(responseMessageObject);
                hallucinatedFunctionMessages.push({
                    "role": "function",
                    "name": functionName,
                    "content": 'none'
                });
            }


            //Sending Updated Messages Back to OpenAI:
            completion = await Promise.resolve(this.openai.chat.completions.create({
                model: this.app.model,
                temperature: this.app.temperature,
                messages: [...messages, ...hallucinatedFunctionMessages],
                functions: availableFunctions
            }));
            console.log("Received from ChatGPT: ");
            console.log(JSON.stringify(completion));
            responseMessageObject = completion.choices[0].message;
        }
        return { responseMessageObject, completion };
    }

    substituteText(text) {
        text = text.replaceAll('{{APP_NAME}}', this.app.appName);
        text = text.replaceAll('{{CHATS_LIST_TITLE}}', this.app.chatListTitle);
        text = text.replaceAll('{{NEW_CHAT}}', this.app.newChatLabel);
        text = text.replaceAll('{{CONTENT_PREVIEW_PLACE_HOLDER}}', this.app.contentPreviewPlaceholder);
        text = text.replaceAll('{{CHAT_START_INSTRUCTIONS}}', this.app.chatStartInstruction);
        text = text.replaceAll('{{NEW_CHAT_NAME}}', this.app.newChatName);
        text = text.replaceAll('{{APP_ICON}}', this.app.appIconName);
        text = text.replaceAll('{{MAX_TOKENS}}', this.app.modelMaxTokens);
        return text;
    }


  
}