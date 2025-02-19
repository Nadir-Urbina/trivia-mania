import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId, useCdn } from '../env'

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
  
  return await client.fetch(query)
}

export function validateAnswer(question: Question, answer: string | boolean): boolean {
  switch (question.type) {
    case 'multipleChoice':
      return answer === question.correctAnswer
    case 'boolean':
      return answer === question.correctAnswer
    case 'text':
      const userAnswer = String(answer).toLowerCase().trim()
      const correctAnswer = question.correctAnswer.toLowerCase()
      const acceptableAnswers = question.acceptableAnswers?.map(a => a.toLowerCase()) || []
      return userAnswer === correctAnswer || acceptableAnswers.includes(userAnswer)
    default:
      return false
  }
}
