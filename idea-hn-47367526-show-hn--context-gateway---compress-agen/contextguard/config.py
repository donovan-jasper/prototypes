import json
from utils import load_json, save_json

CONFIG_FILE = 'config.json'

def load_config():
    try:
        return load_json(CONFIG_FILE)
    except FileNotFoundError:
        return {}

def save_config(config_data):
    save_json(config_data, CONFIG_FILE)
