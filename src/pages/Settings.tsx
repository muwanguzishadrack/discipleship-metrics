import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Settings as SettingsIcon, Users, Database } from "lucide-react";
import { LocationManagement } from "@/components/settings/LocationManagement";

export function Settings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Manage your application settings and configuration.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-12 bg-transparent">
              <TabsTrigger 
                value="general" 
                className="flex items-center gap-2 data-[state=active]:bg-gray-100"
              >
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger 
                value="locations" 
                className="flex items-center gap-2 data-[state=active]:bg-gray-100"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Locations</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-2 data-[state=active]:bg-gray-100"
                disabled
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger 
                value="data" 
                className="flex items-center gap-2 data-[state=active]:bg-gray-100"
                disabled
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Data</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="general" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">General Settings</h2>
                </div>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Application Preferences</p>
                    <p>Configure general application settings and preferences.</p>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm text-gray-500">
                        More general settings will be added here in future updates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="locations" className="space-y-6 mt-0">
              <LocationManagement />
            </TabsContent>

            <TabsContent value="users" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">User Management</h2>
                </div>
                <div className="text-center py-8 bg-gray-50 rounded-lg border">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Coming Soon</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    User management features will be available in a future update.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Data Management</h2>
                </div>
                <div className="text-center py-8 bg-gray-50 rounded-lg border">
                  <Database className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Coming Soon</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Data import/export features will be available in a future update.
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}