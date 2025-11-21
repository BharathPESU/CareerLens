-- ========================================
-- CareerLens BigQuery Schema Definitions
-- ========================================

-- Dataset Creation
-- Run this first to create the dataset:
-- CREATE SCHEMA IF NOT EXISTS career_lens_data;

-- ========================================
-- Table 1: job_market_data
-- Purpose: Store job listings, required skills, and market trends
-- ========================================
CREATE TABLE IF NOT EXISTS `career_lens_data.job_market_data` (
  job_id STRING NOT NULL,
  job_role STRING NOT NULL,
  industry STRING NOT NULL,
  required_skills ARRAY<STRING>,
  trending_skills ARRAY<STRING>,
  average_salary INT64,
  salary_min INT64,
  salary_max INT64,
  region STRING,
  experience_level STRING,
  demand_score FLOAT64,
  ats_keywords ARRAY<STRING>,
  job_description STRING,
  company_size STRING,
  remote_friendly BOOL,
  updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY job_role, industry, region
OPTIONS(
  description="Job market data with skills, salaries, and demand metrics"
);

-- ========================================
-- Table 2: resume_keywords
-- Purpose: Store high-impact keywords for different roles
-- ========================================
CREATE TABLE IF NOT EXISTS `career_lens_data.resume_keywords` (
  keyword_id STRING NOT NULL,
  role STRING NOT NULL,
  industry STRING,
  high_impact_keywords ARRAY<STRING>,
  ats_keywords ARRAY<STRING>,
  soft_skills ARRAY<STRING>,
  technical_skills ARRAY<STRING>,
  action_verbs ARRAY<STRING>,
  certifications ARRAY<STRING>,
  keyword_weight FLOAT64,
  effectiveness_score FLOAT64,
  updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
CLUSTER BY role, industry
OPTIONS(
  description="High-impact resume keywords optimized for ATS systems"
);

-- ========================================
-- Table 3: career_insights
-- Purpose: Store career growth insights and recommendations
-- ========================================
CREATE TABLE IF NOT EXISTS `career_lens_data.career_insights` (
  insight_id STRING NOT NULL,
  domain STRING NOT NULL,
  future_opportunities ARRAY<STRING>,
  certifications ARRAY<STRING>,
  demand_score FLOAT64,
  growth_rate FLOAT64,
  avg_career_progression_years INT64,
  top_companies ARRAY<STRING>,
  emerging_technologies ARRAY<STRING>,
  skill_gap_analysis STRING,
  salary_growth_potential FLOAT64,
  job_openings_count INT64,
  geographic_hotspots ARRAY<STRING>,
  updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
CLUSTER BY domain
OPTIONS(
  description="Career insights and future opportunity recommendations"
);

-- ========================================
-- Sample Data Inserts (for testing)
-- ========================================

-- Sample job_market_data
INSERT INTO `career_lens_data.job_market_data` 
(job_id, job_role, industry, required_skills, trending_skills, average_salary, salary_min, salary_max, 
 region, experience_level, demand_score, ats_keywords, job_description, company_size, remote_friendly, updated_at)
VALUES 
(
  'job_001',
  'Full Stack Developer',
  'Technology',
  ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
  ['Next.js', 'GraphQL', 'Docker', 'Kubernetes', 'AI/ML Integration'],
  120000,
  90000,
  150000,
  'United States',
  'Mid-Level',
  8.5,
  ['React', 'Node.js', 'TypeScript', 'AWS', 'CI/CD', 'Agile'],
  'Seeking a Full Stack Developer proficient in modern web technologies...',
  'Enterprise',
  true,
  CURRENT_TIMESTAMP()
),
(
  'job_002',
  'Data Scientist',
  'Technology',
  ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics'],
  ['LLMs', 'Generative AI', 'MLOps', 'RAG', 'Vector Databases'],
  135000,
  100000,
  170000,
  'United States',
  'Senior',
  9.2,
  ['Python', 'ML', 'AI', 'Deep Learning', 'PyTorch', 'Data Analysis'],
  'Looking for experienced Data Scientist to lead AI initiatives...',
  'Enterprise',
  true,
  CURRENT_TIMESTAMP()
);

-- Sample resume_keywords
INSERT INTO `career_lens_data.resume_keywords`
(keyword_id, role, industry, high_impact_keywords, ats_keywords, soft_skills, 
 technical_skills, action_verbs, certifications, keyword_weight, effectiveness_score, updated_at)
VALUES
(
  'kw_001',
  'Full Stack Developer',
  'Technology',
  ['Full Stack Development', 'Cloud Architecture', 'Microservices', 'CI/CD Pipeline', 'System Design'],
  ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB', 'PostgreSQL', 'Docker'],
  ['Problem Solving', 'Team Collaboration', 'Communication', 'Agile Methodology'],
  ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js', 'GraphQL', 'REST API'],
  ['Developed', 'Architected', 'Implemented', 'Optimized', 'Deployed', 'Led'],
  ['AWS Certified Developer', 'Azure Fundamentals', 'MongoDB Certified'],
  0.95,
  9.1,
  CURRENT_TIMESTAMP()
),
(
  'kw_002',
  'Data Scientist',
  'Technology',
  ['Machine Learning', 'Predictive Modeling', 'Statistical Analysis', 'AI Solutions', 'Data Pipeline'],
  ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'SQL'],
  ['Analytical Thinking', 'Communication', 'Business Acumen', 'Research'],
  ['Python', 'R', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
  ['Analyzed', 'Modeled', 'Predicted', 'Researched', 'Implemented', 'Deployed'],
  ['TensorFlow Developer', 'AWS ML Specialty', 'Google Cloud ML Engineer'],
  0.98,
  9.5,
  CURRENT_TIMESTAMP()
);

-- Sample career_insights
INSERT INTO `career_lens_data.career_insights`
(insight_id, domain, future_opportunities, certifications, demand_score, growth_rate,
 avg_career_progression_years, top_companies, emerging_technologies, skill_gap_analysis,
 salary_growth_potential, job_openings_count, geographic_hotspots, updated_at)
VALUES
(
  'ins_001',
  'Full Stack Development',
  ['Cloud Architect', 'Engineering Manager', 'Technical Lead', 'DevOps Engineer'],
  ['AWS Solutions Architect', 'Kubernetes Administrator', 'Google Cloud Professional'],
  8.7,
  15.5,
  3,
  ['Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix'],
  ['AI Integration', 'Edge Computing', 'WebAssembly', 'Serverless', 'Web3'],
  'High demand for Next.js and TypeScript. Growing need for AI/ML integration skills.',
  25.5,
  45000,
  ['San Francisco', 'Seattle', 'New York', 'Austin', 'Remote'],
  CURRENT_TIMESTAMP()
),
(
  'ins_002',
  'Data Science',
  ['ML Engineer', 'AI Research Scientist', 'Data Engineering Lead', 'AI Product Manager'],
  ['TensorFlow Developer', 'AWS ML Specialty', 'Deep Learning Specialization'],
  9.4,
  22.3,
  2,
  ['OpenAI', 'Google DeepMind', 'Meta AI', 'Amazon AWS', 'Nvidia'],
  ['Generative AI', 'LLM Fine-tuning', 'RAG Systems', 'MLOps', 'Quantum ML'],
  'Critical need for LLM and Generative AI expertise. MLOps becoming essential.',
  32.8,
  52000,
  ['San Francisco', 'New York', 'Boston', 'Seattle', 'Remote'],
  CURRENT_TIMESTAMP()
);

-- ========================================
-- Useful Queries for the Application
-- ========================================

-- Get skills for a specific role
-- SELECT required_skills, trending_skills
-- FROM `career_lens_data.job_market_data`
-- WHERE job_role = 'Full Stack Developer'
-- ORDER BY demand_score DESC
-- LIMIT 10;

-- Get high-impact keywords for a role
-- SELECT high_impact_keywords, ats_keywords, action_verbs
-- FROM `career_lens_data.resume_keywords`
-- WHERE role = 'Data Scientist';

-- Get career insights for a domain
-- SELECT future_opportunities, certifications, emerging_technologies, demand_score
-- FROM `career_lens_data.career_insights`
-- WHERE domain = 'Data Science';

-- Get trending skills across industry
-- SELECT trending_skills, AVG(demand_score) as avg_demand
-- FROM `career_lens_data.job_market_data`
-- WHERE industry = 'Technology'
-- GROUP BY trending_skills
-- ORDER BY avg_demand DESC;
