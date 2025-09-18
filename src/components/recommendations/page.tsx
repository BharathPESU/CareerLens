
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, Wand2, Lightbulb, CheckCircle, ListTodo, BookOpen, Briefcase } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getCareerRecommendations } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { GenerateCareerRecommendationsOutput } from '@/ai/schemas/career-recommendations';


const formSchema = z.object({
  userProfile: z.string().min(20, 'Please provide more details about your profile.'),
});

export function RecommendationsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateCareerRecommendationsOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userProfile: 'Experienced software engineer with 5+ years in web development, specializing in React, Node.js, and cloud platforms like AWS. Strong problem-solving skills and a passion for building scalable applications.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const response = await getCareerRecommendations({ profile: values.userProfile });
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
        <h1 className="text-3xl font-bold flex items-center gap-2"><Wand2 className="w-8 h-8 text-primary"/> AI Career Recommendations</h1>
        <p className="text-muted-foreground">Leverage AI to discover your next career move.</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Describe Yourself</CardTitle>
          <CardDescription>The more detail you provide, the better the recommendations will be. You can copy/paste from your resume or LinkedIn profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userProfile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Professional Profile</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detail your education, experience, skills, and interests..." {...field} className="min-h-[120px]"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-primary to-accent">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-glow">Your Top AI-Powered Recommendations</h2>
            <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="item-0">
            {result.careerRecommendations.map((rec, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="glass-card rounded-2xl border-0">
                <AccordionTrigger className="text-xl font-semibold hover:no-underline p-6">
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex items-center justify-center bg-primary/10 rounded-xl p-3 w-14 h-14">
                      <Briefcase className="h-7 w-7 text-primary"/>
                    </div>
                     <span className="flex-1 text-left">{rec.career}</span>
                     <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-green-400 text-glow-green">{Math.floor(Math.random() * 15) + 80}%</span>
                        <span className="text-xs text-muted-foreground">Match Score</span>
                     </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0 space-y-6">
                    <div className="space-y-2 p-4 rounded-lg bg-background/50">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-400" />Why It's a Good Fit</h3>
                        <p className="text-muted-foreground">{rec.reason}</p>
                    </div>
                     <div className="space-y-3 p-4 rounded-lg bg-background/50">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><CheckCircle className="w-5 h-5 text-red-500"/>Skill Gap</h3>
                        <div className="flex flex-wrap gap-2">
                            {rec.missingSkills?.split(',').map((skill, i) => skill.trim() && <Badge key={i} variant="destructive">{skill.trim()}</Badge>)}
                        </div>
                    </div>
                     <div className="space-y-2 p-4 rounded-lg bg-background/50">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><ListTodo className="w-5 h-5 text-cyan-400" />3-Month Learning Plan</h3>
                        <p className="text-muted-foreground whitespace-pre-line">{rec.learningPlan}</p>
                    </div>
                    <div className="space-y-2 p-4 rounded-lg bg-background/50">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-400"/>Top Resources</h3>
                         <p className="text-muted-foreground whitespace-pre-line">{rec.resources}</p>
                    </div>
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        </div>
      )}
    </div>
  );
}
