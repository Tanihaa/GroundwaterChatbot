from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import requests
import json
import time
from pathlib import Path
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from auth import auth
from db import history_collection
from config import JWT_SECRET_KEY


# Import the enhanced data processor
from data_processing import GroundwaterDataProcessor

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
jwt = JWTManager(app)
app.register_blueprint(auth)


# Configuration
GROQ_API_KEY = "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"
MODEL = "llama3-8b-8192"
EXCEL_PATH = Path("C:\\Users\\Nitin\\Documents\\programming\\bangaloregroundwaterchatbot\\backend\\venv\\data\\Bangalore-urban.xlsx")

# Performance tracking
query_stats = {
    "timestamp": [],
    "query": [],
    "response_time": [],
    "sources_used": [],
    "mode": [],
    "response_length": []
}

# Initialize the enhanced data processor
data_processor = GroundwaterDataProcessor(EXCEL_PATH)

def ask_groq(prompt, context=""):
    """Query the Groq API with enhanced context"""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    system_message = """You are a helpful groundwater data assistant for Bangalore.
    Provide accurate, concise information about groundwater conditions, water tables, 
    and related environmental factors specific to Bangalore, India."""

    if context:
        system_message += f"\n\nHere's some relevant data that might help answer the query: {context}"

    data = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            return f"Error from Groq API: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Error connecting to Groq API: {str(e)}"

@app.route('/api/chat', methods=['POST'])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    start_time = time.time()
    data = request.json
    query = data.get('message', '')

    if not query:
        return jsonify({"error": "No message provided"}), 400

    results, message = data_processor.query_data(query)

    if results:
        for item in results:
            for key in item:
                if isinstance(item[key], pd.Timestamp):
                    item[key] = item[key].strftime('%Y-%m-%d')

        trimmed_results = results[:20]
        context = json.dumps(trimmed_results, indent=2)
        groq_response = ask_groq(query, context)

        history_collection.insert_one({
            "user_id": user_id,
            "query": query,
            "response": groq_response,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        })

        return jsonify({
            "text": groq_response,
            "source": "combined",
            "data": results
        })
    else:
        groq_response = ask_groq(query)

        history_collection.insert_one({
            "user_id": user_id,
            "query": query,
            "response": groq_response,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        })

        return jsonify({
            "text": groq_response,
            "source": "groq",
            "data": None
        })


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Return performance statistics"""
    stats_df = pd.DataFrame(query_stats)

    summary = {
        "total_queries": len(stats_df),
        "avg_response_time": stats_df["response_time"].mean() if not stats_df.empty else 0,
        "data_usage": {
            "combined": len(stats_df[stats_df["mode"] == "data_enhanced"]),
            "groq_only": len(stats_df[stats_df["mode"] == "general"])
        }
    }

    return jsonify(summary)

@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_user_history():
    user_id = get_jwt_identity()
    history = list(history_collection.find({"user_id": user_id}, {"_id": 0}))
    return jsonify(history)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
