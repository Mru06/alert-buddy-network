
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Phone, User, Circle-X } from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  priority: number;
}

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
  onAdd: (contact: Omit<EmergencyContact, 'id'>) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, contact: Partial<EmergencyContact>) => void;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({
  contacts,
  onAdd,
  onRemove,
  onUpdate
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', priority: 1 });

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      onAdd(newContact);
      setNewContact({ name: '', phone: '', priority: 1 });
      setIsAddDialogOpen(false);
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return "Primary";
      case 2: return "Secondary";
      case 3: return "Tertiary";
      default: return `Priority ${priority}`;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "text-red-400";
      case 2: return "text-yellow-400";
      case 3: return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  const sortedContacts = contacts.sort((a, b) => a.priority - b.priority);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Emergency Contacts</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-5 h-5 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle>Add Emergency Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contact name"
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1234567890"
                  type="tel"
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={newContact.priority}
                  onChange={(e) => setNewContact(prev => ({ ...prev, priority: Number(e.target.value) }))}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>
                      {getPriorityLabel(num)}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={handleAddContact} className="w-full bg-red-600 hover:bg-red-700">
                Add Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No emergency contacts added yet.</p>
          <p className="text-sm">Add contacts to enable emergency alerts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedContacts.map((contact) => (
            <div key={contact.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" />
                  <span className="font-semibold">{contact.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(contact.priority)}`}>
                    {getPriorityLabel(contact.priority)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Phone className="w-3 h-3" />
                  <span>{contact.phone}</span>
                </div>
              </div>
              <Button
                onClick={() => onRemove(contact.id)}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <Circle-X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;
