"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { aiAssistedRefinement, type AiAssistedRefinementInput } from "@/ai/flows/ai-assisted-refinement";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkle } from "lucide-react";

export default function RefinementClient() {
  const [draftText, setDraftText] = useState("");
  const [styleTraits, setStyleTraits] = useState("");
  const [refinedText, setRefinedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRefine = async () => {
    if (!draftText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some draft text to refine.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRefinedText("");
    try {
      const input: AiAssistedRefinementInput = { draftText, styleTraits };
      const result = await aiAssistedRefinement(input);
      setRefinedText(result.refinedText);
      toast({
        title: "Success!",
        description: "Text refined successfully.",
      });
    } catch (error) {
      console.error("Error refining text:", error);
      toast({
        title: "Error",
        description: "Failed to refine text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const leftPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>Refinement Inputs</CardTitle>
        <CardDescription>Provide your draft and optional style traits for AI-assisted refinement.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="grid gap-2 flex-1">
          <Label htmlFor="draftText">Draft Text</Label>
          <Textarea
            id="draftText"
            placeholder="Enter the draft text you want to refine..."
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            className="flex-1 resize-none text-sm"
            rows={10}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="styleTraits">Style Traits (Optional)</Label>
          <Textarea
            id="styleTraits"
            placeholder="Describe desired style traits (e.g., 'formal, concise', 'witty, engaging')..."
            value={styleTraits}
            onChange={(e) => setStyleTraits(e.target.value)}
            className="min-h-[80px] resize-none text-sm"
          />
        </div>
        <Button onClick={handleRefine} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : <Sparkle />}
          <span>{isLoading ? "Refining..." : "Refine Text"}</span>
        </Button>
      </CardContent>
    </Card>
  );

  const rightPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>Refined Text</CardTitle>
        <CardDescription>Your improved text with enhanced style and reduced AI signature.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Textarea
          placeholder="Refined text will appear here..."
          value={refinedText}
          readOnly
          className="flex-1 resize-none bg-muted/50 text-sm"
          rows={15}
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="h-[calc(100vh-10rem)]">
      <DualPaneLayout leftPane={leftPane} rightPane={rightPane} />
    </div>
  );
}
