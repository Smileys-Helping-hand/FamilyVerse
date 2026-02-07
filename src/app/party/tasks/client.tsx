'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Skull, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { RaceStartSequence } from '@/components/party/RaceStartSequence';
import {
  getTaskPadDataAction,
  completeTaskAction,
  getTaskProgressAction,
  reportBodyAction,
} from '@/app/actions/party-logic';
import { usePartySocket } from '@/hooks/use-party-socket';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PartyUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  walletBalance: number;
}

interface TaskItem {
  id: string;
  description: string;
  pointsReward?: number;
  isCompleted?: boolean;
}

export default function TaskPadClient({ user }: { user: PartyUser }) {
  const [role, setRole] = useState<'CREWMATE' | 'IMPOSTER' | 'UNKNOWN'>('UNKNOWN');
  const [roleRevealed, setRoleRevealed] = useState(false);
  const [teamProgress, setTeamProgress] = useState(0);
  const [teamTotals, setTeamTotals] = useState({ completed: 0, total: 0 });
  const [reporting, setReporting] = useState(false);
  const [commsJammed, setCommsJammed] = useState(false);
  const [sabotageOpen, setSabotageOpen] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [fakeTasks, setFakeTasks] = useState<TaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  const { bind } = usePartySocket('party-lobby');

  const loadTaskPad = async () => {
    setLoadingTasks(true);
    const result = await getTaskPadDataAction();
    if (result.success) {
      setRole(result.role || 'CREWMATE');
      setTasks(result.tasks || []);
      setFakeTasks((result.fakeTasks || []).map((description: string, index: number) => ({
        id: `fake-${index}`,
        description,
      })));
    }
    setLoadingTasks(false);
  };

  const loadProgress = async () => {
    const result = await getTaskProgressAction();
    if (result.success) {
      setTeamProgress(result.completionRate ?? 0);
      setTeamTotals({
        completed: result.completed ?? 0,
        total: result.total ?? 0,
      });
    }
  };

  useEffect(() => {
    loadTaskPad();
    loadProgress();

    bind('task-progress-update', (data) => {
      if (typeof data?.completionRate === 'number') {
        setTeamProgress(data.completionRate);
      }
    });

    bind('crew-victory', () => {
      toast({
        title: '✅ Crew Victory!',
        description: 'All tasks are complete. You saved the ship!',
      });
    });

    bind('false-alarm', () => {
      toast({
        title: '🚨 False Alarm',
        description: 'Someone triggered a fake alert.',
      });
    });

    bind('jam-comms', (data) => {
      const durationMs = typeof data?.durationMs === 'number' ? data.durationMs : 30000;
      setCommsJammed(true);
      setTimeout(() => setCommsJammed(false), durationMs);
    });
  }, []);

  const handleCompleteTask = async (taskId: string, pointsReward?: number) => {
    if (completingTaskId) {
      return;
    }
    setCompletingTaskId(taskId);
    const result = await completeTaskAction(user.id, taskId);
    if (result.success) {
      toast({
        title: '✅ Task Complete!',
        description: `+${pointsReward ?? 50} pts`,
      });
      await loadTaskPad();
      await loadProgress();
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
    setCompletingTaskId(null);
  };

  const handleReportBody = async () => {
    setReporting(true);
    const result = await reportBodyAction(user.id);

    if (result.success) {
      toast({
        title: '🚨 Body Reported!',
        description: 'Emergency meeting called.',
      });
    } else {
      toast({
        title: '❌ Failed',
        description: result.error,
        variant: 'destructive',
      });
    }

    setReporting(false);
  };

  const handleCopyInvite = async () => {
    try {
      const inviteUrl = `${window.location.origin}/party/join`;
      await navigator.clipboard.writeText(inviteUrl);
      toast({ title: '🔗 Invite link copied', description: inviteUrl });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Tap and hold the URL from the address bar instead.',
        variant: 'destructive',
      });
    }
  };

  const roleStyles =
    role === 'IMPOSTER'
      ? 'bg-red-600/25 text-red-100 border-red-400/60'
      : role === 'CREWMATE'
      ? 'bg-emerald-500/20 text-emerald-100 border-emerald-300/50'
      : 'bg-slate-600/20 text-slate-100 border-slate-300/40';

  return (
    <div className={`min-h-screen text-white ${glitching ? 'glitch' : ''}`}>
      <RaceStartSequence />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#041425] via-[#0a2a3f] to-[#0b1130] aurora" />
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(200,255,255,0.12) 1px, transparent 0), linear-gradient(120deg, rgba(40,200,255,0.25), transparent 55%)',
          backgroundSize: '26px 26px, 100% 100%',
        }}
      />
      <div className="absolute -z-10 -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl float" />
      <div className="absolute -z-10 top-1/4 -right-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl float-slow" />
      <div className="absolute -z-10 bottom-0 left-1/3 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl float" />
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6 relative">
        <div className="flex items-center justify-between">
          <Link href="/party/dashboard">
            <Button variant="ghost" size="sm" className="text-white bg-white/10 hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Party
            </Button>
          </Link>
          <Badge className="bg-white/15 text-white border-white/30">Task Pad</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-cyan-300/30 bg-white/10 backdrop-blur">
            <CardContent className="pt-6 space-y-3">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Live Status</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">Team Progress</span>
                <span className="text-white">{Math.round(teamProgress)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">Tasks Done</span>
                <span className="text-white">{teamTotals.completed}/{teamTotals.total}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">Comms</span>
                <span className={commsJammed ? 'text-red-300' : 'text-emerald-200'}>
                  {commsJammed ? 'Jammed' : 'Online'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-300/30 bg-white/10 backdrop-blur">
            <CardContent className="pt-6 space-y-3">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Quick Actions</div>
              <Button onClick={handleCopyInvite} className="w-full" variant="secondary">
                Copy Invite Link
              </Button>
              <Link href="/party/tv">
                <Button className="w-full" variant="secondary">
                  Open TV Mode
                </Button>
              </Link>
              <Link href="/party/dashboard">
                <Button className="w-full" variant="outline">
                  Party Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-cyan-300/30 bg-white/10 backdrop-blur">
            <CardContent className="pt-6 space-y-3">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Sound + Haptics</div>
              <Button
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="w-full"
                variant={soundEnabled ? 'default' : 'secondary'}
              >
                {soundEnabled ? 'Sound On' : 'Sound Off'}
              </Button>
              <Button
                onClick={() => setHapticsEnabled((prev) => !prev)}
                className="w-full"
                variant={hapticsEnabled ? 'default' : 'secondary'}
              >
                {hapticsEnabled ? 'Haptics On' : 'Haptics Off'}
              </Button>
              <p className="text-xs text-white/60">
                Tip: Enable vibration in your phone settings for the full effect.
              </p>
            </CardContent>
          </Card>
        </div>

        {role === 'IMPOSTER' && (
          <button
            type="button"
            onClick={() => {
              setGlitching(true);
              setTimeout(() => setGlitching(false), 600);
              setSabotageOpen((prev) => !prev);
            }}
            className="absolute top-4 right-4 h-6 w-6 rounded-full border border-white/20 bg-white/10 hover:bg-white/20"
            aria-label="Sabotage"
          />
        )}

        <Card className="border-cyan-300/30 bg-white/10 backdrop-blur">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="button"
                onClick={() => setRoleRevealed((prev) => !prev)}
                className={`px-4 py-2 rounded-full border text-sm font-semibold uppercase tracking-wide transition ${roleStyles}`}
              >
                {roleRevealed ? (
                  <span className="flex items-center gap-2">
                    {role === 'IMPOSTER' ? <Skull className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    Role: {role}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Tap to Reveal Role
                  </span>
                )}
              </button>
              <div className="text-xs text-white/70">
                Team Tasks: {teamTotals.completed}/{teamTotals.total}
              </div>
            </div>

            {!commsJammed ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Team Task Bar</span>
                  <span>{Math.round(teamProgress)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-cyan-300 via-emerald-300 to-lime-200"
                    initial={{ width: 0 }}
                    animate={{ width: `${teamProgress}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-red-300 uppercase tracking-widest">
                Comms Jammed...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-cyan-300/30 bg-white/10 backdrop-blur">
          <CardContent className="pt-6 space-y-2">
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Role Tips</div>
            <p className="text-sm text-white/80">Stay close to others to build trust, but avoid stacking.</p>
            <p className="text-sm text-white/80">Complete tasks in clusters for fast progress.</p>
            <p className="text-sm text-white/80">Report suspicious moves quickly to control the vote.</p>
          </CardContent>
        </Card>

        <div className="flex-1 max-h-[60vh] overflow-y-auto pr-1">
          <Card className="border-cyan-300/30 bg-white/10 backdrop-blur">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm uppercase tracking-[0.3em] text-white/70">Your Mission</div>
                <Badge className="bg-white/15 text-white border-white/30">
                  {role === 'IMPOSTER' ? 'Fake Tasks' : 'Crew Tasks'}
                </Badge>
              </div>

              {commsJammed ? (
                <div className="text-center text-red-300 uppercase tracking-widest">
                  Communications Offline
                </div>
              ) : loadingTasks ? (
                <div className="text-center text-white/60">Loading tasks...</div>
              ) : role === 'IMPOSTER' ? (
                <div className="space-y-3">
                  {fakeTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg border border-red-400/40 bg-red-500/15 p-4"
                    >
                      <p className="text-sm text-red-100">{task.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      className={`rounded-lg border border-emerald-300/40 bg-emerald-500/15 p-4 ${
                        task.isCompleted ? 'opacity-60' : ''
                      }`}
                      drag="x"
                      dragConstraints={{ left: 0, right: 140 }}
                      dragElastic={0.2}
                      onDragEnd={(event, info) => {
                        if (info.offset.x > 110 && !task.isCompleted) {
                          handleCompleteTask(task.id, task.pointsReward);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-emerald-50">{task.description}</p>
                        <span className="text-xs text-emerald-200">+{task.pointsReward ?? 50}</span>
                      </div>
                      <div className="mt-2 text-[10px] uppercase tracking-widest text-emerald-200/70">
                        Swipe right to complete
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-cyan-300/30 bg-white/10 backdrop-blur">
          <CardContent className="pt-6 flex flex-col gap-3">
            <p className="text-sm text-white/80">
              Found something suspicious? Call an emergency meeting.
            </p>
            <Button
              onClick={handleReportBody}
              disabled={reporting}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              {reporting ? 'Reporting...' : '🚨 Report Body'}
            </Button>
          </CardContent>
        </Card>

        {sabotageOpen && role === 'IMPOSTER' && (
          <Card className="border-red-400/40 bg-red-900/25">
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm text-red-200 uppercase tracking-widest">Sabotage</p>
              <Button
                onClick={async () => {
                  const { triggerFalseAlarmAction } = await import('@/app/actions/party-logic');
                  await triggerFalseAlarmAction();
                  toast({ title: '🚨 False Alarm Sent' });
                }}
                variant="secondary"
                className="w-full"
              >
                Trigger False Alarm
              </Button>
              <Button
                onClick={async () => {
                  const { jamCommsAction } = await import('@/app/actions/party-logic');
                  await jamCommsAction();
                  toast({ title: '📡 Comms Jammed' });
                }}
                variant="destructive"
                className="w-full"
              >
                Jam Comms (30s)
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <style jsx>{`
        .glitch {
          animation: glitchFlash 0.6s ease-in-out;
        }

        .aurora {
          animation: auroraShift 12s ease-in-out infinite;
        }

        .float {
          animation: float 10s ease-in-out infinite;
        }

        .float-slow {
          animation: float 16s ease-in-out infinite;
        }

        @keyframes glitchFlash {
          0% { filter: hue-rotate(0deg); transform: skew(0deg); }
          20% { filter: hue-rotate(60deg); transform: skew(1deg); }
          40% { filter: hue-rotate(-40deg); transform: skew(-1deg); }
          60% { filter: hue-rotate(90deg); transform: skew(0.5deg); }
          100% { filter: hue-rotate(0deg); transform: skew(0deg); }
        }

        @keyframes auroraShift {
          0% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(18deg); }
          100% { filter: hue-rotate(0deg); }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
