import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const ChatRoom = () => {
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState('');
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState(null); 

    useEffect(() => {
        const newSocket = io('http://localhost:5002');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server');
        });

        newSocket.on('receive_message', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch('http://localhost:5002/messages');
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };
        fetchMessages();
    }, []);

    const sendMessage = () => {
        if (socket && user && message) { // Check if socket exists
            socket.emit('send_message', { user, message });
            setMessage('');
        } else {
            alert("Please enter both username and message or wait for connection!");
        }
    };

    return (
        <div>
            <h2>Chat Room</h2>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>
                        <strong>{msg.user}:</strong> {msg.message}
                    </li>
                ))}
            </ul>
            <div>
                <input type="text" placeholder="Your name" value={user} onChange={(e) => setUser(e.target.value)} />
                <input type="text" placeholder="Type your message..." value={message} onChange={(e) => setMessage(e.target.value)} />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatRoom;