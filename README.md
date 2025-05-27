# YouTube Thumbnail Generator

A distributed system for generating high-quality YouTube thumbnails using computer vision and deep learning.

## Features

- Automated thumbnail generation from video uploads
- Face detection and optimal frame selection using DeepFace
- Distributed task processing with Celery and Redis
- Real-time progress monitoring via FastAPI endpoints
- AI-powered caption generation using Groq
- Comprehensive test suite for reliability
- Modular architecture for easy extensibility

## Tech Stack

### Backend
- FastAPI for RESTful API
- Celery for distributed task queue
- Redis for caching and message broker
- OpenCV and DeepFace for image processing
- TensorFlow for deep learning tasks
- Groq for AI caption generation

## Project Structure

```
├── app/                # Main application code
│   ├── api/           # API endpoints
│   ├── core/          # Core functionality
│   ├── models/        # Data models
│   └── services/      # Business logic
├── tests/             # Test suite
├── output/            # Generated thumbnails
└── uploads/           # Temporary video storage
```

## Prerequisites

- Python 3.9+
- Redis Server
- FFmpeg for video processing
- Docker (optional)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TexZ-GenZ/youtube-thumbnail-generator.git
   cd youtube-thumbnail-generator
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

## Running the Application

1. Start Redis server:
   ```bash
   redis-server
   ```

2. Start Celery worker:
   ```bash
   celery -A app.worker worker --loglevel=info
   ```

3. Start FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## API Endpoints

- `POST /api/v1/upload`: Upload video for thumbnail generation
- `GET /api/v1/status/{task_id}`: Check thumbnail generation status
- `GET /api/v1/thumbnail/{task_id}`: Download generated thumbnail

## Testing

Run the test suite:
```bash
pytest tests/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
