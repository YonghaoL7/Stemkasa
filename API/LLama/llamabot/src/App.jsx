import React from 'react'
import "./style.css"
import { useState } from 'react'
import { getLlamaResponse } from './LlamaEngine';


export default function App(){
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    // async function handleResponses(){
    //     const messageInfoUser = {text: input, role: 'user'};
    //     setMessages([...messages, messageInfoUser]);

    //     const messageInfoBot = {text: `${await getLlamaResponse(input)}`, role: 'bot'}
    //     setTimeout(() => {
    //         setMessages((prevMessages) => [...prevMessages, messageInfoBot]);
    //     }, 500);
    // }

    async function handleResponses(){
        const userMessage = { role: 'user', content: input };
        const updatedMessages = [...messages, userMessage];
        
        setMessages(updatedMessages);

        const botResponse = await getLlamaResponse(updatedMessages);
        const botMessage = { role: 'assistant', content: botResponse };

        setTimeout(() => {
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        }, 500);
    }

    const handleSend = () => {
        if(input.trim() === ''){
            return;
        }
        handleResponses();
        setInput('');
    };

    const handleInputChange = (e) => {
        setInput(e.target.value)
    };

    const handleKeyPress = (e) => {
        if(e.key === "Enter"){
            handleSend();
        }
    };

    const handleVoice = () => {
        //Integrate voice
    };
    
    return(
        <div className="chatbot-container">
            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        {msg.content}
                    </div>
                ))}
            </div>
            <div className="chatbot-input">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                />
                <button onClick={handleSend}>Send</button>
                <button onClick={handleVoice}>Voice</button>
            </div>
        </div>
    )
}
