'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, Target, Check, ListOrdered, ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getSkillGapAnalysis } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { SkillGapAnalysisOutput } from '@/ai/flows/perform-skill-gap-analysis';

const formSchema = z.object({
  userSkills: z.string().min(3, 'Please list at least one skill.'),
  targetRoleRequirements: z.string().min(3, 'Please list at least one requirement.'),
});

export function SkillGapPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SkillGapAnalysisOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userSkills: 'React, Node.js, JavaScript, HTML, CSS, Git',
      targetRoleRequirements: 'React, Redux, Node.js, TypeScript, GraphQL, Docker, Kubernetes, CI/CD',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const payload = {
      userSkills: values.userSkills.split(',').map(s => s.trim()),
      targetRoleRequirements: values.targetRoleRequirements.split(',').map(s => s.trim()),
    };
    const response = await getSkillGapAnalysis(payload);
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
        <h1 className="text-3xl font-bold flex items-center gap-2"><Target className="w-8 h-8 text-primary"/> Skill Gap Analysis</h1>
        <p className="text-muted-foreground">Analyze the gap between your skills and your target role.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Skills</CardTitle>
          <CardDescription>Separate skills with a comma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Skills</FormLabel>
                    <FormControl>
                      <Textarea placeholder="React, Node.js, Python..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetRoleRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Role Requirements</FormLabel>
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
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Skills
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analysis Results</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Check className="w-5 h-5 text-green-500"/>Overlapping Skills</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {result.overlappingSkills.map((skill, i) => <Badge key={i} variant="secondary">{skill}</Badge>)}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ArrowRight className="w-5 h-5 text-red-500"/>Missing Skills</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                         {result.missingSkills.map((skill, i) => <Badge key={i} variant="destructive">{skill}</Badge>)}
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ListOrdered className="w-5 h-5 text-blue-500"/>Suggested Learning Order</CardTitle>
                    <CardDescription>A recommended path to acquire the missing skills efficiently.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-4">
                        {result.suggestedLearningOrder.map((skill, i) => (
                            <li key={i} className="flex items-start">
                                <span className="flex items-center justify-center w-8 h-8 mr-4 font-bold text-primary bg-primary/10 rounded-full">{i + 1}</span>
                                <span className="pt-1 font-medium">{skill}</span>
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
