'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirebase } from '@/hooks/use-auth';
import {
  fetchEnhancedProfile,
  saveEnhancedProfile,
  calculateAnalytics,
} from '@/lib/enhanced-profile-service';
import type { EnhancedUserProfile, Certification, Language } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Globe,
  Heart,
  Plus,
  Trash2,
  Save,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ProfileEditForm() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<EnhancedUserProfile>>({});

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user || !db) return;

    try {
      setLoading(true);
      const data = await fetchEnhancedProfile(db, user.uid);
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !db) return;

    try {
      setSaving(true);
      await saveEnhancedProfile(db, user.uid, profile);
      await calculateAnalytics(db, user.uid);

      toast({
        title: 'Success',
        description: 'Profile saved successfully!',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    setProfile({
      ...profile,
      experienceDetails: [
        ...(profile.experienceDetails || []),
        {
          role: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          achievements: [''],
          technologies: [],
        },
      ],
    });
  };

  const removeExperience = (index: number) => {
    const updated = [...(profile.experienceDetails || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, experienceDetails: updated });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...(profile.experienceDetails || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, experienceDetails: updated });
  };

  const addEducation = () => {
    setProfile({
      ...profile,
      educationDetails: [
        ...(profile.educationDetails || []),
        {
          degree: '',
          field: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          gpa: '',
          honors: [],
          coursework: [],
        },
      ],
    });
  };

  const removeEducation = (index: number) => {
    const updated = [...(profile.educationDetails || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, educationDetails: updated });
  };

  const updateEducation = (index: number, field: string, value: any) => {
    const updated = [...(profile.educationDetails || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, educationDetails: updated });
  };

  const addCertification = () => {
    setProfile({
      ...profile,
      certifications: [
        ...(profile.certifications || []),
        {
          id: Date.now().toString(),
          name: '',
          issuer: '',
          issueDate: '',
          credentialId: '',
          credentialUrl: '',
        },
      ],
    });
  };

  const removeCertification = (index: number) => {
    const updated = [...(profile.certifications || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, certifications: updated });
  };

  const updateCertification = (index: number, field: string, value: any) => {
    const updated = [...(profile.certifications || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, certifications: updated });
  };

  const addSkill = (skillName: string) => {
    if (!skillName.trim()) return;
    setProfile({
      ...profile,
      skills: [...(profile.skills || []), { name: skillName.trim() }],
    });
  };

  const removeSkill = (index: number) => {
    const updated = [...(profile.skills || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, skills: updated });
  };

  const addLanguage = () => {
    setProfile({
      ...profile,
      languages: [
        ...(profile.languages || []),
        { name: '', proficiency: 'Professional' },
      ],
    });
  };

  const removeLanguage = (index: number) => {
    const updated = [...(profile.languages || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, languages: updated });
  };

  const updateLanguage = (index: number, field: string, value: any) => {
    const updated = [...(profile.languages || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, languages: updated });
  };

  const addInterest = (interest: string) => {
    if (!interest.trim()) return;
    setProfile({
      ...profile,
      interests: [...(profile.interests || []), interest.trim()],
    });
  };

  const removeInterest = (index: number) => {
    const updated = [...(profile.interests || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, interests: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Your Profile</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="basic">
            <User className="w-4 h-4 mr-2" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="experience">
            <Briefcase className="w-4 h-4 mr-2" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="education">
            <GraduationCap className="w-4 h-4 mr-2" />
            Education
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Code className="w-4 h-4 mr-2" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="certifications">
            <Award className="w-4 h-4 mr-2" />
            Certs
          </TabsTrigger>
          <TabsTrigger value="more">
            <Heart className="w-4 h-4 mr-2" />
            More
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-4">Basic Information</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={profile.email || user?.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="San Francisco, CA"
                />
              </div>

              <div>
                <Label>Title/Role</Label>
                <Input
                  value={profile.title || ''}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <Label>Website</Label>
                <Input
                  value={profile.website || ''}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <Label>LinkedIn</Label>
                <Input
                  value={profile.linkedin || ''}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <Label>GitHub</Label>
                <Input
                  value={profile.github || ''}
                  onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <Label>Twitter</Label>
                <Input
                  value={profile.twitter || ''}
                  onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                  placeholder="@username"
                />
              </div>
            </div>

            <div>
              <Label>Professional Summary</Label>
              <Textarea
                value={profile.summary || ''}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                placeholder="Write a brief summary about yourself..."
                rows={4}
              />
            </div>

            <div>
              <Label>Career Objective</Label>
              <Textarea
                value={profile.objective || ''}
                onChange={(e) => setProfile({ ...profile, objective: e.target.value })}
                placeholder="What are your career goals..."
                rows={3}
              />
            </div>
          </Card>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Work Experience</h2>
              <Button onClick={addExperience}>
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </div>

            {(profile.experienceDetails || []).map((exp, index) => (
              <Card key={index} className="p-4 space-y-3 bg-slate-50">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">Experience #{index + 1}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label>Job Title *</Label>
                    <Input
                      value={exp.role}
                      onChange={(e) =>
                        updateExperience(index, 'role', e.target.value)
                      }
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div>
                    <Label>Company *</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(index, 'company', e.target.value)
                      }
                      placeholder="Tech Corp"
                    />
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      value={exp.location || ''}
                      onChange={(e) =>
                        updateExperience(index, 'location', e.target.value)
                      }
                      placeholder="San Francisco, CA"
                    />
                  </div>

                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperience(index, 'startDate', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      value={exp.endDate || ''}
                      onChange={(e) =>
                        updateExperience(index, 'endDate', e.target.value)
                      }
                      disabled={exp.current}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) =>
                        updateExperience(index, 'current', e.target.checked)
                      }
                      className="w-4 h-4"
                    />
                    <Label>Currently working here</Label>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) =>
                      updateExperience(index, 'description', e.target.value)
                    }
                    placeholder="Describe your responsibilities..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Key Achievements (one per line)</Label>
                  <Textarea
                    value={exp.achievements.join('\n')}
                    onChange={(e) =>
                      updateExperience(
                        index,
                        'achievements',
                        e.target.value.split('\n')
                      )
                    }
                    placeholder="• Led development of..."
                    rows={3}
                  />
                </div>
              </Card>
            ))}
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Education</h2>
              <Button onClick={addEducation}>
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </div>

            {(profile.educationDetails || []).map((edu, index) => (
              <Card key={index} className="p-4 space-y-3 bg-slate-50">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">Education #{index + 1}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label>Degree *</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      placeholder="Bachelor of Science"
                    />
                  </div>

                  <div>
                    <Label>Field of Study *</Label>
                    <Input
                      value={edu.field}
                      onChange={(e) => updateEducation(index, 'field', e.target.value)}
                      placeholder="Computer Science"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Institution *</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(index, 'institution', e.target.value)
                      }
                      placeholder="Stanford University"
                    />
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      value={edu.location || ''}
                      onChange={(e) =>
                        updateEducation(index, 'location', e.target.value)
                      }
                      placeholder="Stanford, CA"
                    />
                  </div>

                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) =>
                        updateEducation(index, 'startDate', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      value={edu.endDate || ''}
                      onChange={(e) =>
                        updateEducation(index, 'endDate', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label>GPA</Label>
                    <Input
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                      placeholder="3.8/4.0"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-4">Skills</h2>

            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSkill((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(profile.skills || []).map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {skill.name}
                  <button
                    onClick={() => removeSkill(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Certifications</h2>
              <Button onClick={addCertification}>
                <Plus className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            </div>

            {(profile.certifications || []).map((cert, index) => (
              <Card key={index} className="p-4 space-y-3 bg-slate-50">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">
                    Certification #{index + 1}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label>Certification Name *</Label>
                    <Input
                      value={cert.name}
                      onChange={(e) =>
                        updateCertification(index, 'name', e.target.value)
                      }
                      placeholder="AWS Solutions Architect"
                    />
                  </div>

                  <div>
                    <Label>Issuing Organization *</Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) =>
                        updateCertification(index, 'issuer', e.target.value)
                      }
                      placeholder="Amazon Web Services"
                    />
                  </div>

                  <div>
                    <Label>Issue Date *</Label>
                    <Input
                      type="month"
                      value={cert.issueDate}
                      onChange={(e) =>
                        updateCertification(index, 'issueDate', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label>Credential ID</Label>
                    <Input
                      value={cert.credentialId || ''}
                      onChange={(e) =>
                        updateCertification(index, 'credentialId', e.target.value)
                      }
                      placeholder="ABC123XYZ"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Credential URL</Label>
                    <Input
                      value={cert.credentialUrl || ''}
                      onChange={(e) =>
                        updateCertification(index, 'credentialUrl', e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </Card>
            ))}
          </Card>
        </TabsContent>

        {/* More Tab */}
        <TabsContent value="more">
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Languages</h2>
              <Button onClick={addLanguage} className="mb-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Language
              </Button>

              {(profile.languages || []).map((lang, index) => (
                <div key={index} className="flex gap-3 mb-3">
                  <Input
                    value={lang.name}
                    onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                    placeholder="English"
                    className="flex-1"
                  />
                  <select
                    value={lang.proficiency}
                    onChange={(e) =>
                      updateLanguage(index, 'proficiency', e.target.value)
                    }
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="Native">Native</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Professional">Professional</option>
                    <option value="Limited">Limited</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Interests</h2>
              <Input
                placeholder="Add an interest (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addInterest((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                className="mb-4"
              />

              <div className="flex flex-wrap gap-2">
                {(profile.interests || []).map((interest, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {interest}
                    <button
                      onClick={() => removeInterest(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
