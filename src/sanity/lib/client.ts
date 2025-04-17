import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId, useCdn } from '../env'
import { Question, BooleanQuestion, MultipleChoiceQuestion, TextQuestion } from '../types/question'

export const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn,
})

export async function getQuestions() {
  const query = `*[_type == "question"] {
    _type,
    question,
    type,
    answers,
    correctAnswer,
    correctBooleanAnswer,
    acceptableAnswers,
    category,
    difficulty
  }`
  
  const questions = await client.fetch(query)
  
  // Transform the data to match the expected interfaces
  return questions.map((q: any) => {
    // If it's a boolean question, map correctBooleanAnswer to correctAnswer
    if (q.type === 'boolean' && q.correctBooleanAnswer) {
      q.correctAnswer = q.correctBooleanAnswer === 'true'
    }
    return q
  })
}

export function validateAnswer(question: Question, answer: string | boolean): boolean {
  switch (question.type) {
    case 'multipleChoice': {
      const mcQuestion = question as MultipleChoiceQuestion
      return answer === mcQuestion.correctAnswer
    }
    case 'boolean': {
      const boolQuestion = question as BooleanQuestion
      // Handle boolean questions differently because the stored value might be a string
      const correctBoolAnswer = typeof boolQuestion.correctAnswer === 'string' 
        ? boolQuestion.correctAnswer === 'true' 
        : boolQuestion.correctAnswer
      return answer === correctBoolAnswer
    }
    case 'text': {
      const textQuestion = question as TextQuestion
      const userAnswer = String(answer).toLowerCase().trim()
      const correctAnswer = String(textQuestion.correctAnswer).toLowerCase()
      const acceptableAnswers = textQuestion.acceptableAnswers?.map(a => a.toLowerCase()) || []
      return userAnswer === correctAnswer || acceptableAnswers.includes(userAnswer)
    }
    default:
      return false
  }
}
