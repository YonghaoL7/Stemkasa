import Anthropic from "@anthropic-ai/sdk"
import { promises as fs } from 'fs'
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

  const sendMessage = async (history, message, imageFiles) => {
    // Update the chat history
    history.push({
      role: "user",
      content: message
    });
  
    //Create a messages array
    //First add the text prompt to the array
    try {
      const messages = [{
        type: "text",
        text: message,
      }];

      //If there is at least one image inputted, iterate through each and add it to messages 
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((base64) => {
          messages.push({
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: base64,
            },
          });
        });
      }
    console.log(messages);
  
      // Send the message using anthropic API
      const msg = await anthropic.messages.create({
        messages: [
          {
            role: "user",
            content: messages,
          },
        ],
        max_tokens: 1024,
        model: "claude-3-5-sonnet-20240620",
      });
      console.log(msg);
      
      return msg;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
// const sendMessage = async(history, message) => {
//   history.push({
//     role: "user",
//     content: message
//   })
//   console.log(history)
//   const msg = await anthropic.messages.create({
//     model: "claude-3-haiku-20240307",
//     max_tokens: 1024,
//     messages: history,
//   });

  
//   return msg
// }

export default sendMessage