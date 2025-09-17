import Link from 'next/link';
import {
  Briefcase,
  Target,
  BookOpen,
  FileText,
  MessageSquare,
  User,
  ArrowRight,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    title: 'AI Career Recommendations',
    description:
      'Get personalized career suggestions based on your unique profile and preferences.',
    link: '/recommendations',
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: 'Skill Gap Analysis',
    description:
      'Identify the skills you need to land your dream job and where you stand today.',
    link: '/skill-gap',
  },
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: 'Personalized Roadmap',
    description: 'A custom 3-month learning plan to bridge your skill gaps.',
    link: '/roadmap',
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Resume Builder',
    description: 'Generate a professional, ATS-friendly resume in minutes.',
    link: '/resume',
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: 'Interview Prep',
    description:
      'Practice with AI-generated questions and model answers for any role.',
    link: '/interview-prep',
  },
  {
    icon: <User className="h-8 w-8 text-primary" />,
    title: 'Manage Profile',
    description:
      'Keep your professional details up-to-date to get the best recommendations.',
    link: '/profile',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Welcome to CareerLens
          </h1>
          <p className="text-muted-foreground">
            Your personal AI-powered career co-pilot.
          </p>
        </div>
        <Button asChild>
          <Link href="/profile">
            Complete Your Profile <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link href={feature.link} key={feature.title} className="group">
            <Card className="flex flex-col h-full transition-all duration-300 ease-in-out hover:border-primary/80 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="flex-row items-start gap-4 space-y-0">
                <div className="flex items-center justify-center bg-primary/10 rounded-lg p-3">
                  {feature.icon}
                </div>
                <div className="grid gap-1">
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
