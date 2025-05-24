"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DualPaneLayout } from "@/components/ui/dual-pane-layout";
import { distillSourceText, type DistillSourceTextInput } from "@/ai/flows/source-text-distiller";
import { useToast } from "@/hooks/use-toast";
import { Loader2, WandSparkles } from "lucide-react";

export default function SourceTextDistillerClient() {
  const [sourceText, setSourceText] = useState("");
  const [distilledText, setDistilledText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDistill = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some source text to distill.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDistilledText(""); 
    try {
      const input: DistillSourceTextInput = { sourceText };
      const result = await distillSourceText(input);
      setDistilledText(result.summary);
      toast({
        title: "Success!",
        description: "Source text distilled successfully.",
      });
    } catch (error) {
      console.error("Error distilling source text:", error);
      toast({
        title: "Error",
        description: "Failed to distill source text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const leftPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>Source Text</CardTitle>
        <CardDescription>Paste the text you want to distill into key information.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Textarea
          placeholder="Enter your source text here..."
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="flex-1 resize-none text-sm"
          rows={15}
        />
        <Button onClick={handleDistill} disabled={isLoading} className="mt-4 w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : <WandSparkles />}
          <span>{isLoading ? "Distilling..." : "Distill Key Information"}</span>
        </Button>
      </CardContent>
    </Card>
  );

  const rightPane = (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>Distilled Information</CardTitle>
        <CardDescription>Key insights extracted from your source text.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Textarea
          placeholder="Distilled information will appear here..."
          value={distilledText}
          readOnly
          className="flex-1 resize-none bg-muted/50 text-sm"
          rows={15}
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="h-[calc(100vh-10rem)]"> {/* Adjust height as needed */}
      <DualPaneLayout leftPane={leftPane} rightPane={rightPane} />
    </div>
  );
}
