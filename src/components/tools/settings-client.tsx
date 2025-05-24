"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export default function SettingsClient() {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const handleSaveSettings = () => {
    // In a real application, you would securely save these settings.
    // For this example, we'll just show a toast.
    console.log("Attempting to save API Key:", apiKey ? "********" : "empty");
    toast({
      title: "Settings Action",
      description: "Saving API keys is a placeholder. Implement secure storage for production.",
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
        <CardDescription>Manage your AI model API keys and other related settings.
        <br />
        <strong className="text-destructive-foreground bg-destructive p-1 rounded-sm">Note: API key storage is not implemented securely in this demo. Do not use real keys.</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="apiKey">AI Provider API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Your API key is used to authenticate requests to the AI models.
          </p>
        </div>
        {/* Add more settings fields as needed */}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings} className="ml-auto">
          <Save className="mr-2 h-4 w-4" /> Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
