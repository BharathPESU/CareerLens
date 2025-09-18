'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getResumeJson, getUserProfile } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResumePreview } from './resume-preview';
import type { UserProfile } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

export function ResumePage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [resumeData, setResumeData] = useState<any | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            const { data } = await getUserProfile(user.uid);
            if (data) {
                setUserProfile(data as UserProfile);
            }
        };

        fetchProfile();
    }, [user]);


    async function handleGenerateResume() {
        if (!userProfile) {
            toast({
                variant: "destructive",
                title: "Profile Not Found",
                description: "Please complete your profile before generating a resume.",
            });
            return;
        }

        setIsLoading(true);
        setResumeData(null);
        
        const inputForAI = {
            name: userProfile.name,
            email: userProfile.email,
            phone: "(123) 456-7890", // phone is not in the schema, adding placeholder
            linkedin: "linkedin.com/in/alexdoe", // not in schema
            github: "github.com/alexdoe", // not in schema
            summary: `A passionate professional with experience in various roles. Skilled in ${userProfile.skills.map(s => s.name).join(', ')}. Interested in ${userProfile.interests.join(', ')}.`,
            experience: userProfile.experience.map(exp => ({
                title: exp.role,
                company: exp.company,
                startDate: `approx. ${exp.years} years ago`,
                endDate: 'Present',
                description: `Key achievements in the role of ${exp.role} at ${exp.company}.`,
            })),
            education: userProfile.education.map(edu => ({
                institution: 'A Great University', // not in schema
                degree: `${edu.degree} in ${edu.field}`,
                startDate: 'Previous',
                endDate: edu.year,
                description: '',
            })),
            skills: userProfile.skills.map(skill => `${skill.name} (${skill.proficiency})`),
        };

        const response = await getResumeJson(inputForAI);
        setIsLoading(false);

        if (response.success && response.data?.resumeJson) {
            try {
                const parsedData = JSON.parse(response.data.resumeJson);
                setResumeData(parsedData);
                 toast({
                    title: "Success!",
                    description: "Your resume has been generated.",
                });
            } catch(e) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to parse the generated resume data.",
                });
            }
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
                <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="w-8 h-8 text-primary"/> AI Resume Builder</h1>
                <p className="text-muted-foreground">Generate a professional resume from your profile data.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Generate Your Resume</CardTitle>
                    <CardDescription>Click the button below to use the data from your profile to generate a new resume. Any unsaved changes on your profile page will not be included.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button onClick={handleGenerateResume} disabled={isLoading || !userProfile}>
                        {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                        ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Resume with AI
                        </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {resumeData && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Resume Preview</h2>
                    <ResumePreview data={resumeData} />
                </div>
            )}
        </div>
    );
}
