
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from "lucide-react";

interface VoiceTriggerProps {
  onTrigger: () => void;
  isActive: boolean;
}

const VoiceTrigger: React.FC<VoiceTriggerProps> = ({ onTrigger, isActive }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!isActive) {
      stopListening();
      return;
    }

    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Voice recognition started');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = (finalTranscript + interimTranscript).toLowerCase();
      setTranscript(fullTranscript);

      // Check for trigger phrases
      const triggerPhrases = ['help me', 'emergency', 'call help', 'i need help'];
      const triggered = triggerPhrases.some(phrase => fullTranscript.includes(phrase));

      if (triggered) {
        console.log('Voice trigger detected:', fullTranscript);
        onTrigger();
        recognition.stop();
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Voice recognition ended');
      
      // Restart recognition if still active
      if (isActive) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
          }
        }, 1000);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
    }

    return () => {
      recognition.stop();
    };
  }, [isActive, onTrigger]);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border-2 border-green-500">
      <div className="flex items-center justify-center mb-3">
        {isListening ? (
          <div className="flex items-center gap-2 text-green-400">
            <Mic className="w-6 h-6 animate-pulse" />
            <span className="font-semibold">Listening for "Help me"...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <MicOff className="w-6 h-6" />
            <span>Voice detection starting...</span>
          </div>
        )}
      </div>
      
      {transcript && (
        <div className="text-sm text-gray-300 text-center">
          <span className="font-mono bg-gray-700 px-2 py-1 rounded">
            "{transcript}"
          </span>
        </div>
      )}
      
      <div className="text-xs text-gray-500 text-center mt-2">
        Trigger phrases: "Help me", "Emergency", "Call help", "I need help"
      </div>
    </div>
  );
};

export default VoiceTrigger;
