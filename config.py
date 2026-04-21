import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY', '')
    DEEPSEEK_BASE_URL = os.getenv('DEEPSEEK_BASE_URL', 'https://api.deepseek.com')
    PORT = int(os.getenv('PORT', 8787))
    MAX_ELEMENTS = 5
    MIN_ELEMENTS = 3
    STORY_MAX_WORDS = 350
    STORY_MIN_WORDS = 250
