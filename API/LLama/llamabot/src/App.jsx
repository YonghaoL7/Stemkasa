import React from 'react'
import "./style.css"
import { useState } from 'react'
import { getLlamaResponse } from './LlamaEngine';
import {  } from '@fortawesome/react-fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faChevronRight} from '@fortawesome/free-solid-svg-icons'
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';

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
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false; 
        recognition.interimResults = false; 
        recognition.lang = 'en-US';

        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript); 
            handleSend(); 
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error: ", event.error);
            alert('Speech recognition error occurred. Please try again.');
        };
    
        recognition.onend = () => {
            console.log("Speech recognition ended.");
        };
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
                <button className="btn-send" onClick={handleSend}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
                <button className="btn-voice" onClick={handleVoice}>
                    <FontAwesomeIcon icon={faMicrophone} />
                </button>
            </div>
        </div>
    )
}
