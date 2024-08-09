import React from 'react'
import "./style.css"
import { useState } from 'react'
import { getLlamaResponse } from './LlamaEngine';
import {  } from '@fortawesome/react-fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faMicrophone, faPause, faRotateRight } from '@fortawesome/free-solid-svg-icons'

export default function App(){
    //const [messages, setMessages] = useState([]);
    const [messages, setMessages] = useState(() => {
        const savedConversation = localStorage.getItem('conversation');
        return savedConversation ? JSON.parse(savedConversation) : [];
    });
    const [input, setInput] = useState('');

    // useEffect(() => {
    //     const savedMessages = JSON.parse(localStorage.getItem('chatMessages'));
    //     if (savedMessages) {
    //         setMessages(savedMessages);
    //     }
    // }, []);

    // useEffect(() => {
    //     localStorage.setItem('chatMessages', JSON.stringify(messages));
    // }, [messages]);


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

    const handleContinueLater = () => {
        localStorage.setItem('conversation', JSON.stringify(messages));
        alert('Conversation saved! You can continue later.');
    };

    const handleNewChat = () => {
        setMessages([]);
        localStorage.removeItem('chatMessages');
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
                <button className="btn-continue" onClick={handleContinueLater}>
                    <FontAwesomeIcon icon={faPause} />
                </button>
                <button className="btn-new-chat" onClick={handleNewChat}>
                    <FontAwesomeIcon icon={faRotateRight} />
                </button>
            </div>
        </div>
    )
}
