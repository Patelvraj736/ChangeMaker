import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../../assets/css/ChatBot.css";
import send from "../../assets/icons/send.svg";

const ChatBot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const chatBoxRef = useRef(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        const userMessage = { from: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/chatbot`, { message: input });
            const botMessage = { from: "bot", text: res.data.reply };
            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            console.error(err);
        }

        setInput("");
    };

    return (
        <div className="chatbot-container">
            <h3>Ask me about NGOs 👇</h3>
            <div className="chatbox" ref={chatBoxRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.from}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="input-area">
                <div className="chat-wrapper">
                    <input
                        className="chat"
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type your query..."
                    />
                    <img src={send} alt="Send" className="send-icon" onClick={sendMessage} />
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
