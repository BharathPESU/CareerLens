import { UserProfile } from './types';

export const defaultProfileData: UserProfile = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  phone: '123-456-7890',
  linkedin: 'https://linkedin.com/in/alexdoe',
  github: 'https://github.com/alexdoe',
  summary:
    'Innovative and deadline-driven Software Engineer with 5+ years of experience designing and developing user-centered digital products from initial concept to final, polished deliverable. Proficient in a range of modern technologies including React, Node.js, and cloud services.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      startDate: 'Jan 2021',
      endDate: 'Present',
      description:
        '- Led a team of 4 developers in the creation of a new client-facing analytics dashboard using React and D3.js, resulting in a 20% increase in user engagement.\n- Architected and implemented a scalable microservices-based backend with Node.js and Express, improving system reliability by 30%.\n- Mentored junior engineers, providing code reviews and guidance on best practices.',
    },
    {
      title: 'Software Engineer',
      company: 'Digital Innovations LLC',
      startDate: 'Jun 2018',
      endDate: 'Dec 2020',
      description:
        '- Developed and maintained front-end features for a large-scale e-commerce platform using Angular.\n- Collaborated with UX/UI designers to translate wireframes and mockups into responsive, interactive web pages.\n- Contributed to the migration of legacy code to a modern component-based architecture.',
    },
  ],
  education: [
    {
      institution: 'State University',
      degree: 'Bachelor of Science in Computer Science',
      startDate: 'Sep 2014',
      endDate: 'May 2018',
      description: 'Graduated with Honors. Relevant coursework: Data Structures, Algorithms, Web Development, Database Systems.',
    },
  ],
  skills: [
    { value: 'JavaScript' },
    { value: 'TypeScript' },
    { value: 'React' },
    { value: 'Node.js' },
    { value: 'Express.js' },
    { value: 'Python' },
    { value: 'SQL' },
    { value: 'NoSQL' },
    { value: 'Docker' },
    { value: 'AWS' },
    { value: 'Agile Methodologies' },
    { value: 'Team Leadership' },
  ],
};
