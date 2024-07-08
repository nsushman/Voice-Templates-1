import os
import openai
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__)

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')
    
# API endpoint to handle generating prompt
@app.route('/generate-prompt', methods=['POST'])
def generate_prompt():
    data = request.get_json()
    prompt = data.get('prompt', '')

    # Check if prompt is less than 100 characters
    system_prompt = """
    You will play the role of a dentist.
    You will be given a transcript of a voice recording of a dentist, and you will convert that into the format of a clinical note.
    The notes will have to structured into headings, and sections.
    Please ensure that all parts of the transcript are present in the notes.
    Ensure that the categorization is accurate.
    If certain parts of the transcript do no fit under any of the categories, please create a new section called "Other commentary" and place these points under that.
    Following are some specifications to adhere by:
        1. The tooth numbers are to be expressed in shortened palmer's notation
            a. Example upper right 5 should be UR5, or Lower right 4 should be LR4, Upper right canine should be UR3.
        2. Use the following sections where possible (Complain/history of complain, Medical social dental history, Intraoral extra oral exam, Clinical findings, X-rays, Diagnosis, Discussion of options, risks and costs, Treatment plan)
    Words that do not contextually fit within any of the sentences should be in bold.
    Never add any new information at all. Strictly stick to the provided transcript information only.
    """
    if len(prompt) < 100:
        return jsonify({'error': 'Prompt should be at least 100 characters long'}), 400

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
        )
        return jsonify({'generated_text': response.choices[0].message.content}), 200
    except Exception as e:
        error_message = str(e)
        print(f"Error from OpenAI API: {error_message}")
        return jsonify({'error': error_message}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
