"use client";

import { useState } from "react";
import { ContentPolicy } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Plus } from "lucide-react";

interface ContentPolicyFormProps {
  initialPolicy?: Partial<ContentPolicy>;
  onSave: (policy: Partial<ContentPolicy>) => void;
  onCancel: () => void;
}

const contentCategories = [
  { id: "educational", label: "Educational", description: "Learning & skill development" },
  { id: "entertainment", label: "Entertainment", description: "Age-appropriate shows & games" },
  { id: "creative", label: "Creative", description: "Art, music, crafting" },
  { id: "social", label: "Social", description: "Family & friend interactions" },
  { id: "news", label: "News", description: "Current events for kids" },
  { id: "sports", label: "Sports", description: "Physical activities & sports" },
];

export function ContentPolicyForm({
  initialPolicy,
  onSave,
  onCancel,
}: ContentPolicyFormProps) {
  const [ageRating, setAgeRating] = useState<string>(
    initialPolicy?.ageRating || "kid"
  );
  const [allowedCategories, setAllowedCategories] = useState<string[]>(
    initialPolicy?.allowedCategories || ["educational", "creative"]
  );
  const [blockedKeywords, setBlockedKeywords] = useState<string[]>(
    initialPolicy?.blockedKeywords || []
  );
  const [newKeyword, setNewKeyword] = useState("");
  const [requireApproval, setRequireApproval] = useState(
    initialPolicy?.requireApproval ?? true
  );
  const [educationalPriority, setEducationalPriority] = useState(
    initialPolicy?.educationalPriority ?? true
  );

  const toggleCategory = (categoryId: string) => {
    setAllowedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !blockedKeywords.includes(newKeyword.trim())) {
      setBlockedKeywords([...blockedKeywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setBlockedKeywords(blockedKeywords.filter((k) => k !== keyword));
  };

  const handleSave = () => {
    onSave({
      ageRating: ageRating as ContentPolicy["ageRating"],
      allowedCategories,
      blockedKeywords,
      requireApproval,
      educationalPriority,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-2 hover:border-sky-200 transition-all duration-300 bg-gradient-to-br from-white to-sky-50/20">
        <CardHeader>
          <CardTitle>Age Rating</CardTitle>
          <CardDescription>
            Set the appropriate content age rating for your child
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={ageRating} onValueChange={setAgeRating}>
            <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gradient-to-r hover:from-sky-50 hover:to-purple-50 transition-all duration-200 group">
              <RadioGroupItem value="all" id="all" className="border-sky-400" />
              <Label htmlFor="all" className="cursor-pointer group-hover:text-sky-700 transition-colors">
                All Ages (0-5) - Very simple, educational content only
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gradient-to-r hover:from-sky-50 hover:to-purple-50 transition-all duration-200 group">
              <RadioGroupItem value="kid" id="kid" className="border-sky-400" />
              <Label htmlFor="kid" className="cursor-pointer group-hover:text-sky-700 transition-colors">
                Kids (6-12) - Age-appropriate shows, games, and activities
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gradient-to-r hover:from-sky-50 hover:to-purple-50 transition-all duration-200 group">
              <RadioGroupItem value="teen" id="teen" className="border-sky-400" />
              <Label htmlFor="teen" className="cursor-pointer group-hover:text-sky-700 transition-colors">
                Teen (13-17) - Teen content with moderate restrictions
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gradient-to-r hover:from-sky-50 hover:to-purple-50 transition-all duration-200 group">
              <RadioGroupItem value="mature" id="mature" className="border-sky-400" />
              <Label htmlFor="mature" className="cursor-pointer group-hover:text-sky-700 transition-colors">
                Mature (18+) - No restrictions
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-purple-200 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/20">
        <CardHeader>
          <CardTitle>Allowed Content Categories</CardTitle>
          <CardDescription>
            Select which types of content your child can access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {contentCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 border border-transparent hover:border-purple-200 group"
              >
                <div>
                  <Label className="text-base">{category.label}</Label>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                <Switch
                  checked={allowedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-red-200 transition-all duration-300 bg-gradient-to-br from-white to-red-50/20">
        <CardHeader>
          <CardTitle>Blocked Keywords</CardTitle>
          <CardDescription>
            Add keywords to automatically filter inappropriate content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter keyword to block..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addKeyword()}
            />
            <Button onClick={addKeyword} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {blockedKeywords.map((keyword) => (
              <Badge key={keyword} variant="destructive" className="gap-1 animate-in fade-in zoom-in-50 duration-300 hover:scale-110 transition-transform">
                {keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="ml-1 hover:bg-red-700 rounded-full p-0.5 transition-all duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-green-200 transition-all duration-300 bg-gradient-to-br from-white to-green-50/20">
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Require Parent Approval</Label>
              <p className="text-sm text-muted-foreground">
                New apps and websites need your approval before access
              </p>
            </div>
            <Switch
              checked={requireApproval}
              onCheckedChange={setRequireApproval}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Educational Priority</Label>
              <p className="text-sm text-muted-foreground">
                Promote and recommend educational content first
              </p>
            </div>
            <Switch
              checked={educationalPriority}
              onCheckedChange={setEducationalPriority}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200">
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          Save Content Policy
        </Button>
      </div>
    </div>
  );
}
