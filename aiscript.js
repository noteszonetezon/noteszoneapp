const API_KEY = 'AIzaSyA8RVbvbeX52QPj1dcg2jPFMWHLdnTt90s'; // Replace with your actual Gemini API key
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');

let conversationHistory = [];

async function sendMessage() {
  const userMessage = userInput.value.trim();
  
  if (!userMessage) {
    alert('Please enter a message.');
    return;
  }

  // Add user's message to the chat
  addMessageToChat(userMessage, 'user');

  // Clear the input
  userInput.value = '';

  // Show loading animation in the chat box
  const loadingMessage = showLoadingInChat();

  try {
    // Add user's message to the conversation history
    conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });

    // Send the conversation history to the API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: conversationHistory }),
      }
    );

    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

    const data = await response.json();

    // Validate API response structure
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) throw new Error('Invalid API response format');

    // Add AI's response to the conversation history
    conversationHistory.push({ role: 'model', parts: [{ text: aiResponse }] });

    // Replace loading message with AI response
    replaceLoadingWithResponse(loadingMessage, aiResponse);
  } catch (error) {
    console.error('Error:', error);
    alert('Error sending message. Please try again.');

    // Remove the loading message if an error occurs
    if (loadingMessage && chatContainer.contains(loadingMessage)) {
      chatContainer.removeChild(loadingMessage);
    }
  }
}

function addMessageToChat(message, sender) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}-message`;
  messageElement.textContent = message;
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showLoadingInChat() {
  const loadingMessage = document.createElement('div');
  loadingMessage.className = 'loading-message';
  loadingMessage.innerHTML = `
    <span>AI is typing</span>
    <div class="loading-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  chatContainer.appendChild(loadingMessage);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return loadingMessage;
}

function replaceLoadingWithResponse(loadingMessage, response) {
  if (loadingMessage && chatContainer.contains(loadingMessage)) {
    chatContainer.removeChild(loadingMessage);
  }
  addMessageToChat(response, 'ai');
}
