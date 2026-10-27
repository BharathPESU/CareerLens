"use client";

import { useEffect, useState } from "react";

interface CareerUpdate {
  timestamp: any;
  summary: {
    trendingSkills: Array<{ skill: string; changePct: number; evidence: string[] }>;
    jobs: Array<{ title: string; city: string; count: number; exampleLinks: string[] }>;
    certifications: Array<{ name: string; platform: string; url: string }>;
    opportunities: Array<{ title: string; summary: string }>;
    insights: string;
    metrics: { aiMlGrowthPct?: number; reactOpenings?: number; topCity?: string };
  };
}

export default function CareerUpdatesWidget() {
  const [update, setUpdate] = useState<CareerUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLatest = async () => {
    try {
      const res = await fetch('/api/career-updates/latest');
      const json = await res.json();
      if (json.success && json.data) {
        setUpdate(json.data as CareerUpdate);
      }
    } catch (error) {
      console.error("Error fetching career updates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/career-updates/refresh', { method: 'POST' });
      await fetchLatest();
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  if (loading) return <div className="animate-pulse h-64 bg-gray-100/10 rounded-xl"></div>;
  if (!update || !update.summary) return <div className="p-4 text-gray-400">Waiting for live career intel...</div>;

  const { summary } = update;
  const skills = summary.trendingSkills || [];
  const jobs = summary.jobs || [];
  const insights = summary.insights || "Analyzing latest career trends...";

  const formattedTime = new Date(
    typeof update.timestamp?.toDate === 'function'
      ? update.timestamp.toDate()
      : update.timestamp || Date.now()
  ).toLocaleTimeString();

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Real-Time Career Intel
        </h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-full transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Fetching...' : 'Refresh Data'}
          </button>
          <span className="flex items-center gap-2 text-xs text-green-400 px-2 py-1 bg-green-400/10 rounded-full animate-pulse">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            LIVE
          </span>
        </div>
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-200 text-sm font-medium">💡 Insight</p>
        <p className="text-gray-200 mt-1">{insights}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trending Skills */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Trending Skills</h4>
          <div className="space-y-2">
            {skills.length > 0 ? skills.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div>
                  <span className="font-medium text-white">{s.skill}</span>
                  {s.evidence?.[0] && <p className="text-xs text-gray-400 mt-0.5">{s.evidence[0]}</p>}
                </div>
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                  +{s.changePct}%
                </span>
              </div>
            )) : <p className="text-sm text-gray-500">Scanning trends...</p>}
          </div>
        </div>

        {/* In-Demand Jobs */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">In-Demand Roles</h4>
          <div className="space-y-2">
            {jobs.length > 0 ? jobs.map((j, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div>
                  <span className="font-medium text-white">{j.title}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{j.city}</p>
                </div>
                <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                  {j.count}+ openings
                </span>
              </div>
            )) : <p className="text-sm text-gray-500">Scanning job boards...</p>}
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 overflow-x-auto gap-4">
        {summary.metrics?.aiMlGrowthPct && (
          <div className="flex-shrink-0 text-xs">
            <span className="text-gray-400">AI/ML Surge:</span>
            <span className="ml-1 text-green-400 font-bold">+{summary.metrics.aiMlGrowthPct}%</span>
          </div>
        )}
        {summary.metrics?.reactOpenings && (
          <div className="flex-shrink-0 text-xs">
            <span className="text-gray-400">React Jobs:</span>
            <span className="ml-1 text-blue-400 font-bold">{summary.metrics.reactOpenings.toLocaleString()}</span>
          </div>
        )}
        {summary.metrics?.topCity && (
          <div className="flex-shrink-0 text-xs">
            <span className="text-gray-400">Top Hub:</span>
            <span className="ml-1 text-purple-400 font-bold">{summary.metrics.topCity}</span>
          </div>
        )}
      </div>
      
      <div className="text-right text-[10px] text-gray-500">
        Updated: {formattedTime}
      </div>
    </div>
  );
}
