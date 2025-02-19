import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'question',
  title: 'Trivia Question',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'text',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'type',
      title: 'Question Type',
      type: 'string',
      options: {
        list: [
          { title: 'Multiple Choice', value: 'multipleChoice' },
          { title: 'True/False', value: 'boolean' },
          { title: 'Text Input', value: 'text' }
        ]
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'answers',
      title: 'Answer Options',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ document }) => document?.type !== 'multipleChoice',
      validation: (Rule) => Rule.custom((answers, context) => {
        if (context.document?.type === 'multipleChoice') {
          return (answers || []).length >= 2 ? true : 'Multiple choice questions need at least 2 answers'
        }
        return true
      })
    }),
    defineField({
      name: 'correctAnswer',
      title: 'Correct Answer',
      type: 'string',
      hidden: ({ document }) => document?.type === 'boolean',
      validation: (Rule) => Rule.custom((correctAnswer, context) => {
        if (context.document?.type === 'multipleChoice') {
          const answers = (context.document?.answers || []) as string[]
          return answers.includes(correctAnswer || '') 
            ? true 
            : 'Correct answer must be one of the provided options'
        }
        return true
      })
    }),
    defineField({
      name: 'correctBooleanAnswer',
      title: 'Correct Answer',
      type: 'boolean',
      hidden: ({ document }) => document?.type !== 'boolean'
    }),
    defineField({
      name: 'acceptableAnswers',
      title: 'Alternative Correct Answers',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Additional acceptable answers for text input questions',
      hidden: ({ document }) => document?.type !== 'text'
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Asphalt Technology', value: 'Asphalt Technology' },
          { title: 'Company Knowledge', value: 'Company Knowledge' },
          { title: 'Industry Facts', value: 'Industry Facts' },
          { title: 'General Knowledge', value: 'General Knowledge' }
        ]
      }
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty Level',
      type: 'string',
      options: {
        list: [
          { title: 'Easy', value: 'Easy' },
          { title: 'Medium', value: 'Medium' },
          { title: 'Hard', value: 'Hard' }
        ]
      },
      validation: (Rule) => Rule.required()
    })
  ],
  preview: {
    select: {
      title: 'question'
    }
  }
}) 