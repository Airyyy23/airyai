import { useRef, useState, useEffect } from 'react';
import './App.css'; // Ensure Tailwind CSS is imported here
import { Groq } from 'groq-sdk';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { lucario } from 'react-syntax-highlighter/dist/esm/styles/prism';

const GROQ_API = import.meta.env.VITE_AIRY_AI_TOKEN;
const groq = new Groq({
  apiKey: GROQ_API,
  dangerouslyAllowBrowser: true,
});

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef();
  const messagesEndRef = useRef(null);

  const requestToGroqAI = async (userMessage) => {
    try {
      setIsLoading(true);
      const reply = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ],
        model: 'llama3-8b-8192'
      });
      return reply.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching response from AI:', error);
      return 'Terjadi kesalahan. Silakan coba lagi.';
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userMessage = inputRef.current.value.trim();

    if (userMessage === '') {
      return; // Do not send empty messages
    }

    // Add user message to chat history
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'user', content: userMessage }
    ]);

    // Request AI response
    const aiResponse = await requestToGroqAI(userMessage);

    // Add AI response to chat history
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'ai', content: aiResponse }
    ]);

    // Clear input field
    inputRef.current.value = '';
  };

  // Scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <main className='flex flex-col min-h-screen w-full max-w-full bg-gray-900 text-gray-100'>
      <div className='fixed w-full p-4 bg-gray-800 shadow-2xl shadow-gray-700'>
        <h1 className='text-3xl font-bold text-white'>Airy AI</h1>
      </div>
      <div className='flex-1 w-full max-w-full bg-gray-800 shadow-md rounded-lg flex flex-col pt-16'>
        <div className='p-4 flex-1 mb-[70px] overflow-y-auto'>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 px-5 py-3 rounded-md ${msg.role === 'user' ? 'bg-gray-700 text-right' : 'bg-[#263E52] text-left'}`}
            >
              {msg.role === 'user' ? (
                <p>{msg.content}</p>
              ) : (
                <SyntaxHighlighter language="swift" style={lucario} wrapLongLines={true}>
                  {msg.content}
                </SyntaxHighlighter>
              )}
            </div>
          ))}
          {/* Loading indicator */}
          {isLoading && (
            <div className='text-center text-gray-400'>Waiting response...</div>
          )}
          {/* End of chat */}
          <div ref={messagesEndRef} />
        </div>
        <div className='bg-gray-800 fixed bottom-0 py-4 w-full'>
          <form className='w-[90%] mx-auto bg-gray-700 rounded-full flex items-center gap-3 py-2 px-4' onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder='Message to AiryAI'
              ref={inputRef}
              className='w-full p-2 bg-transparent border-none text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-0'
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`bg-[#003559] duration-300 text-white p-3 rounded-full flex items-center justify-center hover:bg-[#0c2f44] ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              disabled={isLoading}
            >
              <i className="fa-solid fa-arrow-up-from-bracket"></i>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default App;
