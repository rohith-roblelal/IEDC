import urllib.request
import json

try:
    with urllib.request.urlopen('http://127.0.0.1:8000/api/v1/startups') as response:
        data = json.loads(response.read().decode())
        print("Startups:", data)
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Response:", e.read().decode())
except Exception as e:
    print("Error:", e)
