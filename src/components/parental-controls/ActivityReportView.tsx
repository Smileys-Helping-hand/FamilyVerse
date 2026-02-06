"use client";

import { ActivityReport } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Eye,
  MessageSquare,
  Trophy,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Gamepad2,
} from "lucide-react";

interface ActivityReportViewProps {
  report: ActivityReport;
  childName: string;
}

export function ActivityReportView({ report, childName }: ActivityReportViewProps) {
  const educationalContent = report.contentViewed.filter((c) => c.educational);
  const educationalPercentage =
    report.contentViewed.length > 0
      ? (educationalContent.length / report.contentViewed.length) * 100
      : 0;

  const highAlerts = report.alerts.filter((a) => a.severity === "high");
  const mediumAlerts = report.alerts.filter((a) => a.severity === "medium");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-sky-50 to-blue-100 border-sky-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screen Time</CardTitle>
            <Clock className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
              {Math.floor(report.screenTimeMinutes / 60)}h {report.screenTimeMinutes % 60}m
            </div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Educational</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">{educationalPercentage.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {educationalContent.length} of {report.contentViewed.length} items
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-700 bg-clip-text text-transparent">{report.achievements.length}</div>
            <p className="text-xs text-muted-foreground">Earned today</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-50 to-orange-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-red-600 to-orange-700 bg-clip-text text-transparent">{report.alerts.length}</span>
              {highAlerts.length > 0 && (
                <span className="text-red-600 text-base ml-2 animate-pulse">({highAlerts.length} high)</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {report.alerts.length > 0 && (
        <Card className="border-2 border-red-200 bg-gradient-to-br from-white to-red-50/30 animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
              Alerts & Notifications
            </CardTitle>
            <CardDescription>Important items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md animate-in fade-in slide-in-from-right-4 ${
                  alert.severity === "high"
                    ? "border-red-300 bg-gradient-to-r from-red-50 to-red-100/50 hover:border-red-400"
                    : alert.severity === "medium"
                    ? "border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100/50 hover:border-yellow-400"
                    : "border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100/50 hover:border-blue-400"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          alert.severity === "high"
                            ? "destructive"
                            : alert.severity === "medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {alert.severity}
                      </Badge>
                      <span className="text-sm font-medium capitalize">
                        {alert.type.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp.seconds * 1000).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content Viewed</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card className="border-2 hover:border-sky-200 transition-all duration-300 bg-gradient-to-br from-white to-sky-50/20">
            <CardHeader>
              <CardTitle>Content Breakdown</CardTitle>
              <CardDescription>What {childName} watched and interacted with</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.contentViewed.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No content viewed today
                </p>
              ) : (
                report.contentViewed.map((content, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 border-2 rounded-lg hover:border-sky-300 transition-all duration-200 hover:shadow-md bg-gradient-to-r from-white to-sky-50/20 animate-in fade-in slide-in-from-left-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {content.educational ? (
                        <BookOpen className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <Gamepad2 className="h-5 w-5 text-purple-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{content.title}</p>
                          {content.educational && (
                            <Badge variant="outline" className="text-green-600">
                              Educational
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="capitalize">{content.category}</span>
                          <span>•</span>
                          <span>{content.duration} min</span>
                          <span>•</span>
                          <span>
                            {new Date(content.timestamp.seconds * 1000).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card className="border-2 hover:border-purple-200 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/20">
            <CardHeader>
              <CardTitle>Social Interactions</CardTitle>
              <CardDescription>Messages, posts, and comments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.interactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No interactions today
                </p>
              ) : (
                report.interactions.map((interaction, index) => (
                  <div
                    key={index}
                    className={`p-3 border-2 rounded-lg transition-all duration-200 hover:shadow-md animate-in fade-in slide-in-from-left-4 ${
                      interaction.flagged ? "border-red-300 bg-gradient-to-r from-red-50 to-red-100/50" : "border-gray-200 bg-gradient-to-r from-white to-gray-50/20 hover:border-purple-300"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium capitalize">
                            {interaction.type}
                          </span>
                          {interaction.flagged && (
                            <Badge variant="destructive">Flagged</Badge>
                          )}
                        </div>
                        <p className="text-sm mb-2">{interaction.content}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(interaction.timestamp.seconds * 1000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card className="border-2 hover:border-yellow-200 transition-all duration-300 bg-gradient-to-br from-white to-yellow-50/20">
            <CardHeader>
              <CardTitle>Achievements Earned</CardTitle>
              <CardDescription>Celebrating {childName}'s progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.achievements.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No achievements earned today
                </p>
              ) : (
                report.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border-2 rounded-lg hover:border-yellow-300 transition-all duration-200 hover:shadow-md bg-gradient-to-r from-white to-yellow-50/20 animate-in fade-in zoom-in-50" style={{ animationDelay: `${index * 50}ms` }}>
                    <Trophy className="h-5 w-5 text-yellow-600 mt-0.5 animate-pulse" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{achievement.title}</p>
                        <Badge
                          variant="outline"
                          className={
                            achievement.type === "educational"
                              ? "text-green-600"
                              : achievement.type === "creative"
                              ? "text-purple-600"
                              : "text-blue-600"
                          }
                        >
                          {achievement.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(achievement.timestamp.seconds * 1000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
