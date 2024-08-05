from pymongo import MongoClient
from datetime import date
import requests
import os 
from dotenv import load_dotenv


load_dotenv()
client = MongoClient(os.getenv('MONGO_CLIENT'))
db = client["stemkasa"]
bot_collection = db["STE_Bots"]

def logMessage(user_message, assistant_response, user_id, thread_id):

    """
    message types: USER_MESSAGE, ASSISTANT_MESSAGE
    """

    url = "http://www.onezeus.com:3000/chatsdml"
    params = {
                "CHAT_ID": "",
                "CHAT_PROMPT": user_message,
                "CHAT_RESPONSE":assistant_response,
                "AI_MODEL": "GPT4o",
                "FROM_USER_ID": user_id,
                "TO_USER_ID": "GPT4o",
                "CONTEXT": thread_id,
                "CREATION_DATE": date.today().isoformat(),
                "CREATED_BY": "ADMIN",
                "LAST_UPDATE_DATE": date.today().isoformat(),
                "LAST_UPDATED_BY": "ADMIN"
            }
    
    #Make the POST request
    res = requests.get(url, params=params)
    return (res.status_code, " ", res.reason)