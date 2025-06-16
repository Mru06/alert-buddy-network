
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Mic, StopCircle } from "lucide-react";
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
  const [currentStep, setCurrentStep] = useState<'countdown' | 'active'>('countdown');
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
      setCurrentStep('active');
      // Start both recording and calling simultaneously
      startRecording();
      alertCurrentContact();
    }
  }, [currentStep, countdown]);

  // Wait time for contact response
  useEffect(() => {
    if (currentStep === 'active' && waitTime > 0) {
      const timer = setTimeout(() => {
        setWaitTime(waitTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === 'active' && waitTime === 0) {
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
      
      // Stop recording after 30 seconds
      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false);
      }, 30000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not start audio recording",
        variant: "destructive"
      });
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

        {currentStep === 'active' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Recording Status */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-red-400">
                  <Mic className="w-8 h-8 mx-auto animate-pulse" />
                </div>
                <div className="text-sm font-bold text-white mt-2">
                  Recording
                </div>
                <div className="text-lg font-mono text-red-400">
                  {formatTime(recordingTime)}
                </div>
              </div>

              {/* Calling Status */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-yellow-400">
                  <Phone className="w-8 h-8 mx-auto animate-bounce" />
                </div>
                <div className="text-sm font-bold text-white mt-2">
                  Calling
                </div>
                <div className="text-lg font-mono text-yellow-400">
                  {waitTime}s
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white">
              Emergency Protocol Active
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
              <StopCircle className="w-4 h-4 mr-2" />
              Stop Emergency Protocol
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyProtocol;
