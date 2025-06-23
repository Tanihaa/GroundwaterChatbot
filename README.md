
# Bangalore Groundwater Chatbot

A web-based chatbot application that provides users with information and insights about groundwater conditions in Bangalore, India. The system integrates a conversational AI interface with real groundwater data analytics and user authentication.

## Features

- **Interactive Chat Interface:** Users can ask questions about groundwater levels, trends, and comparisons for different locations in Bangalore[1][2].
- **Data-Driven Responses:** The chatbot leverages an Excel dataset of Bangalore urban groundwater data to generate accurate, context-aware answers[2][3].
- **User Authentication:** Secure login and registration system with JWT token-based authentication[4][5].
- **Conversation History:** Users can view and resume previous conversations, stored securely in a MongoDB database[1][2][6].
- **Analytics Dashboard:** Displays usage statistics and response performance metrics[1][2].
- **Responsive Design:** Clean, modern UI with responsive layouts for desktop and mobile[7].

## Technology Stack

- **Frontend:** React.js, CSS (responsive design), state management with hooks[1][7].
- **Backend:** Flask (Python), REST API for chat, authentication, and data retrieval[2][5].
- **Database:** MongoDB for user accounts and conversation history[6].
- **AI Integration:** Groq API with LLM (Llama3-8b-8192) for natural language understanding and response generation[2].
- **Data Processing:** Pandas for data cleaning, filtering, and querying[3].

## How It Works

1. **User Authentication:** Users register or log in to access the chatbot.
2. **Ask Questions:** Users type questions about Bangalore groundwater conditions (e.g., "What is the groundwater level in Whitefield?").
3. **Data Processing:** The backend parses the query, searches the groundwater dataset, and augments the LLM prompt with relevant data.
4. **Response Generation:** The LLM generates a clear, informative answer, optionally including data tables for detailed results.
5. **History and Analytics:** Users can review past conversations and view usage statistics.

- "What is the current groundwater level in Koramangala?"
- "Show trends in groundwater level for HSR Layout over the last year."
- "Compare groundwater levels between Whitefield and Indiranagar."
