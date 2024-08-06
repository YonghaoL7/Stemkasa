import requests
import webbrowser
import time
import os
from dotenv import load_dotenv, dotenv_values

#send request
load_dotenv()
print('Enter a URL for the image intended to be converted: ')
imageSend = input()
payload = {
    "image_url": f"{imageSend}",
    "enable_pbr": True,
}
headers = {
    "Authorization": f"{os.getenv("MY_KEY")}"
}

send = requests.post(
    "https://api.meshy.ai/v1/image-to-3d",
    headers=headers,
    json=payload,
)
send.raise_for_status()
task_id = send.json()['result']
print(task_id)

#arbitrary delay to avoid api timeout
print('The task is processing. Please wait 2 minutes.')
time.sleep(120)
print('Task is complete. Redirecting...')
time.sleep(3)

#recieve model
response = requests.get(
    f"https://api.meshy.ai/v1/image-to-3d/{task_id}",
    headers=headers,
)
response.raise_for_status()
preview_url = response.json()['thumbnail_url']
print(preview_url)
webbrowser.open(preview_url, new=0, autoraise=True)
