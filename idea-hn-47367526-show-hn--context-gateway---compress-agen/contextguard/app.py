from flask import Flask, request, jsonify, render_template
from models.distilbert_model import compress_context
from database import init_db, store_compressed_content, get_compressed_content, store_expanded_content, get_expanded_content
from config import load_config, save_config

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/config', methods=['GET', 'POST'])
def config():
    if request.method == 'POST':
        config_data = request.form.to_dict()
        save_config(config_data)
        return jsonify({'status': 'success'})
    else:
        config_data = load_config()
        return render_template('config.html', config=config_data)

@app.route('/compress', methods=['POST'])
def compress():
    data = request.json
    tool_output = data['tool_output']
    compressed_content = compress_context(tool_output)
    store_compressed_content(compressed_content)
    return jsonify({'compressed_content': compressed_content})

@app.route('/expand', methods=['POST'])
def expand():
    data = request.json
    compressed_content_id = data['compressed_content_id']
    compressed_content = get_compressed_content(compressed_content_id)
    expanded_content = expand_context(compressed_content)
    store_expanded_content(expanded_content)
    return jsonify({'expanded_content': expanded_content})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
