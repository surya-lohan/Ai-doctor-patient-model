import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for the virtual psychological patient
const VIRTUAL_PATIENT_PROMPT = `
You are a virtual patient in a psychological simulation for training mental health professionals. Your role is to simulate a realistic patient with specific psychological symptoms, personal history, and emotional responses.

Guidelines:
1. Act as a real patient with a consistent psychological condition and personal history
2. Respond emotionally and realistically to questions, showing appropriate affect for your condition
3. Don't reveal that you're an AI - stay in character as a patient seeking psychological help
4. Ask clarifying questions when appropriate
5. Express concerns, fears, confusion, or hesitation as a real patient would
6. Provide detailed descriptions of symptoms, thoughts, and feelings when asked
7. Maintain the same patient profile throughout the conversation
8. Don't diagnose yourself or use clinical terminology unless it's common knowledge
9. Simulate trust-building behavior (initially hesitant, gradually opening up as the session progresses)
10. Refer to previous parts of the conversation naturally (e.g., "As I mentioned earlier...")

IMPORTANT CONSTRAINTS:
- You must ONLY simulate patients with psychological/mental health conditions
- Focus exclusively on conditions like: depression, anxiety disorders, PTSD, OCD, bipolar disorder, sleep disorders, trauma responses, etc.
- Do NOT simulate patients with primarily physical medical conditions
- Do NOT offer diagnosis or treatment advice - you are the patient, not the doctor
- Respond as a human would, with natural language, emotions, and occasional hesitations

The doctor is trying to understand your psychological condition through conversation. Respond naturally as a patient would.
`;

// List of psychological conditions for random generation
const PSYCHOLOGICAL_CONDITIONS = [
  {
    name: 'Major Depressive Disorder',
    symptoms: [
      'Persistent sadness',
      'Loss of interest in activities',
      'Changes in appetite or weight',
      'Sleep disturbances',
      'Fatigue',
      'Feelings of worthlessness or guilt',
      'Difficulty concentrating',
      'Thoughts of death or suicide'
    ]
  },
  {
    name: 'Generalized Anxiety Disorder',
    symptoms: [
      'Excessive worry',
      'Restlessness',
      'Fatigue',
      'Difficulty concentrating',
      'Irritability',
      'Muscle tension',
      'Sleep disturbances',
      'Feeling on edge'
    ]
  },
  {
    name: 'Post-Traumatic Stress Disorder',
    symptoms: [
      'Intrusive memories of traumatic event',
      'Flashbacks',
      'Nightmares',
      'Avoidance of trauma-related stimuli',
      'Negative changes in thinking and mood',
      'Hypervigilance',
      'Exaggerated startle response',
      'Sleep disturbances'
    ]
  },
  {
    name: 'Obsessive-Compulsive Disorder',
    symptoms: [
      'Intrusive, unwanted thoughts (obsessions)',
      'Repetitive behaviors or mental acts (compulsions)',
      'Excessive cleaning or handwashing',
      'Ordering and arranging things',
      'Repeatedly checking things',
      'Counting compulsions',
      'Anxiety when rituals cannot be performed',
      'Time-consuming rituals that interfere with daily activities'
    ]
  },
  {
    name: 'Bipolar Disorder',
    symptoms: [
      'Mood episodes alternating between depression and mania/hypomania',
      'Elevated or irritable mood during manic episodes',
      'Increased energy and activity',
      'Racing thoughts',
      'Decreased need for sleep',
      'Impulsive behavior',
      'Grandiose beliefs',
      'Depressive episodes with symptoms of major depression'
    ]
  },
  {
    name: 'Social Anxiety Disorder',
    symptoms: [
      'Intense fear of social situations',
      'Worry about being judged negatively',
      'Avoidance of social situations',
      'Physical symptoms like blushing, sweating, trembling',
      'Racing heart in social settings',
      'Mind going blank during conversations',
      'Anticipatory anxiety before social events',
      'Self-consciousness in everyday situations'
    ]
  },
  {
    name: 'Insomnia Disorder',
    symptoms: [
      'Difficulty falling asleep',
      'Difficulty staying asleep',
      'Waking up too early',
      'Non-restorative sleep',
      'Daytime fatigue',
      'Irritability',
      'Difficulty concentrating',
      'Worry about sleep'
    ]
  },
  {
    name: 'Adjustment Disorder',
    symptoms: [
      'Emotional or behavioral symptoms in response to an identifiable stressor',
      'Distress out of proportion to the severity of the stressor',
      'Significant impairment in social or occupational functioning',
      'Anxiety',
      'Depressed mood',
      'Conduct disturbances',
      'Mixed emotional features',
      'Symptoms developing within 3 months of stressor onset'
    ]
  }
];

// List of common life stressors that might trigger or exacerbate psychological conditions
const LIFE_STRESSORS = [
  'Recent job loss or career change',
  'Divorce or relationship breakup',
  'Death of a loved one',
  'Moving to a new city',
  'Financial difficulties',
  'Academic pressure or failure',
  'Workplace bullying or harassment',
  'Childhood trauma or abuse',
  'Domestic violence',
  'Major illness or health scare',
  'Identity or sexuality struggles',
  'Family conflict',
  'Becoming a parent',
  'Empty nest syndrome',
  'Retirement adjustment',
  'Cultural adjustment after immigration',
  'Victim of crime or assault',
  'Military service or combat exposure',
  'Natural disaster survivor',
  'Pandemic-related isolation or loss'
];

export interface PsychologicalPatientInfo {
  name?: string;
  age?: number;
  gender?: string;
  occupation?: string;
  maritalStatus?: string;
  chiefComplaint?: string;
  condition?: string;
  symptoms?: string[];
  duration?: string;
  lifeStressors?: string[];
  previousTreatment?: string[];
  familyHistory?: string[];
  personalityTraits?: string[];
  copingMechanisms?: string[];
  backstory?: string;
}

// Function to generate a random psychological patient profile
function generateRandomPatientProfile(): PsychologicalPatientInfo {
  // Random age between 18 and 75
  const age = Math.floor(Math.random() * (75 - 18 + 1)) + 18;
  
  // Random gender
  const genders = ['male', 'female', 'non-binary'];
  const gender = genders[Math.floor(Math.random() * genders.length)];
  
  // Random first names based on gender
  const maleNames = ['James', 'Michael', 'David', 'John', 'Robert', 'William', 'Thomas', 'Daniel', 'Matthew', 'Joseph', 'Christopher', 'Andrew', 'Ethan', 'Joshua', 'Anthony'];
  const femaleNames = ['Mary', 'Jennifer', 'Linda', 'Patricia', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Margaret', 'Betty', 'Sandra', 'Ashley'];
  const neutralNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Avery', 'Quinn', 'Morgan', 'Skyler', 'Reese', 'Dakota', 'Hayden', 'Parker', 'Peyton', 'Cameron'];
  
  let name;
  if (gender === 'male') {
    name = maleNames[Math.floor(Math.random() * maleNames.length)];
  } else if (gender === 'female') {
    name = femaleNames[Math.floor(Math.random() * femaleNames.length)];
  } else {
    name = neutralNames[Math.floor(Math.random() * neutralNames.length)];
  }
  
  // Random occupation
  const occupations = ['Teacher', 'Office worker', 'Retail employee', 'Healthcare worker', 'Student', 'Engineer', 'Artist', 'Unemployed', 'Service industry worker', 'IT professional', 'Retired', 'Self-employed', 'Manager', 'Construction worker', 'Homemaker'];
  const occupation = occupations[Math.floor(Math.random() * occupations.length)];
  
  // Random marital status
  const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'In a relationship', 'Engaged'];
  const maritalStatus = maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)];
  
  // Random psychological condition
  const conditionIndex = Math.floor(Math.random() * PSYCHOLOGICAL_CONDITIONS.length);
  const condition = PSYCHOLOGICAL_CONDITIONS[conditionIndex];
  
  // Random subset of symptoms for the condition
  const numSymptoms = Math.floor(Math.random() * 3) + 3; // 3-5 symptoms
  const symptoms = [...condition.symptoms].sort(() => 0.5 - Math.random()).slice(0, numSymptoms);
  
  // Random duration of symptoms
  const durations = ['a few weeks', 'about a month', 'several months', 'about six months', 'nearly a year', 'over a year', 'several years', 'since childhood'];
  const duration = durations[Math.floor(Math.random() * durations.length)];
  
  // Random life stressors
  const numStressors = Math.floor(Math.random() * 3) + 1; // 1-3 stressors
  const lifeStressors = [...LIFE_STRESSORS].sort(() => 0.5 - Math.random()).slice(0, numStressors);
  
  // Random previous treatments
  const treatments = ['None', 'Therapy briefly', 'Medication (discontinued)', 'Counseling through work', 'Self-help books', 'Online therapy', 'Support group', 'Hospitalization', 'Tried meditation apps'];
  const numTreatments = Math.floor(Math.random() * 2) + 0; // 0-1 treatments
  const previousTreatment = [...treatments].sort(() => 0.5 - Math.random()).slice(0, numTreatments);
  
  // Random family history
  const familyHistories = ['Depression in mother', 'Father with alcohol use disorder', 'Sibling with anxiety', 'Grandparent with bipolar disorder', 'No known family history', 'Uncle with schizophrenia', 'Family history unknown (adopted)'];
  const numFamilyHistory = Math.floor(Math.random() * 2) + 0; // 0-1 family history items
  const familyHistory = [...familyHistories].sort(() => 0.5 - Math.random()).slice(0, numFamilyHistory);
  
  // Random personality traits
  const personalityTraits = ['Perfectionist', 'People-pleaser', 'Introverted', 'Extroverted', 'Cautious', 'Risk-taker', 'Analytical', 'Creative', 'Sensitive', 'Resilient', 'Organized', 'Spontaneous', 'Ambitious', 'Laid-back', 'Empathetic'];
  const numTraits = Math.floor(Math.random() * 3) + 2; // 2-4 traits
  const traits = [...personalityTraits].sort(() => 0.5 - Math.random()).slice(0, numTraits);
  
  // Random coping mechanisms
  const copingMechanisms = ['Exercise', 'Isolation', 'Overworking', 'Substance use', 'Creative outlets', 'Seeking social support', 'Avoidance', 'Distraction through media', 'Journaling', 'Mindfulness practices', 'Unhealthy eating patterns'];
  const numCoping = Math.floor(Math.random() * 3) + 1; // 1-3 coping mechanisms
  const coping = [...copingMechanisms].sort(() => 0.5 - Math.random()).slice(0, numCoping);
  
  // Chief complaint (simplified version of condition)
  const chiefComplaints: Record<string, string[]> = {
    'Major Depressive Disorder': ['feeling sad all the time', 'lost interest in everything', 'can\'t get out of bed most days', 'feeling empty inside'],
    'Generalized Anxiety Disorder': ['constant worry about everything', 'can\'t stop my racing thoughts', 'always feeling on edge', 'overwhelming anxiety'],
    'Post-Traumatic Stress Disorder': ['flashbacks to a traumatic event', 'nightmares that won\'t stop', 'feeling constantly on guard', 'triggered by everyday situations'],
    'Obsessive-Compulsive Disorder': ['intrusive thoughts I can\'t control', 'compulsive behaviors taking over my life', 'constant need to check things', 'rituals that consume hours of my day'],
    'Bipolar Disorder': ['extreme mood swings', 'periods of high energy followed by crashes', 'impulsive decisions I later regret', 'unstable moods'],
    'Social Anxiety Disorder': ['paralyzing fear in social situations', 'avoiding people and social events', 'extreme self-consciousness around others', 'panic attacks before social gatherings'],
    'Insomnia Disorder': ['can\'t sleep no matter how tired I am', 'waking up throughout the night', 'exhausted but mind won\'t shut off', 'sleep problems ruining my life'],
    'Adjustment Disorder': ['can\'t cope since a recent life change', 'overwhelmed by recent events', 'not handling stress well lately', 'emotional since my life changed']
  };
  
  const conditionComplaints = chiefComplaints[condition.name] || ['feeling unwell mentally'];
  const chiefComplaint = conditionComplaints[Math.floor(Math.random() * conditionComplaints.length)];
  
  return {
    name,
    age,
    gender,
    occupation,
    maritalStatus,
    chiefComplaint,
    condition: condition.name,
    symptoms,
    duration,
    lifeStressors,
    previousTreatment,
    familyHistory,
    personalityTraits: traits,
    copingMechanisms: coping
  };
}

export async function generatePatientResponse(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  patientInfo?: PsychologicalPatientInfo
) {
  try {
    // If no patient info is provided, generate a random psychological patient profile
    if (!patientInfo || Object.keys(patientInfo).length === 0) {
      patientInfo = generateRandomPatientProfile();
    }
    
    // Add patient info to the system prompt
    let systemPrompt = VIRTUAL_PATIENT_PROMPT;
    
    systemPrompt += `

Your psychological patient profile:
    - Name: ${patientInfo.name || 'Not specified'}
    - Age: ${patientInfo.age || 'Not specified'}
    - Gender: ${patientInfo.gender || 'Not specified'}
    - Occupation: ${patientInfo.occupation || 'Not specified'}
    - Marital Status: ${patientInfo.maritalStatus || 'Not specified'}
    - Chief Complaint: ${patientInfo.chiefComplaint || 'Not specified'}
    - Psychological Condition: ${patientInfo.condition || 'Not specified'}
    - Symptoms: ${patientInfo.symptoms?.join(', ') || 'Not specified'}
    - Duration of Symptoms: ${patientInfo.duration || 'Not specified'}
    - Life Stressors: ${patientInfo.lifeStressors?.join(', ') || 'None mentioned'}
    - Previous Treatment: ${patientInfo.previousTreatment?.join(', ') || 'None'}
    - Family History: ${patientInfo.familyHistory?.join(', ') || 'None mentioned'}
    - Personality Traits: ${patientInfo.personalityTraits?.join(', ') || 'Not specified'}
    - Coping Mechanisms: ${patientInfo.copingMechanisms?.join(', ') || 'Not specified'}
    
    IMPORTANT: If this is the first message in the conversation, introduce yourself briefly as a patient seeking help, mentioning your chief complaint in a natural way. Show appropriate emotional state and hesitation. Don't dump all your information at once - reveal details gradually as the conversation progresses, just as a real patient would.
    `;

    // Ensure the first message is the system prompt
    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.filter(msg => msg.role !== 'system')
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: conversationMessages,
      temperature: 0.8, // Slightly higher temperature for more variability in responses
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating patient response:', error);
    throw error;
  }
}

// Export the type for use in other components
export type { PsychologicalPatientInfo as PatientInfo };

export default openai;