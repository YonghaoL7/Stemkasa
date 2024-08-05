import time
from flask import jsonify
from openai import OpenAI
from dotenv import load_dotenv
import os

# setting up openai api
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI()
client.api_key = OPENAI_API_KEY

def instructionsFromFile(filepath):
    with open(filepath, 'r') as file:
        return file.read()
    
DEFAULT_ASSISTANT_INSTRUCTIONS = instructionsFromFile("./utils/defaultInstructions.txt")


def createAssistant(customInstructions = DEFAULT_ASSISTANT_INSTRUCTIONS):
    # Params: Custom Instructions for assistant, goes to default otherwise
    # Returns: Assistant ID
    
    assistant = client.beta.assistants.create(
    name="StemKasa Assistant",
    instructions=customInstructions,
    model="gpt-4o-mini",
    tools=[],
    tool_resources={}
    ) 
    #TESTING PURPOSES
    print("Created assisstant. ID: ", assistant.id)
    return assistant.id



def createThread():
    # Returns: Thread ID
    thread = client.beta.threads.create()
    return thread.id

def queueMessage(threadID, message="", messageType="text", file=""):
    
    #TESTING PURPOSES
    print("Queuing Message")

    if messageType == "text":
        thread_message = client.beta.threads.messages.create(
            thread_id=threadID,
            role="user",
            content=message
        )
    elif messageType == "image_url":
        thread_message = client.beta.threads.messages.create(
            thread_id=threadID,
            role="user",
            content= [{"type": "text", "text": message},
                      {"type": "image_url","image_url": {"url": file}}]
        )
    else:
        thread_message = client.beta.threads.messages.create(
            thread_id=threadID,
            role="user",
            content= [{"type": "text", "text": message},
                      {"type": "image_file","image_file": {"file_id": file}}]
        )
    
    #TESTING PURPOSES
    print("Finished Queue")
    return thread_message.id

# user, content, timestamp
# assistant, content, timestamp

def getMessages(assistantID, threadID):
    run = client.beta.threads.runs.create_and_poll(
        thread_id=threadID,
        assistant_id=assistantID
    )

    #TESTING PURPOSES
    print("Getting Message")
    print(run.status)

    response = {}

    if run.status == 'completed': 
        messages = client.beta.threads.messages.list(
            thread_id=threadID
        )
        for message in messages:
            for content in message.content:
                if content.type == 'text' and message.role == 'assistant':
                    
                    response['ASSISTANT_MESSAGE'] = content.text.value

                else:

                    response['USER_MESSAGE'] = content.text.value

                    # FOR TESTING PURPOSES
                    # try:
                    #     return jsonify({"result": content.text.value}), 200
                    # except Exception as e:
                    #     return content.text.value
    else:
        return 
    
    return response

def getMessageHistory(threadID):
    history = []
    
    messages = client.beta.threads.messages.list(
        thread_id = threadID
    )

    for message in messages:
        for content in message.content:
            if content.type == 'text':
                history.append({"timestamp": message.created_at,
                                "role" : message.role,
                                "content": content.text.value})
                
    return history


def generateImage(imagePrompt =""):
    response = client.images.generate(
        model="dall-e-3",
        prompt= imagePrompt,
        size="1024x1024",
        quality="standard",
        n=1,
    )

    return response.data[0].url


def transcribeAudio(audio_file_path):

    
    with open(audio_file_path, 'rb') as audio_file: 
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="text",
        )
    return response



## Uncomment to test -------------------------------------------------------------
# DUMMY_ASSISTANT = "asst_P4UuKGcwVTEbpmDXVxVshRJU"
# DUMMY_THREAD = "thread_ImnGPQHRHmyO3itTeznSwev0"

# queueMessage(DUMMY_THREAD, "Tell me about walruses")
# finishedMessage1 = getMessages(DUMMY_ASSISTANT, DUMMY_THREAD)
# print(finishedMessage1)

# # queueMessage(DUMMY_THREAD, "Tell me about physics in 3 sentences")
# # finishedMessage2 = getMessages(DUMMY_ASSISTANT, DUMMY_THREAD)
# # print(finishedMessage2)


# messageHistory = getMessageHistory(DUMMY_THREAD)
# print("\n", "MESSAGE HISTORY: ", messageHistory)

## --------------------------------------------------------------------------------
