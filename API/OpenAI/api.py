from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from bson import ObjectId, json_util
import json



from open_ai import *
from mongo import *

app = Flask(__name__)


CORS(app)

# Set up temp storage for audio files
UPLOAD_FOLDER = 'audio_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/openaipostmessage', methods=['POST'])
def aivisionchat_post():
    """
    Handle AI Vision Chat POST requests.

    This endpoint processes a vision-related request by either an image URL or a file ID,
    creates a thread, runs the thread, and returns the resulting text content.

    Request Parameters:
        - USER_ID (str): ID of the user making the request.
        - PROMPT (str): Prompt for the AI vision task.
        - IMAGE_URL (str): URL of the image to be processed (optional).
        - FILE_ID (str): ID of the file to be processed (optional).

        - ASSISTANT_ID (str): Assistant ID for OPENAI Assistant. If nothing is passed, will create new chat by creating new assistant
        - THREAD_ID (str) : Thread ID for OPENAI Assistant

    Returns:
        JSON response with the text content generated or an error status.
    """

    try:
        user_id = request.args.get("USER_ID")
        prompt = request.args.get("PROMPT")
        image_url = request.args.get("IMAGE_URL")
        file_id = request.args.get("FILE_ID")
        thread_id = request.args.get("THREAD_ID")
        assistant_id = request.args.get("ASSISTANT_ID")

        if not assistant_id:
            # assistant_id = createAssistant()
            assistant_id = "asst_sCGkIW8yJJhe6643Exua9mfU"
        
        if not thread_id:
            thread = createThread()


        if not user_id or not prompt:
            return jsonify({"status": "USER_ID and PROMPT are required"}), 400

        if image_url:
            queueMessage(thread, prompt, "image_url", image_url)
        elif file_id:
            queueMessage(thread, prompt, "image_file", file_id)
        elif prompt:
            queueMessage(thread, prompt, "text")
        else:
            return jsonify({"status": "No image URL or file ID provided"}), 400
        
        #TESTING PURPOSES
        print("Fetching messages")

        messages = getMessages(assistant_id, thread)
        user_message = messages['USER_MESSAGE']
        assistant_response = messages['ASSISTANT_MESSAGE']
        
        """
        IF user_messages function returns a dictionary, that means we have a successful message.
        Otherwise, throw 500 status
        """

        try:
            
            logMessage(user_message = user_message, assistant_response = assistant_response, user_id="OPEN AI TEAM", thread_id = thread)
            return jsonify(messages), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500


    except Exception as e:
        logging.exception("Error processing AI Vision Chat request")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/fetchcontext', methods=["GET"])
def fetchcontext():
    """
    Handle Bot context GET requests.

    This endpoint processes a bot id to fetch the context (background information) from the STE_Bots
    collection

    Request Parameters:
        - BOT_ID (int): ID of the bot to fetch context from

    Returns:
        JSON response with the context or an error status.
    """
    try:
        bot_id = request.args.get("BOT_ID")
        bot_info = bot_collection.find_one({'BOT_ID': bot_id}, {'BACKGROUND_INFORMATION': 1})
        bot_info_json = json.dumps(bot_info, default=json_util.default)


    except Exception as e:
        logging.exception("Error fetching bot")
        return jsonify({"status": "error", "message": str(e)}), 500 


@app.route('/openaiimagegen', methods=['POST'])
def aiimagegen():
  """
    Handle AI Image Generation POST requests.

    This endpoint processes an AI image generation request by accepting a user ID and prompt,
    generating an image using the DALL-E model, storing the image URL and prompt in a MongoDB collection,
    and returning the URL of the generated image.

    Request Parameters (query string):
        - USER_ID (str): ID of the user making the request.
        - PROMPT (str): Prompt for the AI image generation task.

    Returns:
        JSON response with the URL of the generated image or an error status.
  """
  user_id = request.args.get("USER_ID")
  this_prompt = request.args.get("PROMPT")

  if not this_prompt:
    return jsonify({"status": "No prompt provided"}), 400

  img_url = generateImage(this_prompt)

  return jsonify({"image_url": img_url}), 200


@app.route('/speechtotext', methods=['POST'])
def speech_to_text():
    """
    Handles Speech to Text POST Requests

    This endpoint processes .wav files from the front end, and transcribes them to text.

    Request Parameters (query string):
        - FILE : .wav file containing audio with speech

    Returns:
        JSON response with the transcribed message.
    """
    
    try:    
        print("Received request at /speechtotext")
        
        if 'FILE' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        audio_file = request.files['FILE']
        
        if audio_file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        if audio_file and audio_file.filename.endswith('.wav'):
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], audio_file.filename)
            audio_file.save(filepath)
                        
            try:
                transcription = transcribeAudio(filepath)
            except Exception as e:
                print("Error during transcription.")
            finally:
                os.remove(filepath)
                print(f"File removed: {filepath}")

            return jsonify({"message": transcription}), 200
        
        
        else:
            return jsonify({"error": "Unsupported file type. Only WAV files are allowed."}), 400
    
    
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


@app.route('/messagehistory', methods=['GET'])
def messageHistory():
    """
    Gets message history for a given thread.

    Request Parameters (query string):
        - USER_ID (str): ID of the user making the request.
        - THREAD_ID (str): OpenAI Thread.

    Returns:
        Array with message history including timestamps, role, and content.
  """
    
    user_id = request.args.get("USER_ID")
    thread_id = request.args.get("THREAD_ID")

    if not thread_id:
        return jsonify({"status": "No thread id provided"}), 400
    
    return getMessageHistory(thread_id)



# boilerplate to run api - dan
if __name__ == "__main__":
    app.run(debug=True)
    print("App running")

