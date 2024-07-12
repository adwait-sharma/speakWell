# Speak Well - Video and Audio Feedback System

## Overview
SpeakWell is an intuitive web application designed to help you master the art of public speaking and improve your communication skills. Whether you’re preparing for a speech, presentation, or any form of public address, SpeakWell provides you with a detailed analysis and constructive feedback to enhance your performance. This project provides a feedback system for video and audio analysis using NestJS. The system consists of several key components: a controller to handle requests, services to perform the actual analysis, and an interceptor to manage file uploads.

## Structure

### Controller
The `FeedbackController` is responsible for handling incoming requests for video and audio feedback.

- **Endpoints:**
  - `POST /feedback/visual` or `POST /feedback/video`: Handles video feedback requests.
  - `POST /feedback/audio`: Handles audio feedback requests.
- **Dependencies:**
  - `VideoAnalysisService`: Extracts frames from videos and gets visual feedback.
  - `AudioAnalysisService`: Extracts audio from videos and gets audio feedback.
- **Interceptor:**
  - `MultipartInterceptor`: Manages file uploads and ensures the correct file format is provided.

### Services

#### AudioAnalysisService
Handles the extraction of audio from video files and the analysis of the audio using OpenAI's GPT models.

- **Methods:**
  - `extractAudioFromVideo(filePath: string)`: Extracts audio from a given video file.
  - `analyzeAudio(audioFilePath: string)`: Analyzes the extracted audio.
  - `transcribeAudio(audioFilePath: string)`: Transcribes audio to text using OpenAI's Whisper model.
  - `analyzeWithGPT35(translation: string)`: Analyzes the transcription using GPT-3.5.

#### VideoAnalysisService
Handles the extraction of frames from video files and the analysis of these frames using OpenAI's GPT models.

- **Methods:**
  - `extractFrames(inputVideoPath: string, numFrames: number, outputDir: string)`: Extracts frames from a given video file.
  - `getVisualFeedback(framesDir?: string)`: Analyzes the extracted frames.
  - `getVideoDurationInFrames(inputVideoPath: string)`: Gets the total number of frames in a video.
  - `prepareFramesForGPT(base64Frames: string[])`: Prepares frames for GPT analysis.

#### ChatGPTService
Provides a method to interact with OpenAI's GPT models.

- **Methods:**
  - `chatCompletion(model: string, messages: any[])`: Sends a completion request to the GPT model.

### Interceptor

#### MultipartInterceptor
Manages file uploads, ensuring they are valid and correctly formatted for processing.

- **Methods:**
  - `intercept(context: ExecutionContext, next: CallHandler)`: Intercepts and processes incoming requests with file uploads.
  - `validateFiles(files: any)`: Validates uploaded files.
  - `generateError(data: any): Error`: Generates an error if file validation fails.
  - `isValidVideoMimeType(filename: string): boolean`: Checks if the uploaded file has a valid video MIME type.

## Usage
To use the feedback system, send POST requests to the appropriate endpoints with the required video or audio files.

- For visual feedback, send a POST request to `/feedback/visual` or `/feedback/video` with the video file.
- For audio feedback, send a POST request to `/feedback/audio` with the video file.

The system will process the files, perform the necessary analysis, and return the feedback.

## Installation
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up the required environment variables, including `OPENAI_API_KEY`.
4. Run the application using `npm run start`.

## Dependencies
- NestJS
- OpenAI
- ffmpeg
- Jimp
- Axios
- fs-extra

## Environment Variables
Ensure you have the following environment variables set up:
- `OPENAI_API_KEY`: Your OpenAI API key.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any changes or additions.

## License
This project is licensed under the MIT License.

## Authors
- [Adwait Sharma](https://www.linkedin.com/in/adwait-sharma/)
- [Vivek Singh](https://www.linkedin.com/in/vivek-singh-ml-learner/)
