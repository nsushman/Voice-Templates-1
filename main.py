import os
import openai
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__)

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        prompt = data.get("prompt")
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150
        )
        return jsonify({"content": response.choices[0].message['content'].strip()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
