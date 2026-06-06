#!/usr/bin/env python3
"""Simple Flask server to proxy Oxford Dictionary API"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
import os

# Add the project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from oxford import Word, WordNotFound

app = Flask(__name__)
CORS(app)

@app.route('/api/dictionary/<word>', methods=['GET'])
def get_word(word: str):
    try:
        Word.get(word)
        info = Word.info()
        return jsonify(info)
    except WordNotFound:
        return jsonify({'error': 'Word not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=3001, debug=True)
