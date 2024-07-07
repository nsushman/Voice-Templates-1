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
        user_prompt = data.get("transcript")
        system_prompt = """
        You will play the role of a dentist.
        You will be given a transcript of a voice recording of a dentist, and you will convert that into the format of a clinical note.
        The notes will have to structured into headings, and sections.
        Please ensure that all parts of the transcript are present in the notes.
        Ensure that the categorization is accurate.
        If certain parts of the transcript do not fit under any of the categories, please create a new section called "Other commentary" and place these points under that.
        Following are some specifications to adhere by:
            1. The tooth numbers are to be expressed in shortened palmer's notation
                a. Example upper right 5 should be UR5, or Lower right 4 should be LR4, Upper right canine should be UR3.
            2. Use the following sections where possible (Complain/history of complain, Medical social dental history, Intraoral extra oral exam, Clinical findings, X-rays, Diagnosis, Discussion of options, risks and costs, Treatment plan)
        Words that do not contextually fit within any of the sentences should be in bold.
        Never add any new information at all. Strictly stick to the provided transcript information only.
        """

        final_prompt = f"{system_prompt}\n\nUser:\n{user_prompt}"
        
        if not user_prompt:
            return jsonify({"error": "Prompt is required"}), 400

        response = openai.chat.completions.create(
            model="text-davinci-003",
            prompt=final_prompt,
            max_tokens=150
        )
        return jsonify({"content": response.choices[0].message['content'].strip()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
