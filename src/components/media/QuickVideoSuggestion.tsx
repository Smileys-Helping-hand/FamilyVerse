"use client";

import { useState, useEffect } from "react";
import { familyVideos, type VideoContent } from "@/lib/data/videos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Clock, Star, RefreshCw, Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickVideoSuggestionProps {
  className?: string;
  filterEducational?: boolean;
}

export function QuickVideoSuggestion({ className, filterEducational }: QuickVideoSuggestionProps) {
  const [randomVideo, setRandomVideo] = useState<VideoContent | null>(null);

  const getRandomVideo = () => {
    const videos = filterEducational 
      ? familyVideos.filter(v => v.educational)
      : familyVideos;
    const randomIndex = Math.floor(Math.random() * videos.length);
    setRandomVideo(videos[randomIndex]);
  };

  useEffect(() => {
    getRandomVideo();
  }, []);

  if (!randomVideo) return null;

  return (
    <Card className={cn(
      "bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50",
      "border-2 border-blue-200 hover:shadow-xl transition-all duration-300",
      className
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Video className="h-5 w-5 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Video Pick
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={getRandomVideo}
            className="hover:bg-blue-100"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {filterEducational ? "Educational video recommendation" : "Recommended for your family"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer">
          <img
            src={randomVideo.thumbnailUrl}
            alt={randomVideo.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white rounded-full p-3">
              <Play className="h-6 w-6 text-blue-600 fill-blue-600" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg text-blue-900 mb-1">
            {randomVideo.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {randomVideo.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{randomVideo.rating}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {randomVideo.duration}
          </Badge>
          {randomVideo.educational && (
            <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 text-xs">
              Educational
            </Badge>
          )}
        </div>

        <Link href="/dashboard/videos" className="block">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Play className="mr-2 h-4 w-4" />
            Watch Now
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
