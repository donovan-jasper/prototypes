from builder.code_builder import parse_code_blocks


def test_parse_code_blocks():
    response = '''Here's the code:

```src/app.py
from flask import Flask
app = Flask(__name__)
```

```templates/index.html
<h1>Hello</h1>
```

```requirements.txt
flask
```
'''
    files = parse_code_blocks(response)
    assert len(files) == 3
    assert "src/app.py" in files
    assert "Flask" in files["src/app.py"]
    assert "templates/index.html" in files
    assert "requirements.txt" in files


def test_parse_code_blocks_with_language_hint():
    response = '''```python src/main.py
print("hello")
```'''
    files = parse_code_blocks(response)
    assert "src/main.py" in files


def test_parse_code_blocks_empty():
    assert parse_code_blocks("no code here") == {}
