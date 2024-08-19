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
    modelMaxTokens = 4096;
    ApiName = 'Claude'

    constructor(context) {
        super(context);
    }

    getInstructionMessages() {
        return []
    }


    getChatNameFromMessage(responseMessage) {
        return "Claude Chat"
    }

    getTextMessage(responseMessage){return `<p>${responseMessage}</p>`;
    }

    getAppContent(responseMessage) {return `<div class="content-container">${responseMessage}</div>
    <style>
        .content-container {
            background-color: #f5f5f5;
            border-radius: 10px;
            padding: 20px;
            font-size: 14px;
            margin: 20px 0;
        }
    </style>`; }
}