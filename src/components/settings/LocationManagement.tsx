import { useState } from "react";
import { useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from "@/hooks/useLocations";
import { LocationInsert, LocationUpdate } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MapPin, Search } from "lucide-react";

interface LocationFormData {
  name: string;
  address: string;
  capacity: number | null;
  description: string;
  is_active: boolean;
}

const emptyLocationForm: LocationFormData = {
  name: "",
  address: "",
  capacity: null,
  description: "",
  is_active: true,
};

export function LocationManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locationForm, setLocationForm] = useState<LocationFormData>(emptyLocationForm);

  // Queries and mutations
  const { data: locations, isLoading, error } = useLocations({ 
    search: searchQuery.length >= 2 ? searchQuery : undefined 
  });
  const createLocationMutation = useCreateLocation();
  const updateLocationMutation = useUpdateLocation();
  const deleteLocationMutation = useDeleteLocation();

  const handleInputChange = (field: keyof LocationFormData, value: string | number | boolean) => {
    setLocationForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddLocation = async () => {
    if (!locationForm.name.trim()) {
      return;
    }

    const newLocation: LocationInsert = {
      name: locationForm.name.trim(),
      address: locationForm.address.trim() || null,
      capacity: locationForm.capacity || null,
      description: locationForm.description.trim() || null,
      is_active: locationForm.is_active,
    };

    try {
      await createLocationMutation.mutateAsync(newLocation);
      setLocationForm(emptyLocationForm);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to create location:", error);
    }
  };

  const handleEditLocation = (location: any) => {
    setSelectedLocation(location.id);
    setLocationForm({
      name: location.name,
      address: location.address || "",
      capacity: location.capacity,
      description: location.description || "",
      is_active: location.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateLocation = async () => {
    if (!selectedLocation || !locationForm.name.trim()) {
      return;
    }

    const updates: LocationUpdate = {
      name: locationForm.name.trim(),
      address: locationForm.address.trim() || null,
      capacity: locationForm.capacity || null,
      description: locationForm.description.trim() || null,
      is_active: locationForm.is_active,
    };

    try {
      await updateLocationMutation.mutateAsync({ id: selectedLocation, updates });
      setLocationForm(emptyLocationForm);
      setSelectedLocation(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await deleteLocationMutation.mutateAsync(locationId);
    } catch (error) {
      console.error("Failed to delete location:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Management
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage physical locations for attendance tracking
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-name">Location Name *</Label>
                    <Input
                      id="add-name"
                      value={locationForm.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter location name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-address">Address</Label>
                    <Input
                      id="add-address"
                      value={locationForm.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter address (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-capacity">Capacity</Label>
                    <Input
                      id="add-capacity"
                      type="number"
                      min="1"
                      value={locationForm.capacity || ""}
                      onChange={(e) => handleInputChange("capacity", e.target.value ? parseInt(e.target.value) : 0)}
                      placeholder="Enter capacity (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-description">Description</Label>
                    <Textarea
                      id="add-description"
                      value={locationForm.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter description (optional)"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="add-active"
                      checked={locationForm.is_active}
                      onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                    />
                    <Label htmlFor="add-active">Active</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLocationForm(emptyLocationForm);
                      setIsAddDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddLocation}
                    disabled={createLocationMutation.isPending || !locationForm.name.trim()}
                  >
                    {createLocationMutation.isPending ? "Adding..." : "Add Location"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Error State */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">Error loading locations: {error.message}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Loading locations...</span>
              </div>
            ) : (
              /* Locations Table */
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-center">Capacity</TableHead>
                      <TableHead className="text-center">Usage</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations && locations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          {searchQuery ? "No locations found matching your search." : "No locations found. Add your first location to get started!"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      locations?.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium">{location.name}</TableCell>
                          <TableCell className="text-gray-600">{location.address || "—"}</TableCell>
                          <TableCell className="text-center">{location.capacity || "—"}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">
                              {location.usage_count || 0} reports
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={location.is_active ? "default" : "secondary"}>
                              {location.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditLocation(location)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Location</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{location.name}"?
                                      {location.usage_count && location.usage_count > 0 ? (
                                        <span className="block mt-2 text-red-600 font-medium">
                                          Warning: This location has {location.usage_count} attendance reports. 
                                          These reports will be unlinked from this location. This action cannot be undone.
                                        </span>
                                      ) : (
                                        <span className="block mt-2 text-red-600 font-medium">
                                          This action cannot be undone.
                                        </span>
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteLocation(location.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Location Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Location Name *</Label>
              <Input
                id="edit-name"
                value={locationForm.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter location name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={locationForm.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter address (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                min="1"
                value={locationForm.capacity || ""}
                onChange={(e) => handleInputChange("capacity", e.target.value ? parseInt(e.target.value) : 0)}
                placeholder="Enter capacity (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={locationForm.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={locationForm.is_active}
                onCheckedChange={(checked) => handleInputChange("is_active", checked)}
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setLocationForm(emptyLocationForm);
                setSelectedLocation(null);
                setIsEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateLocation}
              disabled={updateLocationMutation.isPending || !locationForm.name.trim()}
            >
              {updateLocationMutation.isPending ? "Updating..." : "Update Location"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}