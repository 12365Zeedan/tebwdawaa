import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface ScanRecord {
  id: string;
  overall_score: number;
  created_at: string;
  issues_found: number;
}

interface HealthScoreTrendChartProps {
  scans: ScanRecord[];
}

export function HealthScoreTrendChart({ scans }: HealthScoreTrendChartProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const chartData = useMemo(() => {
    // Reverse to show oldest → newest
    return [...scans]
      .reverse()
      .slice(-20) // last 20 scans
      .map((scan) => ({
        date: new Date(scan.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
          month: 'short',
          day: 'numeric',
        }),
        score: scan.overall_score,
        issues: scan.issues_found,
      }));
  }, [scans, isAr]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return 'neutral';
    const latest = chartData[chartData.length - 1].score;
    const previous = chartData[chartData.length - 2].score;
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'neutral';
  }, [chartData]);

  const latestScore = chartData.length > 0 ? chartData[chartData.length - 1].score : 0;

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {isAr ? 'مؤشر صحة الموقع' : 'Health Score Trend'}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
            {trend === 'neutral' && <Minus className="h-4 w-4 text-muted-foreground" />}
            <span
              className={`text-sm font-semibold ${
                trend === 'up'
                  ? 'text-green-500'
                  : trend === 'down'
                  ? 'text-red-500'
                  : 'text-muted-foreground'
              }`}
            >
              {latestScore}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <ReferenceLine
                y={80}
                strokeDasharray="3 3"
                className="stroke-green-500/40"
                label={{
                  value: isAr ? 'جيد' : 'Good',
                  position: 'insideTopRight',
                  fontSize: 10,
                  className: 'fill-green-500/60',
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => [
                  `${value}${name === 'score' ? '%' : ''}`,
                  name === 'score'
                    ? isAr ? 'النتيجة' : 'Score'
                    : isAr ? 'المشاكل' : 'Issues',
                ]}
              />
              <Line
                type="monotone"
                dataKey="score"
                className="stroke-primary"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ r: 3, className: 'fill-primary stroke-background', strokeWidth: 2 }}
                activeDot={{ r: 5, className: 'fill-primary stroke-background', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="issues"
                stroke="hsl(var(--destructive))"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-primary rounded" />
            {isAr ? 'النتيجة' : 'Score'}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-destructive rounded" style={{ borderStyle: 'dashed' }} />
            {isAr ? 'المشاكل' : 'Issues'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
