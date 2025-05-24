"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { aiSignatureAnalyzer, type AiSignatureAnalyzerInput } from "@/ai/flows/ai-signature-analyzer";
import { useToast } from "@/hooks/use-toast";
import { Loader2, SearchCode } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SignatureAnalyzerClient() {
  const [draftCopy, setDraftCopy] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!draftCopy.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some draft copy to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis("");
    setSuggestions([]);
    try {
      const input: AiSignatureAnalyzerInput = { draftCopy };
      const result = await aiSignatureAnalyzer(input);
      setAnalysis(result.analysis);
      setSuggestions(result.suggestions);
      toast({
        title: "Success!",
        description: "Draft analyzed successfully.",
      });
    } catch (error) {
      console.error("Error analyzing signature:", error);
      toast({
        title: "Error",
        description: "Failed to analyze draft. Please try again.",
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
          <CardTitle>Analyze Draft Copy</CardTitle>
          <CardDescription>Paste your draft to check for AI-like patterns and get suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your draft copy here..."
            value={draftCopy}
            onChange={(e) => setDraftCopy(e.target.value)}
            className="min-h-[200px] resize-none text-sm"
          />
          <Button onClick={handleAnalyze} disabled={isLoading} className="mt-4 w-full">
            {isLoading ? <Loader2 className="animate-spin" /> : <SearchCode />}
            <span>{isLoading ? "Analyzing..." : "Analyze Signature"}</span>
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Analysis</CardTitle>
            <CardDescription>AI-like patterns found in your draft.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] rounded-md border p-4 bg-muted/50 text-sm">
              {analysis || "Analysis will appear here..."}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suggestions</CardTitle>
            <CardDescription>Recommendations to improve authenticity.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] rounded-md border p-4 bg-muted/50 text-sm">
              {suggestions.length > 0 ? (
                <ul className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">{suggestion}</li>
                  ))}
                </ul>
              ) : (
                "Suggestions will appear here..."
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
