import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Users, BookOpen, RotateCcw, Upload, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EchoCard } from "@/components/EchoCard";
import { ProgressRing } from "@/components/ProgressRing";
import { PageTransition } from "@/components/PageTransition";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar } from "recharts";

const weeklyActiveData = [
  { day: "Mon", users: 82 },
  { day: "Tue", users: 95 },
  { day: "Wed", users: 110 },
  { day: "Thu", users: 104 },
  { day: "Fri", users: 118 },
  { day: "Sat", users: 72 },
  { day: "Sun", users: 68 },
];

const retentionData = [
  { week: "W1", before: 28, after: 84 },
  { week: "W2", before: 25, after: 78 },
  { week: "W3", before: 30, after: 88 },
  { week: "W4", before: 22, after: 72 },
];

const uploadsData = [
  { day: "Mon", pdfs: 34, notes: 22, videos: 8 },
  { day: "Tue", pdfs: 41, notes: 28, videos: 12 },
  { day: "Wed", pdfs: 52, notes: 35, videos: 15 },
  { day: "Thu", pdfs: 48, notes: 30, videos: 11 },
  { day: "Fri", pdfs: 55, notes: 38, videos: 18 },
  { day: "Sat", pdfs: 28, notes: 18, videos: 6 },
  { day: "Sun", pdfs: 22, notes: 14, videos: 5 },
];

const dauChartConfig: ChartConfig = {
  users: { label: "Active Users", color: "hsl(var(--primary))" },
};

const retentionChartConfig: ChartConfig = {
  before: { label: "Before EchoLearn", color: "hsl(var(--muted-foreground))" },
  after: { label: "With EchoLearn", color: "hsl(142 60% 45%)" },
};

const uploadsChartConfig: ChartConfig = {
  pdfs: { label: "PDFs", color: "hsl(var(--primary))" },
  notes: { label: "Notes", color: "hsl(var(--accent))" },
  videos: { label: "Videos", color: "hsl(262 60% 60%)" },
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-outfit text-xl font-semibold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Platform performance & impact metrics</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">Live · Updated just now</span>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Hero KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Concept Retention"
              value="3×"
              sub="improvement vs. traditional study"
              variant="sage"
              delay={0}
            />
            <KpiCard
              icon={<RotateCcw className="w-5 h-5" />}
              label="Weekly Return Rate"
              value="73%"
              sub="students return each week"
              variant="lavender"
              delay={0.05}
            />
            <KpiCard
              icon={<Users className="w-5 h-5" />}
              label="Daily Active Users"
              value="100+"
              sub="learners engaging daily"
              variant="warm"
              delay={0.1}
            />
            <KpiCard
              icon={<Upload className="w-5 h-5" />}
              label="Materials Uploaded"
              value="1,240"
              sub="personal docs this month"
              variant="sky"
              delay={0.15}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EchoCard variant="default" className="p-0 overflow-hidden">
              <div className="p-6 pb-2">
                <h3 className="font-outfit font-semibold text-foreground">Daily Active Users</h3>
                <p className="text-sm text-muted-foreground">This week's engagement</p>
              </div>
              <div className="px-4 pb-4">
                <ChartContainer config={dauChartConfig} className="h-[220px] w-full">
                  <AreaChart data={weeklyActiveData}>
                    <defs>
                      <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fill="url(#dauGrad)" strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </div>
            </EchoCard>

            <EchoCard variant="default" className="p-0 overflow-hidden">
              <div className="p-6 pb-2">
                <h3 className="font-outfit font-semibold text-foreground">Retention: 3× Improvement</h3>
                <p className="text-sm text-muted-foreground">Concept recall after 1 week (%)</p>
              </div>
              <div className="px-4 pb-4">
                <ChartContainer config={retentionChartConfig} className="h-[220px] w-full">
                  <BarChart data={retentionData}>
                    <XAxis dataKey="week" axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="before" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="after" fill="hsl(142 60% 45%)" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ChartContainer>
              </div>
            </EchoCard>
          </div>

          {/* Uploads chart + secondary stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <EchoCard variant="default" className="lg:col-span-2 p-0 overflow-hidden">
              <div className="p-6 pb-2">
                <h3 className="font-outfit font-semibold text-foreground">Real-Time Tutoring Uploads</h3>
                <p className="text-sm text-muted-foreground">Students uploading personal materials daily</p>
              </div>
              <div className="px-4 pb-4">
                <ChartContainer config={uploadsChartConfig} className="h-[220px] w-full">
                  <BarChart data={uploadsData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="pdfs" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="notes" stackId="a" fill="hsl(var(--accent))" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="videos" stackId="a" fill="hsl(262 60% 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </EchoCard>

            <div className="space-y-4">
              <EchoCard variant="sage" className="flex items-center gap-4">
                <ProgressRing progress={73} size={56} strokeWidth={5} />
                <div>
                  <p className="font-outfit font-semibold text-foreground text-lg">73%</p>
                  <p className="text-sm text-muted-foreground">Weekly return rate</p>
                </div>
              </EchoCard>
              <EchoCard variant="lavender" className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-outfit font-semibold text-foreground text-lg">24 min</p>
                  <p className="text-sm text-muted-foreground">Avg. session length</p>
                </div>
              </EchoCard>
              <EchoCard variant="warm" className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-outfit font-semibold text-foreground text-lg">4.2</p>
                  <p className="text-sm text-muted-foreground">Topics mastered / user</p>
                </div>
              </EchoCard>
            </div>
          </div>

          {/* Footer trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-xs text-muted-foreground pt-4 pb-8 space-y-1"
          >
            <p>In partnership with Angel Express · In conversation with Teach for India & Akanksha Foundation</p>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  variant,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  variant: "sage" | "warm" | "lavender" | "sky";
  delay: number;
}) {
  return (
    <EchoCard variant={variant} delay={delay} className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="font-outfit text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground leading-snug">{sub}</p>
    </EchoCard>
  );
}
