import { Question } from '../types';

const API_URL = 'https://questions.aloc.com.ng/api/v2/q';
const ACCESS_TOKEN = 'ALOC-c30ed506ee19b2885ab8';

interface ApiResponse {
  subject: string;
  status: number;
  data: Question;
}

// Helper to fetch a single question
const fetchSingleQuestion = async (subject: string): Promise<Question | null> => {
  try {
    const response = await fetch(`${API_URL}?subject=${subject}`, {
      headers: {
        'AccessToken': ACCESS_TOKEN,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse = await response.json();
    if (data.status === 200) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching question for ${subject}:`, error);
    return null;
  }
};

// Fetch multiple questions for a subject with concurrency control
export const fetchQuestionsForSubject = async (
  subject: string, 
  count: number,
  onProgress?: (count: number) => void
): Promise<Question[]> => {
  const questions: Question[] = [];
  const seenIds = new Set<number>();
  const CONCURRENCY_LIMIT = 30; // Increased to 30 for maximum speed
  
  // Create chunks of work
  const chunks = [];
  for (let i = 0; i < count; i += CONCURRENCY_LIMIT) {
    chunks.push(Math.min(count - i, CONCURRENCY_LIMIT));
  }

  for (const chunkSize of chunks) {
    const promises = [];
    for (let i = 0; i < chunkSize; i++) {
      promises.push(fetchSingleQuestion(subject));
    }

    const results = await Promise.all(promises);
    
    results.forEach((q) => {
      if (q && !seenIds.has(q.id)) {
        seenIds.add(q.id);
        questions.push(q);
      }
    });

    if (onProgress) {
      onProgress(questions.length);
    }
  }
  
  return questions;
};
