from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from .routes.auth import auth_bp
    from .routes.upload import upload_bp
    from .routes.extract import extract_bp
    from .routes.chat import chat_bp
    from .routes.sentiment import sentiment_bp
    from .routes.export import export_bp
    from .routes.meetings import meetings_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(upload_bp, url_prefix='/api')
    app.register_blueprint(extract_bp, url_prefix='/api')
    app.register_blueprint(chat_bp, url_prefix='/api')
    app.register_blueprint(sentiment_bp, url_prefix='/api')
    app.register_blueprint(export_bp, url_prefix='/api')
    app.register_blueprint(meetings_bp, url_prefix='/api')

    @app.route('/health')
    def health():
        return {'status': 'ok'}

    return app