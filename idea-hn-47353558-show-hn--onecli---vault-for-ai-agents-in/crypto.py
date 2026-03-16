from cryptography.fernet import Fernet
import base64

def generate_key():
    """Generates a Fernet key and returns it as a URL-safe base64-encoded string."""
    return Fernet.generate_key().decode()

def encrypt(data: str, key: str) -> str:
    """Encrypts a string using Fernet."""
    if not data:
        return ""
    f = Fernet(key.encode())
    encrypted_data = f.encrypt(data.encode())
    return encrypted_data.decode()

def decrypt(encrypted_data: str, key: str) -> str:
    """Decrypts a string using Fernet."""
    if not encrypted_data:
        return ""
    f = Fernet(key.encode())
    decrypted_data = f.decrypt(encrypted_data.encode())
    return decrypted_data.decode()
