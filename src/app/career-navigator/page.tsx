'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Search,
  Filter,
  Download,
  RefreshCw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import NodeDetailPanel from '@/components/NodeDetailPanel';

// Dynamically import ReactFlow to avoid SSR issues
const CareerTreeCanvas = dynamic(() => import('@/components/CareerTreeCanvas'), {
  ssr: false,
});

interface CareerNode {
  id: string;
  label: string;
  type: string;
  score?: number;
  summary?: string;
  metadata?: any;
  actions?: any;
  children?: string[];
  sources?: string[];
}

interface CareerTreeData {
  root: { id: string; label: string; type: string };
  nodes: CareerNode[];
  edges: Array<{ from: string; to: string; type?: string; label?: string }>;
  insights?: string[];
}

const GRADE_OPTIONS = [
  { value: 'grade8', label: 'Grade 8' },
  { value: 'grade9', label: 'Grade 9' },
  { value: 'grade10', label: 'Grade 10' },
  { value: 'grade11', label: 'Grade 11' },
  { value: 'grade12_science', label: 'Grade 12 - Science' },
  { value: 'grade12_commerce', label: 'Grade 12 - Commerce' },
  { value: 'grade12_arts', label: 'Grade 12 - Arts' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'ug_btech', label: 'BTech (Pursuing)' },
  { value: 'ug_bsc', label: 'BSc (Pursuing)' },
  { value: 'ug_bcom', label: 'BCom (Pursuing)' },
  { value: 'ug_ba', label: 'BA (Pursuing)' },
  { value: 'pg_mtech', label: 'MTech (Pursuing)' },
  { value: 'pg_msc', label: 'MSc (Pursuing)' },
];

const INTEREST_OPTIONS = [
  'Coding', 'AI & ML', 'Medicine', 'Design', 'Business', 'Law',
  'Research', 'Teaching', 'Government Jobs', 'Entrepreneurship',
  'Finance', 'Data Science', 'Cloud Computing', 'Cybersecurity',
];

export default function CareerNavigatorPage() {
  const [currentGrade, setCurrentGrade] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [region, setRegion] = useState('India');
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<CareerTreeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleGenerate = async () => {
    if (!currentGrade) {
      alert('Please select your current grade/education level');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/career-navigator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentGrade,
          interests,
          region,
        }),
      });

      const result = await response.json();
      if (result.success && result.data) {
        setTreeData(result.data);
      } else {
        alert('Failed to generate career path: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch career path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback((node: CareerNode) => {
    setSelectedNode(node);
  }, []);

  const handleAddToRoadmap = useCallback(async (nodeId: string) => {
    // TODO: Implement Firestore save
    alert(`Adding node ${nodeId} to your roadmap! (Feature coming soon)`);
  }, []);

  const handleExportPDF = async () => {
    alert('PDF export feature coming soon!');
  };

  const filteredNodes = treeData?.nodes.filter((node) => {
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || node.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredEdges = treeData?.edges.filter((edge) => {
    return (
      filteredNodes?.some((n) => n.id === edge.from) &&
      filteredNodes?.some((n) => n.id === edge.to)
    );
  });

  return (
    <div className="min-h-screen bg-transparent text-white relative z-10">
      {/* Header - Glassmorphism */}
      <div className="border-b border-white/[0.16] bg-white/[0.08] backdrop-blur-xl">
        <div className="max-w-[1920px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon-purple animate-glow">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-glow-purple">
                  Career Path Navigator
                </h1>
                <p className="text-white/65 text-sm mt-1">
                  AI-powered journey from Grade 8 to Dream Career
                </p>
              </div>
            </div>
            {treeData && (
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.1] backdrop-blur-lg border border-white/20 hover:bg-white/[0.2] hover:scale-105 active:scale-95 font-semibold transition-all shadow-neon-emerald"
              >
                <Download className="w-5 h-5" />
                Export PDF
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-100px)]">
        {/* Left Sidebar - Glass Controls */}
        <div className="w-[350px] border-r border-white/[0.16] bg-white/[0.05] backdrop-blur-xl p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Grade Selection - Glass Input */}
            <div>
              <label className="block text-sm font-semibold text-white/85 mb-3">
                <Sparkles className="w-4 h-4 inline mr-2 text-neon-purple" />
                Current Education Level
              </label>
              <select
                value={currentGrade}
                onChange={(e) => setCurrentGrade(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.08] backdrop-blur-lg border border-white/20 text-white focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 outline-none transition-all"
              >
                <option value="" className="bg-gray-900">Select your level...</option>
                {GRADE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Interests - Glass Pills */}
            <div>
              <label className="block text-sm font-semibold text-white/85 mb-3">
                Your Interests (select multiple)
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => {
                      setInterests((prev) =>
                        prev.includes(interest)
                          ? prev.filter((i) => i !== interest)
                          : [...prev, interest]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all backdrop-blur-lg ${interests.includes(interest)
                        ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30 shadow-neon-purple/20 shadow-sm'
                        : 'bg-white/[0.08] text-white/65 hover:bg-white/[0.12] border border-white/10'
                      }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Region - Glass Input */}
            <div>
              <label className="block text-sm font-semibold text-white/85 mb-3">
                Region (optional)
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g., Karnataka, Delhi"
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.08] backdrop-blur-lg border border-white/20 text-white placeholder-white/45 focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 outline-none transition-all"
              />
            </div>

            {/* Generate Button - Neon Glass */}
            <button
              onClick={handleGenerate}
              disabled={loading || !currentGrade}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all shadow-neon-purple border-2 border-white/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Career Tree
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Search & Filter (show after generation) - Glass Controls */}
            {treeData && (
              <>
                <div className="pt-6 border-t border-white/[0.12]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search nodes..."
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.08] backdrop-blur-lg border border-white/20 text-white placeholder-white/45 focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/85 mb-3">
                    <Filter className="w-4 h-4 inline mr-2 text-neon-cyan" />
                    Filter by Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'stream', 'subject', 'exam', 'degree', 'career'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all backdrop-blur-lg ${filterType === type
                            ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 shadow-neon-cyan/20 shadow-sm'
                            : 'bg-white/[0.08] text-white/65 hover:bg-white/[0.12] border border-white/10'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Insights - Glass Panel */}
                {treeData.insights && treeData.insights.length > 0 && (
                  <div className="bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 rounded-2xl p-4 border border-white/20 backdrop-blur-xl shadow-glass">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white/90">
                      <Sparkles className="w-4 h-4 text-neon-emerald" />
                      AI Insights
                    </h3>
                    <ul className="space-y-2">
                      {treeData.insights.map((insight, i) => (
                        <li key={i} className="text-xs text-white/75 leading-relaxed">
                          • {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Center - Graph Canvas */}
        <div className="flex-1 p-6">
          {!treeData ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center shadow-neon-purple">
                  <GraduationCap className="w-10 h-10 text-neon-purple" />
                </div>
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                  Ready to Explore Your Future?
                </h2>
                <p className="text-white/65 mb-6">
                  Select your education level and interests, then click Generate to see your
                  personalized career pathway tree with AI-powered recommendations.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-white/50">
                  <span>🎯 Smart Scoring</span>
                  <span>💼 Career Paths</span>
                  <span>📚 Courses & Exams</span>
                </div>
              </div>
            </div>
          ) : (
            <CareerTreeCanvas
              nodes={filteredNodes || []}
              edges={filteredEdges || []}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedNode?.id}
            />
          )}
        </div>
      </div>

      {/* Right Panel - Node Details */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onAddToRoadmap={handleAddToRoadmap}
        />
      )}
    </div>
  );
}
