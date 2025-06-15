
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Phone, Mic, MicOff, MapPin } from "lucide-react";
import EmergencyContacts from "@/components/EmergencyContacts";
import VoiceTrigger from "@/components/VoiceTrigger";
import EmergencyProtocol from "@/components/EmergencyProtocol";
import EmergencySettings from "@/components/EmergencySettings";
import { useToast } from "@/hooks/use-toast";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  priority: number;
}

const Index = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  // Load contacts from localStorage on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
    
    // Get location on app start
    getCurrentLocation();
  }, []);

  // Save contacts to localStorage when updated
  useEffect(() => {
    localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
  }, [contacts]);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleEmergencyTrigger = () => {
    console.log('Emergency triggered!');
    getCurrentLocation();
    setIsEmergencyActive(true);
    
    toast({
      title: "🚨 EMERGENCY ACTIVATED",
      description: "Starting emergency protocol...",
      variant: "destructive"
    });
  };

  const handleEmergencyCancel = () => {
    setIsEmergencyActive(false);
    toast({
      title: "Emergency Cancelled",
      description: "Emergency protocol stopped."
    });
  };

  const addContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact = {
      ...contact,
      id: Date.now().toString()
    };
    setContacts(prev => [...prev, newContact]);
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const updateContact = (id: string, updatedContact: Partial<EmergencyContact>) => {
    setContacts(prev => prev.map(contact => 
      contact.id === id ? { ...contact, ...updatedContact } : contact
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-800 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-4xl font-bold text-red-400 mb-2">
            🚨 Emergency Buddy
          </h1>
          <p className="text-lg text-gray-300">
            Your safety companion
          </p>
          <div className="mt-4">
            <EmergencySettings />
          </div>
        </div>

        {/* Emergency Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleEmergencyTrigger}
            disabled={isEmergencyActive}
            className="w-48 h-48 rounded-full bg-red-600 hover:bg-red-700 text-white text-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200 border-4 border-red-400"
          >
            {isEmergencyActive ? (
              <div className="text-center">
                <div className="animate-pulse text-4xl">🚨</div>
                <div>ACTIVE</div>
              </div>
            ) : (
              <div className="text-center">
                <Phone className="w-12 h-12 mx-auto mb-2" />
                <div>EMERGENCY</div>
              </div>
            )}
          </Button>
        </div>

        {/* Voice Trigger Toggle */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Voice Trigger</span>
            <Button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              variant={isVoiceEnabled ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              {isVoiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              {isVoiceEnabled ? "ON" : "OFF"}
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Say "Help me" to trigger emergency
          </p>
        </div>

        {/* Location Status */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-400" />
            <span className="font-semibold">Location</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {location ? (
              <>
                Ready ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                <br />
                <a 
                  href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-xs"
                >
                  View on Google Maps
                </a>
              </>
            ) : (
              "Getting location..."
            )}
          </p>
        </div>

        {/* Emergency Contacts */}
        <EmergencyContacts 
          contacts={contacts}
          onAdd={addContact}
          onRemove={removeContact}
          onUpdate={updateContact}
        />

        {/* Voice Trigger Component */}
        {isVoiceEnabled && (
          <VoiceTrigger
            onTrigger={handleEmergencyTrigger}
            isActive={isVoiceEnabled}
          />
        )}

        {/* Emergency Protocol */}
        {isEmergencyActive && (
          <EmergencyProtocol
            contacts={contacts}
            location={location}
            onCancel={handleEmergencyCancel}
          />
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs py-4">
          <p>Emergency Buddy v1.0</p>
          <p>Designed for accessibility and safety</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
