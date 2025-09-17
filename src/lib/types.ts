import { z } from 'zod';

export const experienceSchema = z.object({
  title: z.string().min(1, 'Job title is required.'),
  company: z.string().min(1, 'Company name is required.'),
  startDate: z.string().min(1, 'Start date is required.'),
  endDate: z.string(),
  description: z.string(),
});

export const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required.'),
  degree: z.string().min(1, 'Degree is required.'),
  startDate: z.string().min(1, 'Start date is required.'),
  endDate: z.string(),
  description: z.string().optional(),
});

export const skillSchema = z.object({
  value: z.string().min(1, 'Skill cannot be empty.'),
});

export const userProfileSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  linkedin: z.string().url().or(z.literal('')),
  github: z.string().url().or(z.literal('')),
  summary: z.string().min(10, 'Summary should be at least 10 characters.'),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(skillSchema),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
