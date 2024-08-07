import React from 'react'
import "./style.css"
import { useState } from 'react'



export default function App(){
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSend = () => {
    if(input.trim() === ''){
        return;
    }

    const messageInfoUser = {text: input, role: 'user'};
    setMessages([...messages, messageInfoUser]);

    const messageInfoBot = {text: `Sample response ${input}`, role: 'bot'}
        setTimeout(() => {
            setMessages((prevMessages) => [...prevMessages, messageInfoBot]);
        }, 500);

        setInput('');
}
    const handleInputChange = (e) => {
    setInput(e.target.value)
}

    const handleKeyPress = (e) => {
    if(e.key === "Enter"){
        handleSend();
    }
}
    const handleVoice = () => {
        //Integrate voice
    }
    
    return(
        <div className="chatbot-container">
            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.text}
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
                <button onClick={handleVoice}>Voice</button>
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    )
}
