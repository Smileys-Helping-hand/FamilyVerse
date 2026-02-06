"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Gamepad2, Music, Code, Globe, Star } from "lucide-react";

interface EducationalContent {
  id: string;
  title: string;
  description: string;
  category: string;
  ageRange: string;
  rating: number;
  educational: boolean;
  icon: "book" | "video" | "game" | "music" | "code" | "globe";
  benefits: string[];
}

const educationalRecommendations: EducationalContent[] = [
  {
    id: "1",
    title: "Khan Academy Kids",
    description: "Interactive learning games covering math, reading, and creativity with personalized learning paths.",
    category: "Educational",
    ageRange: "2-8 years",
    rating: 4.8,
    educational: true,
    icon: "book",
    benefits: ["Math skills", "Reading comprehension", "Critical thinking"],
  },
  {
    id: "2",
    title: "Scratch Jr",
    description: "Introduction to coding through creative storytelling and game creation.",
    category: "Creative Tech",
    ageRange: "5-12 years",
    rating: 4.7,
    educational: true,
    icon: "code",
    benefits: ["Coding basics", "Problem solving", "Creative expression"],
  },
  {
    id: "3",
    title: "National Geographic Kids",
    description: "Explore the world through videos, games, and articles about animals, science, and geography.",
    category: "Science & Nature",
    ageRange: "6-14 years",
    rating: 4.9,
    educational: true,
    icon: "globe",
    benefits: ["Science knowledge", "Environmental awareness", "Cultural understanding"],
  },
  {
    id: "4",
    title: "Duolingo Kids",
    description: "Fun language learning with games and stories to build vocabulary and pronunciation.",
    category: "Language",
    ageRange: "4-10 years",
    rating: 4.6,
    educational: true,
    icon: "book",
    benefits: ["Language skills", "Memory", "Cultural awareness"],
  },
  {
    id: "5",
    title: "Toca Boca World",
    description: "Creative play environment for building stories, characters, and worlds with educational elements.",
    category: "Creative Play",
    ageRange: "6-12 years",
    rating: 4.5,
    educational: true,
    icon: "game",
    benefits: ["Creativity", "Storytelling", "Social skills"],
  },
  {
    id: "6",
    title: "PBS Kids Video",
    description: "Educational shows featuring beloved characters teaching science, math, and social-emotional learning.",
    category: "Educational TV",
    ageRange: "2-10 years",
    rating: 4.8,
    educational: true,
    icon: "video",
    benefits: ["Academic skills", "Empathy", "Problem solving"],
  },
  {
    id: "7",
    title: "Cosmic Kids Yoga",
    description: "Interactive yoga adventures that build strength, balance, and mindfulness through storytelling.",
    category: "Physical & Wellness",
    ageRange: "3-10 years",
    rating: 4.9,
    educational: true,
    icon: "video",
    benefits: ["Physical fitness", "Mindfulness", "Self-regulation"],
  },
  {
    id: "8",
    title: "Art for Kids Hub",
    description: "Step-by-step drawing tutorials that boost creativity and fine motor skills.",
    category: "Creative Arts",
    ageRange: "4-12 years",
    rating: 4.7,
    educational: true,
    icon: "video",
    benefits: ["Creativity", "Drawing skills", "Following directions"],
  },
];

const iconMap = {
  book: BookOpen,
  video: Video,
  game: Gamepad2,
  music: Music,
  code: Code,
  globe: Globe,
};

export function EducationalRecommendations() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-pink-500/10 border-2 border-sky-200">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Educational Content Recommendations</h2>
        <p className="text-muted-foreground">
          Curated safe, age-appropriate content that makes learning fun
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {educationalRecommendations.map((content, index) => {
          const Icon = iconMap[content.icon];
          return (
            <Card key={content.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-sky-300 bg-gradient-to-br from-white to-sky-50/20 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-sky-400 to-purple-500 rounded-lg shadow-md">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{content.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {content.category} • {content.ageRange}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 animate-pulse">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{content.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{content.description}</p>
                
                <div>
                  <p className="text-sm font-medium mb-2">Learning Benefits:</p>
                  <div className="flex flex-wrap gap-2">
                    {content.benefits.map((benefit, idx) => (
                      <Badge key={benefit} variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 animate-in fade-in zoom-in-50" style={{ animationDelay: `${idx * 50}ms` }}>
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                    Educational
                  </Badge>
                  <Button size="sm" variant="default" className="bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 transition-all duration-200 hover:scale-105">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-br from-sky-50 to-blue-100 border-2 border-sky-300 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sky-600" />
            <span className="bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">Tips for Choosing Educational Content</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-gradient-to-br from-white to-green-50 border-2 border-green-200 hover:shadow-md transition-all duration-200">
              <h4 className="font-semibold text-sm mb-1 text-green-700">Age-Appropriate</h4>
              <p className="text-sm text-muted-foreground">
                Select content designed for your child's age group and developmental stage
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 hover:shadow-md transition-all duration-200">
              <h4 className="font-semibold text-sm mb-1 text-purple-700">Interactive Learning</h4>
              <p className="text-sm text-muted-foreground">
                Choose apps and games that require active participation, not passive watching
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 hover:shadow-md transition-all duration-200">
              <h4 className="font-semibold text-sm mb-1 text-blue-700">Balance is Key</h4>
              <p className="text-sm text-muted-foreground">
                Mix educational content with creative play and physical activities
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-white to-orange-50 border-2 border-orange-200 hover:shadow-md transition-all duration-200">
              <h4 className="font-semibold text-sm mb-1 text-orange-700">Co-viewing</h4>
              <p className="text-sm text-muted-foreground">
                Watch and play together to enhance learning and strengthen bonds
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
