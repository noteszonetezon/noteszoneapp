const API_KEY = 'AIzaSyBjXV4kuE9wpU9zzyq9OA6DEAYNVXo31RU'; // Replace with your Gemini API key
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const loading = document.getElementById('loading');

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: conversationHistory,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const aiMessage = data.candidates[0].content.parts[0].text;

    // Add AI's response to the conversation history
    conversationHistory.push({ role: 'model', parts: [{ text: aiMessage }] });

    // Replace the loading message with the AI's response
    replaceLoadingWithResponse(loadingMessage, aiMessage);
  } catch (error) {
    console.error('Error:', error);
    alert('Error sending message. Please try again.');
    // Remove the loading message if there's an error
    chatContainer.removeChild(loadingMessage);
  }
}

function addMessageToChat(message, sender) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}-message`;
  messageElement.textContent = message;
  chatContainer.appendChild(messageElement);

  // Scroll to the bottom of the chat container
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

  // Scroll to the bottom of the chat container
  chatContainer.scrollTop = chatContainer.scrollHeight;

  return loadingMessage;
}

function replaceLoadingWithResponse(loadingMessage, response) {
  // Remove the loading message
  chatContainer.removeChild(loadingMessage);

  // Add the AI's response to the chat
  addMessageToChat(response, 'ai');
}