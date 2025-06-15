
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

interface EmergencySettingsProps {
  onSettingsChange?: (settings: any) => void;
}

interface Settings {
  responseTimeout: number;
  recordingDuration: number;
  cancelCountdown: number;
  triggerPhrases: string[];
}

const EmergencySettings: React.FC<EmergencySettingsProps> = ({ onSettingsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    responseTimeout: 15,
    recordingDuration: 30,
    cancelCountdown: 5,
    triggerPhrases: ['help me', 'emergency', 'call help', 'i need help']
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('emergencySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('emergencySettings', JSON.stringify(settings));
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-gray-800 border-gray-600 text-white">
          <HelpCircle className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle>Emergency Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Contact Response Timeout (seconds)
            </label>
            <Input
              type="number"
              value={settings.responseTimeout}
              onChange={(e) => updateSetting('responseTimeout', Number(e.target.value))}
              className="bg-gray-800 border-gray-600"
              min="5"
              max="60"
            />
            <p className="text-xs text-gray-400 mt-1">
              How long to wait for a contact to respond before trying the next one
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Recording Duration (seconds)
            </label>
            <Input
              type="number"
              value={settings.recordingDuration}
              onChange={(e) => updateSetting('recordingDuration', Number(e.target.value))}
              className="bg-gray-800 border-gray-600"
              min="10"
              max="120"
            />
            <p className="text-xs text-gray-400 mt-1">
              How long to record emergency audio
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Cancel Countdown (seconds)
            </label>
            <Input
              type="number"
              value={settings.cancelCountdown}
              onChange={(e) => updateSetting('cancelCountdown', Number(e.target.value))}
              className="bg-gray-800 border-gray-600"
              min="3"
              max="10"
            />
            <p className="text-xs text-gray-400 mt-1">
              Time to cancel before emergency protocol starts
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Voice Trigger Phrases
            </label>
            <div className="space-y-2">
              {settings.triggerPhrases.map((phrase, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={phrase}
                    onChange={(e) => {
                      const newPhrases = [...settings.triggerPhrases];
                      newPhrases[index] = e.target.value;
                      updateSetting('triggerPhrases', newPhrases);
                    }}
                    className="bg-gray-800 border-gray-600 flex-1"
                  />
                  <Button
                    onClick={() => {
                      const newPhrases = settings.triggerPhrases.filter((_, i) => i !== index);
                      updateSetting('triggerPhrases', newPhrases);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-400"
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => updateSetting('triggerPhrases', [...settings.triggerPhrases, ''])}
                variant="outline"
                size="sm"
                className="w-full border-gray-600"
              >
                Add Trigger Phrase
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Phrases that will trigger the emergency protocol
            </p>
          </div>

          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencySettings;
