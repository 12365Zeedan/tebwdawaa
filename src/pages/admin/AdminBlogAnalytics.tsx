import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, TrendingUp, FileText, BarChart3, ArrowLeft, ArrowRight, ExternalLink,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useBlogAnalyticsSummary,
  useTopPosts,
  useDailyViews,
  useReferrerBreakdown,
} from '@/hooks/useBlogAnalytics';
import { StatCard } from '@/components/admin/StatCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--info))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--muted-foreground))',
];

const AdminBlogAnalytics = () => {
  const { language, direction } = useLanguage();
  const isAr = language === 'ar';
  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const { data: summary, isLoading: summaryLoading } = useBlogAnalyticsSummary();
  const { data: topPosts, isLoading: topLoading } = useTopPosts(10);
  const { data: dailyViews, isLoading: dailyLoading } = useDailyViews(30);
  const { data: referrers, isLoading: refLoading } = useReferrerBreakdown();

  const stats = summary
    ? [
        {
          title: isAr ? 'إجمالي المشاهدات' : 'Total Views',
          value: summary.totalViews.toLocaleString(),
          icon: <Eye className="h-6 w-6 text-primary" />,
          iconBg: 'bg-primary/10',
        },
        {
          title: isAr ? 'مشاهدات اليوم' : 'Views Today',
          value: summary.viewsToday.toLocaleString(),
          icon: <TrendingUp className="h-6 w-6 text-accent" />,
          iconBg: 'bg-accent/10',
        },
        {
          title: isAr ? 'إجمالي المقالات' : 'Total Posts',
          value: summary.totalPosts.toLocaleString(),
          icon: <FileText className="h-6 w-6 text-info" />,
          iconBg: 'bg-info/10',
        },
        {
          title: isAr ? 'متوسط المشاهدات لكل مقال' : 'Avg Views / Post',
          value: summary.avgViewsPerPost.toLocaleString(),
          icon: <BarChart3 className="h-6 w-6 text-success" />,
          iconBg: 'bg-success/10',
        },
      ]
    : [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link to="/admin/blog">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <BackArrow className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">
                {isAr ? 'تحليلات المدونة' : 'Blog Analytics'}
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              {isAr ? 'تتبع أداء المقالات والتفاعل' : 'Track article performance and engagement'}
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))
            : stats.map((stat, index) => (
                <div
                  key={index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <StatCard {...stat} />
                </div>
              ))}
        </div>

        {/* Views Over Time Chart */}
        <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">
              {isAr ? 'المشاهدات خلال 30 يوم' : 'Views Over Last 30 Days'}
            </h2>
          </div>
          <div className="p-6">
            {dailyLoading ? (
              <Skeleton className="h-72 w-full rounded-lg" />
            ) : dailyViews && dailyViews.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyViews}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                    labelFormatter={formatDate}
                    formatter={(value: number) => [value, isAr ? 'مشاهدات' : 'Views']}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#viewsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground">
                {isAr ? 'لا توجد بيانات بعد' : 'No data yet'}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Posts */}
          <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                {isAr ? 'أكثر المقالات مشاهدة' : 'Top Posts by Views'}
              </h2>
            </div>
            <div className="p-4">
              {topLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : topPosts && topPosts.length > 0 ? (
                <div className="space-y-2">
                  {topPosts.map((post, index) => {
                    const title = isAr ? post.title_ar : post.title;
                    return (
                      <div
                        key={post.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt={title}
                            className="w-10 h-8 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {title}
                          </p>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0 gap-1">
                          <Eye className="h-3 w-3" />
                          {(post.view_count ?? 0).toLocaleString()}
                        </Badge>
                        <Link to={`/blog/${post.slug}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  {isAr ? 'لا توجد مقالات بعد' : 'No posts yet'}
                </div>
              )}
            </div>
          </div>

          {/* Referrer Breakdown */}
          <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                {isAr ? 'مصادر الزيارات' : 'Traffic Sources'}
              </h2>
            </div>
            <div className="p-6">
              {refLoading ? (
                <Skeleton className="h-72 w-full rounded-lg" />
              ) : referrers && referrers.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={referrers} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="referrer"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                      formatter={(value: number) => [value, isAr ? 'زيارات' : 'Visits']}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {referrers.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-72 flex items-center justify-center text-muted-foreground">
                  {isAr ? 'لا توجد بيانات بعد' : 'No data yet'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBlogAnalytics;
