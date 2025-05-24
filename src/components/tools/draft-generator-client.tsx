"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { generateDraft, type GenerateDraftInput } from "@/ai/flows/draft-generation";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit3 } from "lucide-react";

export default function DraftGeneratorClient() {
  const [outline, setOutline] = useState("");
  const [styleExamples, setStyleExamples] = useState("");
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateDraft = async () => {
    if (!outline.trim() || !styleExamples.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide both an outline and style examples.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedDraft("");
    try {
      const input: GenerateDraftInput = { outline, styleExamples };
      const result = await generateDraft(input);
      setGeneratedDraft(result.draft);
      toast({
        title: "Success!",
        description: "Draft generated successfully.",
      });
    } catch (error) {
      console.error("Error generating draft:", error);
      toast({
        title: "Error",
        description: "Failed to generate draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Draft Inputs</CardTitle>
          <CardDescription>Provide an outline and style examples to generate a draft.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="outline">Outline</Label>
            <Textarea
              id="outline"
              placeholder="Enter the outline for your draft..."
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              className="min-h-[150px] resize-none text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="styleExamples">Style Examples</Label>
            <Textarea
              id="styleExamples"
              placeholder="Provide examples of the desired writing style..."
              value={styleExamples}
              onChange={(e) => setStyleExamples(e.target.value)}
              className="min-h-[150px] resize-none text-sm"
            />
          </div>
          <Button onClick={handleGenerateDraft} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="animate-spin" /> : <Edit3 />}
            <span>{isLoading ? "Generating..." : "Generate Draft"}</span>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Draft</CardTitle>
          <CardDescription>The AI-powered generated draft will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Generated draft..."
            value={generatedDraft}
            readOnly
            className="min-h-[250px] resize-none bg-muted/50 text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}
