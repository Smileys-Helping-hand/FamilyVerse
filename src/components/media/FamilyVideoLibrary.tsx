"use client";

import { useState } from "react";
import { familyVideos, type VideoContent, getVideosByCategory } from "@/lib/data/videos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Video,
  Clock, 
  Star,
  Play,
  BookOpen,
  Music,
  Palette,
  Dumbbell,
  BookText,
  PartyPopper,
  Heart
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const categoryIcons = {
  "family-fun": PartyPopper,
  "educational": BookOpen,
  "storytelling": BookText,
  "music": Music,
  "exercise": Dumbbell,
  "crafts": Palette,
};

const categoryColors = {
  "family-fun": "from-pink-500 to-rose-500",
  "educational": "from-blue-500 to-cyan-500",
  "storytelling": "from-purple-500 to-indigo-500",
  "music": "from-green-500 to-emerald-500",
  "exercise": "from-orange-500 to-red-500",
  "crafts": "from-yellow-500 to-amber-500",
};

export function FamilyVideoLibrary() {
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Videos", icon: Video },
    { id: "family-fun", label: "Family Fun", icon: PartyPopper },
    { id: "educational", label: "Educational", icon: BookOpen },
    { id: "storytelling", label: "Stories", icon: BookText },
    { id: "music", label: "Music & Dance", icon: Music },
    { id: "exercise", label: "Exercise", icon: Dumbbell },
    { id: "crafts", label: "Arts & Crafts", icon: Palette },
  ];

  const filteredVideos = selectedCategory === "all" 
    ? familyVideos 
    : getVideosByCategory(selectedCategory as VideoContent['category']);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Video className="h-12 w-12 animate-pulse" />
              <h1 className="text-4xl font-bold">Family Video Library</h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl">
              Premium family-friendly content - educational videos, fun activities, 
              and quality time ideas for the whole family!
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-base px-4 py-1">
                <Video className="h-4 w-4 mr-2" />
                {familyVideos.length} Videos
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-base px-4 py-1">
                <Heart className="h-4 w-4 mr-2" />
                Safe & Curated
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <Button
              key={cat.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "transition-all duration-200",
                isSelected && "shadow-lg scale-105"
              )}
            >
              <Icon className="h-4 w-4 mr-2" />
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* Videos Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video, index) => {
          const Icon = categoryIcons[video.category];
          const gradient = categoryColors[video.category];
          
          return (
            <Card
              key={video.id}
              className={cn(
                "group cursor-pointer transition-all duration-300 overflow-hidden",
                "hover:shadow-2xl hover:-translate-y-2",
                "border-2 hover:border-primary/50",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedVideo(video)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-primary fill-primary" />
                  </div>
                </div>
                <Badge className="absolute top-3 right-3 bg-black/70 text-white border-none">
                  <Clock className="h-3 w-3 mr-1" />
                  {video.duration}
                </Badge>
              </div>

              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className={cn(
                    "p-2 rounded-lg bg-gradient-to-br shadow-sm",
                    gradient
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{video.rating}</span>
                  </div>
                </div>
                
                <div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">
                    {video.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {video.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  {video.educational && (
                    <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 text-xs">
                      Educational
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {video.ageRange}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Video Details Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedVideo && (
            <div className="space-y-6">
              {/* Video Player Placeholder */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
                <img
                  src={selectedVideo.thumbnailUrl}
                  alt={selectedVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Button
                    size="lg"
                    className="bg-white hover:bg-white/90 text-primary rounded-full p-8 shadow-2xl hover:scale-110 transition-transform"
                  >
                    <Play className="h-12 w-12 fill-primary" />
                  </Button>
                </div>
                <Badge className="absolute top-4 right-4 bg-black/80 text-white border-none text-base px-4 py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  {selectedVideo.duration}
                </Badge>
              </div>

              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-4 rounded-2xl bg-gradient-to-br shadow-lg",
                    categoryColors[selectedVideo.category]
                  )}>
                    {(() => {
                      const Icon = categoryIcons[selectedVideo.category];
                      return <Icon className="h-8 w-8 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-3xl">{selectedVideo.title}</DialogTitle>
                    <DialogDescription className="text-base mt-2">
                      {selectedVideo.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                  <Star className="h-5 w-5 text-blue-600 mb-2 fill-blue-600" />
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-bold text-blue-700">{selectedVideo.rating}/5</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                  <Clock className="h-5 w-5 text-purple-600 mb-2" />
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-bold text-purple-700">{selectedVideo.duration}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                  <Heart className="h-5 w-5 text-green-600 mb-2" />
                  <p className="text-sm text-muted-foreground">Age Range</p>
                  <p className="font-bold text-green-700">{selectedVideo.ageRange}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
                  <BookOpen className="h-5 w-5 text-yellow-600 mb-2" />
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-bold text-yellow-700">
                    {selectedVideo.educational ? "Educational" : "Entertainment"}
                  </p>
                </div>
              </div>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg">Tags & Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedVideo.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-primary via-secondary to-accent hover:scale-105 transition-transform text-lg py-6"
                  size="lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8"
                  onClick={() => setSelectedVideo(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
