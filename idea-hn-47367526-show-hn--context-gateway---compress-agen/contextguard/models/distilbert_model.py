from transformers import DistilBertTokenizer, DistilBertModel
import torch

tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
model = DistilBertModel.from_pretrained('distilbert-base-uncased')

def compress_context(tool_output):
    inputs = tokenizer(tool_output, return_tensors="pt", truncation=True, max_length=512)
    outputs = model(**inputs)
    compressed_content = outputs.last_hidden_state.mean(dim=1).detach().numpy().tolist()
    return compressed_content

def expand_context(compressed_content):
    # Implement expansion logic here
    pass
