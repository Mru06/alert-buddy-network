
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Mic, Stop-Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  priority: number;
}

interface EmergencyProtocolProps {
  contacts: EmergencyContact[];
  location: { lat: number; lng: number } | null;
  onCancel: () => void;
}

const EmergencyProtocol: React.FC<EmergencyProtocolProps> = ({ 
  contacts, 
  location, 
  onCancel 
}) => {
  const [currentStep, setCurrentStep] = useState<'countdown' | 'recording' | 'alerting'>('countdown');
  const [countdown, setCountdown] = useState(5);
  const [currentContactIndex, setCurrentContactIndex] = useState(0);
  const [waitTime, setWaitTime] = useState(15);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const { toast } = useToast();

  // Countdown timer for cancellation
  useEffect(() => {
    if (currentStep === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === 'countdown' && countdown === 0) {
      setCurrentStep('recording');
      startRecording();
    }
  }, [currentStep, countdown]);

  // Wait time for contact response
  useEffect(() => {
    if (currentStep === 'alerting' && waitTime > 0) {
      const timer = setTimeout(() => {
        setWaitTime(waitTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === 'alerting' && waitTime === 0) {
      escalateToNextContact();
    }
  }, [currentStep, waitTime]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      const timer = setTimeout(() => {
        setRecordingTime(recordingTime + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isRecording, recordingTime]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      // Start MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        // Save recording to localStorage (as base64)
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          localStorage.setItem('emergencyRecording', base64);
          console.log('Recording saved locally');
        };
        reader.readAsDataURL(blob);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      
      // Stop recording after 30 seconds and move to alerting
      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false);
        setCurrentStep('alerting');
        alertCurrentContact();
      }, 30000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not start audio recording",
        variant: "destructive"
      });
      setCurrentStep('alerting');
      alertCurrentContact();
    }
  };

  const alertCurrentContact = () => {
    const sortedContacts = contacts.sort((a, b) => a.priority - b.priority);
    const currentContact = sortedContacts[currentContactIndex];
    
    if (!currentContact) {
      // No contacts available, call emergency services
      callEmergencyServices();
      return;
    }

    console.log(`Alerting ${currentContact.name} at ${currentContact.phone}`);
    
    // Create emergency message
    const locationText = location 
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : 'Location unavailable';
    
    const message = `EMERGENCY ALERT: This person needs immediate help! Location: ${locationText}`;
    
    toast({
      title: `Alerting ${currentContact.name}`,
      description: `Calling ${currentContact.phone}...`,
      variant: "destructive"
    });

    // In a real app, this would make an actual call/SMS
    // For demo purposes, we'll simulate the call
    simulateCall(currentContact.phone, message);
    
    setWaitTime(15); // Reset wait time
  };

  const simulateCall = (phoneNumber: string, message: string) => {
    // In a real implementation, this would use:
    // - Twilio API for calls/SMS
    // - Native phone call functionality
    // - Push notifications
    
    console.log(`Simulating call to ${phoneNumber}: ${message}`);
    
    // For web demo, open phone dialer (works on mobile)
    const telLink = `tel:${phoneNumber}`;
    window.open(telLink, '_self');
  };

  const escalateToNextContact = () => {
    const sortedContacts = contacts.sort((a, b) => a.priority - b.priority);
    
    if (currentContactIndex < sortedContacts.length - 1) {
      setCurrentContactIndex(currentContactIndex + 1);
      setWaitTime(15);
      alertCurrentContact();
    } else {
      // All contacts exhausted, call emergency services
      callEmergencyServices();
    }
  };

  const callEmergencyServices = () => {
    toast({
      title: "CALLING EMERGENCY SERVICES",
      description: "Dialing 112...",
      variant: "destructive"
    });
    
    // Call emergency services
    window.open('tel:112', '_self');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedContacts = contacts.sort((a, b) => a.priority - b.priority);
  const currentContact = sortedContacts[currentContactIndex];

  return (
    <div className="fixed inset-0 bg-red-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full text-center border-2 border-red-500">
        
        {currentStep === 'countdown' && (
          <div className="space-y-6">
            <div className="text-6xl font-bold text-red-400 animate-pulse">
              {countdown}
            </div>
            <h2 className="text-2xl font-bold text-white">
              Emergency Activating
            </h2>
            <p className="text-gray-300">
              Press CANCEL to stop the emergency alert
            </p>
            <Button 
              onClick={onCancel}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white text-xl py-4"
            >
              CANCEL
            </Button>
          </div>
        )}

        {currentStep === 'recording' && (
          <div className="space-y-6">
            <div className="text-red-400">
              <Mic className="w-16 h-16 mx-auto animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Recording Emergency Audio
            </h2>
            <div className="text-xl font-mono text-red-400">
              {formatTime(recordingTime)}
            </div>
            <p className="text-gray-300">
              Speak clearly about your emergency...
            </p>
            <div className="text-sm text-gray-400">
              Recording will stop automatically in {30 - recordingTime} seconds
            </div>
          </div>
        )}

        {currentStep === 'alerting' && (
          <div className="space-y-6">
            <div className="text-yellow-400">
              <Phone className="w-16 h-16 mx-auto animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Alerting Emergency Contact
            </h2>
            
            {currentContact ? (
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="font-bold text-lg text-yellow-400">
                    {currentContact.name}
                  </div>
                  <div className="text-gray-300">
                    {currentContact.phone}
                  </div>
                  <div className="text-sm text-gray-400">
                    Priority {currentContact.priority}
                  </div>
                </div>
                
                <div className="text-xl font-mono text-yellow-400">
                  Response timeout: {waitTime}s
                </div>
                
                {location && (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Location shared</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-gray-300">
                  Contact #{currentContactIndex + 1} of {sortedContacts.length}
                  {currentContactIndex < sortedContacts.length - 1 && 
                    ` • Next: ${sortedContacts[currentContactIndex + 1]?.name}`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-red-400 font-bold">
                  No emergency contacts available
                </p>
                <p className="text-gray-300">
                  Calling emergency services directly...
                </p>
              </div>
            )}
            
            <Button 
              onClick={onCancel}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Stop-Circle className="w-4 h-4 mr-2" />
              Stop Emergency Protocol
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyProtocol;
