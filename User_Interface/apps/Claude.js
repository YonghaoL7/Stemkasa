import { ConversationalApp } from '../ConversationalApp.js';
import fs from 'fs';
import fetch from 'node-fetch';

export class Claude extends ConversationalApp {
    appName = 'Claude';
    chatListTitle = 'My App';
    newChatLabel = 'New App';
    appIconName = 'chat';
    chatStartInstruction = 'Please provide your question';
    botid = 31;
    model = "claude-3-5-sonnet-20240620";
    modelMaxTokens = 1024;

    constructor(context) {
        super(context);
    }

    getInstructionMessages() {
        return []
    }


    getChatNameFromMessage(responseMessage) {
        return "Claude Chat"
    }

    getTextMessage(responseMessage){}

    getAppContent(responseMessage) { }
}