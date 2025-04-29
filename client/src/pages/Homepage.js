import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Stack } from '@mui/material';

const Homepage = () => {
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        { from: "bot", text: "MovieBot: Hello, which character do you want to talk to today?" }
    ]);

    const handleSendMessage = () => {
        if (message.trim() !== "") {
            setChatHistory([...chatHistory, { from: "user", text: message }]);

            // Simulating a bot response
            setChatHistory((prevChatHistory) => [
                ...prevChatHistory,
                { from: "bot", text: `MovieBot: You said: ${message}` }
            ]);

            setMessage(""); // Clear input field
        }
    };

    return (
        <Box
            height="calc(100vh - 70px)" // Subtract navbar height
            display="flex"
            flexDirection="column"
            sx={{ backgroundColor: '#2e2e2e', color: 'white' }}
        >
            {/* Chat Title */}
            <Box p={3} textAlign="center">
                <Typography variant="h4" fontWeight="bold">
                    Movie Character ChatBot 🎬🤖
                </Typography>
            </Box>

            {/* Chat Message Box */}
            <Box
                flex={1}
                mx={3}
                p={2}
                borderRadius={2}
                sx={{
                    backgroundColor: '#3a3a3a',
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 200px)', // Control height to make chat scrollable
                }}
            >
                {/* Display chat messages */}
                <Stack spacing={2}>
                    {chatHistory.map((message, index) => (
                        <Box
                            key={index}
                            sx={{
                                textAlign: message.from === "bot" ? "left" : "right",
                                backgroundColor: message.from === "bot" ? '#555' : '#2e7d32',
                                color: 'white',
                                borderRadius: 2,
                                p: 1,
                                maxWidth: '80%',
                                alignSelf: message.from === "bot" ? "flex-start" : "flex-end",
                            }}
                        >
                            <Typography variant="body1">{message.text}</Typography>
                        </Box>
                    ))}
                </Stack>
            </Box>

            {/* Input Section */}
            <Box display="flex" gap={2} p={2}>
                <TextField
                    fullWidth
                    placeholder="Type your message..."
                    variant="filled"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ backgroundColor: 'white', borderRadius: 2 }}
                />
                <Button
                    variant="contained"
                    sx={{ borderRadius: 2 }}
                    onClick={handleSendMessage}
                >
                    Send
                </Button>
            </Box>
            <Typography variant="p" p={1} sx={{textAlign: "center"}}>
                Designed & Developed by himanijangid07
            </Typography>
        </Box>
    );
};

export default Homepage;
