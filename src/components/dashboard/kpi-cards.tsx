'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Thermometer, Flame, Wifi, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardStats } from '@/types';

interface KpiCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
};

export function KpiCards({ stats, loading }: KpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const avgTemp = stats.currentAvgTemp;
  const tempColor =
    avgTemp > 60
      ? 'text-red-500'
      : avgTemp > 40
        ? 'text-amber-500'
        : 'text-emerald-500';
  const tempBg =
    avgTemp > 60
      ? 'bg-red-50 dark:bg-red-950/30'
      : avgTemp > 40
        ? 'bg-amber-50 dark:bg-amber-950/30'
        : 'bg-emerald-50 dark:bg-emerald-950/30';

  const cards = [
    {
      title: 'Avg Temperature',
      value: `${avgTemp.toFixed(1)}°C`,
      subtitle: avgTemp > 60 ? 'Danger - Above threshold' : avgTemp > 40 ? 'Warning - Elevated' : 'Normal range',
      icon: <Thermometer className="h-6 w-6" />,
      iconColor: tempColor,
      iconBg: tempBg,
    },
    {
      title: 'Flame Detected',
      value: stats.flameDetectedCount.toString(),
      subtitle: stats.flameDetectedCount > 0 ? 'Active fire detected!' : 'No flames detected',
      icon: <Flame className="h-6 w-6" />,
      iconColor: stats.flameDetectedCount > 0 ? 'text-red-500' : 'text-emerald-500',
      iconBg: stats.flameDetectedCount > 0 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30',
      pulse: stats.flameDetectedCount > 0,
    },
    {
      title: 'Online Devices',
      value: `${stats.onlineDevices}/${stats.totalDevices}`,
      subtitle: `${stats.offlineDevices} device(s) offline`,
      icon: <Wifi className="h-6 w-6" />,
      iconColor: stats.onlineDevices === stats.totalDevices ? 'text-emerald-500' : 'text-amber-500',
      iconBg: stats.onlineDevices === stats.totalDevices ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      title: 'Alerts Today',
      value: stats.totalAlertsToday.toString(),
      subtitle: `${stats.unresolvedAlerts} unresolved`,
      icon: <AlertTriangle className="h-6 w-6" />,
      iconColor: stats.totalAlertsToday > 10 ? 'text-red-500' : stats.totalAlertsToday > 5 ? 'text-amber-500' : 'text-emerald-500',
      iconBg: stats.totalAlertsToday > 10 ? 'bg-red-50 dark:bg-red-950/30' : stats.totalAlertsToday > 5 ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <span className={card.iconColor}>
                    {card.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.pulse ? 'animate-pulse-danger' : ''}`}>
                    {card.value}
                  </p>
                  <p className={`text-xs ${card.iconColor} truncate`}>{card.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
