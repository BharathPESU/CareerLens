'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, BookOpen, Link as LinkIcon, DollarSign } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getPersonalizedRoadmap } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { CreatePersonalizedRoadmapOutput } from '@/ai/flows/create-personalized-roadmap';

const formSchema = z.object({
  careerRecommendation: z.string().min(3, 'Please specify a career goal.'),
  userSkills: z.string(),
  missingSkills: z.string().min(3, 'Please list skills to learn.'),
});

export function RoadmapPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreatePersonalizedRoadmapOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      careerRecommendation: 'Senior Frontend Developer',
      userSkills: 'React, JavaScript, HTML, CSS',
      missingSkills: 'TypeScript, GraphQL, Redux Toolkit, Next.js',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const payload = {
      ...values,
      userSkills: values.userSkills.split(',').map(s => s.trim()),
      missingSkills: values.missingSkills.split(',').map(s => s.trim()),
    };
    const response = await getPersonalizedRoadmap(payload);
    setIsLoading(false);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><BookOpen className="w-8 h-8 text-primary"/> Personalized Learning Roadmap</h1>
        <p className="text-muted-foreground">Your 3-month journey to a new career, planned by AI.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Define Your Goal</CardTitle>
          <CardDescription>Enter your target career and skills to generate a roadmap.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="careerRecommendation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Career</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Data Scientist" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Existing Skills (comma-separated)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="React, Node.js, Python..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="missingSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills to Learn (comma-separated)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="TypeScript, GraphQL, Docker..." {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Roadmap
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your 12-Week Learning Plan</h2>
            <Accordion type="single" collapsible className="w-full">
            {result.learningPlan.map((week, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">Week {week.week}: {week.topic}</AccordionTrigger>
                <AccordionContent className="p-4 space-y-4 bg-muted/30 rounded-b-lg">
                    <h4 className="font-semibold">Resources:</h4>
                    <ul className="space-y-3">
                        {week.resources.map((resource, rIndex) => (
                            <li key={rIndex} className="flex items-center justify-between p-3 rounded-md border bg-background">
                                <div>
                                    <p className="font-medium">{resource.name}</p>
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                        <LinkIcon className="w-3 h-3" />
                                        {resource.url}
                                    </a>
                                </div>
                                <Badge variant={resource.type === 'free' ? 'secondary' : 'default'}>
                                    {resource.type === 'paid' && <DollarSign className="w-3 h-3 mr-1"/>}
                                    {resource.type}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        </div>
      )}
    </div>
  );
}
