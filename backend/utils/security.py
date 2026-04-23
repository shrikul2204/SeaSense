from flask import request
from config import Config

def require_api_key():
    key = request.headers.get("x-api-key")
    return key == Config.API_KEY
