#!/bin/bash
echo "Creating directories for Portuguese TTS models..."
mkdir -p ../resources/pt/tts
echo "Creating directories for English TTS models..."
mkdir -p ../resources/en/tts

echo "Downloading Portuguese TTS models..."
wget -P ../resources/pt/tts https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx?download=true
wget -P ../resources/pt/tts https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx.json?download=true

echo "Downloading English TTS models..."
wget -P ../resources/en/tts https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/ryan/high/en_US-ryan-high.onnx?download=true
wget -P ../resources/en/tts https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/ryan/high/en_US-ryan-high.onnx.json?download=true
