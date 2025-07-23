import OpenAI from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface QuestionTemplate {
  id: string;
  category: 'technical' | 'behavioral' | 'system_design' | 'leadership' | 'culture_fit';
  difficulty: 'easy' | 'medium' | 'hard';
  template: string;
  variables: string[];
  examples: string[];
}

// Question templates for different roles and categories
export const questionTemplates: Record<string, QuestionTemplate[]> = {
  'software_engineer': [
    {
      id: 'tech_algorithms',
      category: 'technical',
      difficulty: 'medium',
      template: 'Explain how you would implement {algorithm} and discuss its time complexity.',
      variables: ['algorithm'],
      examples: ['binary search', 'quicksort', 'depth-first search', 'dynamic programming']
    },
    {
      id: 'tech_debugging',
      category: 'technical',
      difficulty: 'medium',
      template: 'Describe a challenging bug you encountered while working with {technology} and how you resolved it.',
      variables: ['technology'],
      examples: ['React', 'Node.js', 'Python', 'databases', 'APIs']
    },
    {
      id: 'tech_architecture',
      category: 'technical',
      difficulty: 'hard',
      template: 'How would you design a {system} that can handle {requirement}?',
      variables: ['system', 'requirement'],
      examples: ['scalable web application', 'real-time chat system', 'e-commerce platform']
    },
    {
      id: 'behavioral_teamwork',
      category: 'behavioral',
      difficulty: 'medium',
      template: 'Tell me about a time when you had to work with a difficult team member on a {project_type} project.',
      variables: ['project_type'],
      examples: ['software development', 'cross-functional', 'high-pressure', 'innovative']
    },
    {
      id: 'behavioral_learning',
      category: 'behavioral',
      difficulty: 'easy',
      template: 'Describe a situation where you had to quickly learn {technology} for a project.',
      variables: ['technology'],
      examples: ['a new programming language', 'a new framework', 'a new tool', 'a new methodology']
    }
  ],
  'product_manager': [
    {
      id: 'pm_strategy',
      category: 'technical',
      difficulty: 'hard',
      template: 'How would you approach launching a new {product_type} in a competitive market?',
      variables: ['product_type'],
      examples: ['SaaS product', 'mobile app', 'enterprise solution', 'consumer platform']
    },
    {
      id: 'pm_prioritization',
      category: 'behavioral',
      difficulty: 'medium',
      template: 'Walk me through how you would prioritize features for a {product_type} with limited resources.',
      variables: ['product_type'],
      examples: ['MVP', 'existing product', 'enterprise product', 'consumer app']
    },
    {
      id: 'pm_metrics',
      category: 'technical',
      difficulty: 'medium',
      template: 'What key metrics would you track for a {product_type} and how would you measure success?',
      variables: ['product_type'],
      examples: ['social media platform', 'e-commerce site', 'B2B SaaS', 'mobile game']
    }
  ],
  'data_scientist': [
    {
      id: 'ds_ml_model',
      category: 'technical',
      difficulty: 'hard',
      template: 'Explain how you would build a {model_type} model for {use_case}.',
      variables: ['model_type', 'use_case'],
      examples: ['recommendation system', 'classification model', 'regression model', 'clustering model']
    },
    {
      id: 'ds_data_quality',
      category: 'technical',
      difficulty: 'medium',
      template: 'How would you handle data quality issues when working with {data_type}?',
      variables: ['data_type'],
      examples: ['user behavior data', 'financial data', 'sensor data', 'social media data']
    }
  ],
  'designer': [
    {
      id: 'design_process',
      category: 'behavioral',
      difficulty: 'medium',
      template: 'Walk me through your design process for creating a {design_type}.',
      variables: ['design_type'],
      examples: ['mobile app interface', 'website redesign', 'brand identity', 'user experience flow']
    },
    {
      id: 'design_critique',
      category: 'behavioral',
      difficulty: 'medium',
      template: 'How do you handle feedback and critique on your {design_type} work?',
      variables: ['design_type'],
      examples: ['UI designs', 'UX flows', 'visual designs', 'prototypes']
    }
  ]
};

// Default templates for any role
export const defaultTemplates: QuestionTemplate[] = [
  {
    id: 'general_behavioral',
    category: 'behavioral',
    difficulty: 'medium',
    template: 'Tell me about a time when you {scenario} and what you learned from it.',
    variables: ['scenario'],
    examples: ['faced a major challenge', 'had to lead a team', 'failed at something', 'innovated a solution']
  },
  {
    id: 'general_technical',
    category: 'technical',
    difficulty: 'medium',
    template: 'How do you stay updated with the latest trends and technologies in {field}?',
    variables: ['field'],
    examples: ['software development', 'product management', 'data science', 'design']
  },
  {
    id: 'general_culture',
    category: 'culture_fit',
    difficulty: 'easy',
    template: 'What motivates you in your work and how do you maintain that motivation?',
    variables: [],
    examples: []
  }
];

export async function generateQuestionsWithOpenAI(params: {
  role: string;
  experienceLevel: string;
  resumeText?: string;
  jobDescriptionText?: string;
  responseFormat: string;
}): Promise<any[]> {
  const { role, experienceLevel, resumeText, jobDescriptionText, responseFormat } = params;

  // Quick template for common roles to speed up response
  const quickTemplates: Record<string, any[]> = {
    'frontend': [
      { id: 1, type: 'technical', question: 'Explain the difference between React hooks and class components.', difficulty: 'medium' },
      { id: 2, type: 'technical', question: 'How would you optimize a slow-loading website?', difficulty: 'medium' },
      { id: 3, type: 'behavioral', question: 'Describe a challenging project you worked on and how you overcame obstacles.', difficulty: 'medium' },
      { id: 4, type: 'technical', question: 'What are the benefits of using TypeScript over JavaScript?', difficulty: 'easy' },
      { id: 5, type: 'behavioral', question: 'How do you stay updated with the latest frontend technologies?', difficulty: 'easy' }
    ],
    'software': [
      { id: 1, type: 'technical', question: 'Explain the difference between REST and GraphQL APIs.', difficulty: 'medium' },
      { id: 2, type: 'technical', question: 'How would you design a scalable microservices architecture?', difficulty: 'hard' },
      { id: 3, type: 'behavioral', question: 'Tell me about a time you had to debug a complex production issue.', difficulty: 'medium' },
      { id: 4, type: 'technical', question: 'What are the trade-offs between different database types?', difficulty: 'medium' },
      { id: 5, type: 'behavioral', question: 'How do you approach code reviews and ensure code quality?', difficulty: 'easy' }
    ],
    'product': [
      { id: 1, type: 'behavioral', question: 'Walk me through your product development process from ideation to launch.', difficulty: 'medium' },
      { id: 2, type: 'technical', question: 'How do you prioritize features for a product with limited resources?', difficulty: 'medium' },
      { id: 3, type: 'behavioral', question: 'Describe a time when you had to make a difficult product decision.', difficulty: 'medium' },
      { id: 4, type: 'technical', question: 'What metrics would you track for a SaaS product?', difficulty: 'easy' },
      { id: 5, type: 'behavioral', question: 'How do you handle conflicting stakeholder requirements?', difficulty: 'medium' }
    ]
  };

  // Check if we have a quick template for this role
  const roleLower = role.toLowerCase();
  for (const [templateKey, questions] of Object.entries(quickTemplates)) {
    if (roleLower.includes(templateKey)) {
      console.log('Using quick template for:', role);
      return questions;
    }
  }

  // Get relevant templates for the role
  const roleKey = getRoleKey(role);
  const templates = questionTemplates[roleKey] || defaultTemplates;

  // Create context for OpenAI
  const context = buildContext(role, experienceLevel, responseFormat, resumeText, jobDescriptionText);

  // Generate questions using OpenAI
  const prompt = buildPrompt(context, templates, responseFormat);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert interview question generator. Generate relevant, challenging, and role-specific interview questions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the response and return questions
    return parseQuestionsResponse(response);
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to template-based generation
    return generateQuestionsFromTemplates(templates, role, experienceLevel, responseFormat);
  }
}

function getRoleKey(role: string): string {
  const roleLower = role.toLowerCase();

  if (roleLower.includes('engineer') || roleLower.includes('developer') || roleLower.includes('programmer')) {
    return 'software_engineer';
  } else if (roleLower.includes('product') && roleLower.includes('manager')) {
    return 'product_manager';
  } else if (roleLower.includes('data') && (roleLower.includes('scientist') || roleLower.includes('analyst'))) {
    return 'data_scientist';
  } else if (roleLower.includes('designer') || roleLower.includes('design')) {
    return 'designer';
  }

  return 'software_engineer'; // default
}

function buildContext(role: string, experienceLevel: string, responseFormat: string, resumeText?: string, jobDescriptionText?: string): string {
  let context = `Role: ${role}\nExperience Level: ${experienceLevel}\nInterview Format: ${responseFormat}\n\n`;

  if (resumeText) {
    context += `Resume Context: ${resumeText.substring(0, 500)}...\n\n`;
  }

  if (jobDescriptionText) {
    context += `Job Description: ${jobDescriptionText.substring(0, 500)}...\n\n`;
  }

  return context;
}

function buildPrompt(context: string, templates: QuestionTemplate[], responseFormat: string): string {
  const questionCount = responseFormat === 'mixed' ? 10 : 8;

  return `
${context}

Generate ${questionCount} interview questions for this role and experience level. Use these guidelines:

1. Mix of technical and behavioral questions based on the format
2. Difficulty appropriate for ${context.match(/Experience Level: (\w+)/)?.[1]} level
3. Role-specific and relevant to the position
4. Include both general and specific questions
5. Vary the question types and difficulty

Return the questions in this exact JSON format:
[
  {
    "id": 1,
    "type": "technical|behavioral",
    "question": "The actual question text",
    "difficulty": "easy|medium|hard"
  }
]

Make sure the questions are challenging, relevant, and will help assess the candidate's skills and experience.
`;
}

function parseQuestionsResponse(response: string): any[] {
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const questions = JSON.parse(jsonMatch[0]);
    return questions.map((q: any, index: number) => ({
      id: index + 1,
      type: q.type || 'behavioral',
      question: q.question,
      difficulty: q.difficulty || 'medium'
    }));
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw error;
  }
}

function generateQuestionsFromTemplates(templates: QuestionTemplate[], role: string, experienceLevel: string, responseFormat: string): any[] {
  // Fallback to template-based generation
  const questions = [];
  const templateCount = responseFormat === 'mixed' ? 10 : 8;

  for (let i = 0; i < templateCount; i++) {
    const template = templates[i % templates.length];
    const question = generateQuestionFromTemplate(template, role, experienceLevel);
    questions.push({
      id: i + 1,
      type: template.category === 'technical' ? 'technical' : 'behavioral',
      question: question,
      difficulty: adjustDifficulty(template.difficulty, experienceLevel)
    });
  }

  return questions;
}

function generateQuestionFromTemplate(template: QuestionTemplate, role: string, experienceLevel: string): string {
  let question = template.template;

  // Replace variables with examples or role-specific content
  template.variables.forEach(variable => {
    const example = template.examples[Math.floor(Math.random() * template.examples.length)] || 'relevant technology';
    question = question.replace(`{${variable}}`, example);
  });

  return question;
}

function adjustDifficulty(baseDifficulty: string, experienceLevel: string): string {
  if (experienceLevel === 'entry') return 'easy';
  if (experienceLevel === 'senior') return 'hard';
  return baseDifficulty;
}