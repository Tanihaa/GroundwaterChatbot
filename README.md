
# Bangalore Groundwater Chatbot

A web-based chatbot application that provides users with information and insights about groundwater conditions in Bangalore, India. The system integrates a conversational AI interface with real groundwater data analytics and user authentication.

## Features

- **Interactive Chat Interface:** Users can ask questions about groundwater levels, trends, and comparisons for different locations in Bangalore.
- **Data-Driven Responses:** The chatbot leverages an Excel dataset of Bangalore urban groundwater data to generate accurate, context-aware answers.
- **User Authentication:** Secure login and registration system with JWT token-based authentication.
- **Conversation History:** Users can view and resume previous conversations, stored securely in a MongoDB database.
- **Analytics Dashboard:** Displays usage statistics and response performance metrics.
- **Responsive Design:** Clean, modern UI with responsive layouts for desktop and mobile.

## Technology Stack

- **Frontend:** React.js, CSS (responsive design), state management with hooks.
- **Backend:** Flask (Python), REST API for chat, authentication, and data retrieval.
- **Database:** MongoDB for user accounts and conversation history.
- **AI Integration:** Groq API with LLM (Llama3-8b-8192) for natural language understanding and response generation.
- **Data Processing:** Pandas for data cleaning, filtering, and querying.

## How It Works

1. **User Authentication:** Users register or log in to access the chatbot.
2. **Ask Questions:** Users type questions about Bangalore groundwater conditions (e.g., "What is the groundwater level in Whitefield?").
3. **Data Processing:** The backend parses the query, searches the groundwater dataset, and augments the LLM prompt with relevant data.
4. **Response Generation:** The LLM generates a clear, informative answer, optionally including data tables for detailed results.
5. **History and Analytics:** Users can review past conversations and view usage statistics.

- "What is the current groundwater level in Koramangala?"
- "Show trends in groundwater level for HSR Layout over the last year."
- "Compare groundwater levels between Whitefield and Indiranagar."
