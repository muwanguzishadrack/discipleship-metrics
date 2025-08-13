import { useState } from "react";
import { useActiveLocations, useCreateLocation } from "@/hooks/useLocations";
import { LocationInsert } from "@/types/database";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface LocationSelectProps {
  value?: string;
  onValueChange: (locationId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function LocationSelect({
  value,
  onValueChange,
  placeholder = "Select a location...",
  disabled = false,
}: LocationSelectProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  
  const { data: locations, isLoading } = useActiveLocations();
  const createLocationMutation = useCreateLocation();

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) return;

    const newLocation: LocationInsert = {
      name: newLocationName.trim(),
      is_active: true,
    };

    try {
      const createdLocation = await createLocationMutation.mutateAsync(newLocation);
      onValueChange(createdLocation.id);
      setNewLocationName("");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to create location:", error);
    }
  };

  const selectedLocation = locations?.find(loc => loc.id === value);

  return (
    <>
      <Select 
        value={value} 
        onValueChange={(newValue) => {
          if (newValue === "add-new") {
            setIsAddDialogOpen(true);
          } else {
            onValueChange(newValue);
          }
        }}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Loading..." : placeholder}>
            {selectedLocation?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {locations?.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              <div className="flex flex-col">
                <span className="font-medium">{location.name}</span>
                {location.address && (
                  <span className="text-xs text-gray-500">{location.address}</span>
                )}
              </div>
            </SelectItem>
          ))}
          <SelectItem value="add-new" className="text-primary">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Location
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Quick Add Location Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-location-name">Location Name</Label>
              <Input
                id="new-location-name"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                placeholder="Enter location name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLocation();
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-600">
              You can add more details like address and capacity in Settings → Locations.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setNewLocationName("");
                setIsAddDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLocation}
              disabled={createLocationMutation.isPending || !newLocationName.trim()}
            >
              {createLocationMutation.isPending ? "Adding..." : "Add Location"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}