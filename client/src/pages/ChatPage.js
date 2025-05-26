import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Stack, CircularProgress } from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Custom scroll hook
function useChatScroll(dep) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dep]);

  return ref;
}

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [character, setCharacter] = useState('');
  const scrollRef = useChatScroll(chatHistory);

  // Speech recognition
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  window.speechSynthesis.getVoices(); // triggers voice load


  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert("Browser doesn't support speech recognition");
    }
  }, [browserSupportsSpeechRecognition]);

  // Update input field with transcript in real-time
  useEffect(() => {
    setMessage(transcript);
  }, [transcript]);

  useEffect(() => {
    const selected = localStorage.getItem('selectedCharacter');
    if (!selected) {
      window.location.href = '/';
    } else {
      setCharacter(selected);
    }
  }, []);

  // Fetch previous chat history on login
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const selectedCharacter = localStorage.getItem('selectedCharacter');

    if (userId && selectedCharacter) {
      axiosInstance
        .get('/api/v1/chat-history', {
          params: { userId, character: selectedCharacter }
        })
        .then(response => {
          if (response.data) {
            setChatHistory(response.data.messages); // Load previous messages
          }
        })
        .catch(err => {
          console.error('Error fetching chat history:', err);
        });
    }
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;
  
    const selectedCharacter = localStorage.getItem('selectedCharacter');
    if (!selectedCharacter) {
      setChatHistory(prev => [...prev, { from: 'bot', text: 'No character selected.' }]);
      return;
    }
  
    const newUserMessage = { from: 'user', text: message };
    setChatHistory(prev => [...prev, newUserMessage]);
    setMessage('');
    setLoading(true);
    resetTranscript();
  
    // Select the voice model based on input type
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    let selectedVoice;
  
    // Check if message contains Hindi to use Hindi voice model
    if (message.match(/[a-zA-Z]/) && message.match(/[\u0900-\u097F]/)) {
      // Check for available Hindi voices and use the most neutral sounding one
      selectedVoice = voices.find(v => v.lang === "hi-IN") || voices.find(v => v.lang === "en-IN");
    } else {
      // Default to English voice
      selectedVoice = voices.find(v => v.lang === "en-US") || voices[0];
    }
  
    try {
      const res = await axiosInstance.post('/api/v1/chat/chat', {
        userId: localStorage.getItem('userId'),
        message,
        character: selectedCharacter
      });
    
      const reply = res.data.reply;
      setChatHistory(prev => [...prev, { from: 'bot', text: reply }]);
    
      // Save updated chat history
      await axiosInstance.post('/api/v1/chat-history', {
        userId: localStorage.getItem('userId'),
        character: selectedCharacter,
        messages: [...chatHistory, { from: 'user', text: message }, { from: 'bot', text: reply }]
      });
    
      // Speak response if voice input was used
      if (transcript && transcript.length > 0) {
        const replyUtterance = new SpeechSynthesisUtterance(reply.replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu, ''));
        replyUtterance.voice = selectedVoice;
        synth.speak(replyUtterance);
      }
    
    } catch (err) {
      console.error('Chat error:', err);
      setChatHistory(prev => [...prev, { from: 'bot', text: 'Something went wrong.' }]);
    }
     finally {
      setLoading(false);
    }
  };
  

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#2e2e2e', color: 'white' }}>
      {/* Header */}
      <Box p={2} textAlign="center">
        <Typography variant="h5">Chatting with: <strong>{character}</strong></Typography>
      </Box>

      {/* Message List */}
      <Box ref={scrollRef} flex={1} mx={3} p={2} borderRadius={2} sx={{ backgroundColor: '#3a3a3a', overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
        <Stack spacing={2}>
          {chatHistory.map((msg, index) => (
            <Box key={index} sx={{ textAlign: msg.from === 'bot' ? 'left' : 'right', backgroundColor: msg.from === 'bot' ? '#555' : '#2e7d32', color: 'white', borderRadius: 2, p: 1, maxWidth: '80%', alignSelf: msg.from === 'bot' ? 'flex-start' : 'flex-end' }}>
              <Typography variant="body1">{msg.text}</Typography>
            </Box>
          ))}
          {loading && <Box sx={{ color: 'white', textAlign: 'left' }}>Thinking...</Box>}
        </Stack>
      </Box>

      {/* Input & Controls */}
      <Box display="flex" gap={2} p={2}>
        <TextField fullWidth placeholder="Type or speak your message..." variant="filled" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} sx={{ backgroundColor: 'white', borderRadius: 2 }} />
        <Button variant="outlined" onClick={() => { if (!listening) { SpeechRecognition.startListening({ continuous: false, language: 'en-IN' }); } else { SpeechRecognition.stopListening(); } }} sx={{ borderRadius: 2, backgroundColor: listening ? '#f44336' : '#1976d2', color: 'white', minWidth: '120px' }}>
          {listening ? 'Listening...' : '🎙 Speak'}
        </Button>
        {listening && <CircularProgress size={24} color="inherit" />}
        <Button variant="contained" sx={{ borderRadius: 2 }} onClick={handleSendMessage} disabled={loading}>Send</Button>
      </Box>
    </Box>
  );
};

export default ChatPage;