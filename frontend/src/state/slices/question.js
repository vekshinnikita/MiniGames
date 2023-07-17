import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    question: '',
    answers: [],
    id: 0,
    answered: [],
    
    nextQuestion: '',
    nextAnswers: [],
    nextId: 0,
    nextIsEnd: false,
}

const questionSlice = createSlice({
  name: 'components',
  initialState,
  reducers: {
    setQuestion(state, action) {
        state.question = action.payload.question
        state.isEnd = action.payload.is_end
        state.answers = action.payload.answers
        state.id = action.payload.id
    },
    ChangeQuestions(state) {
      state.question = state.nextQuestion
      state.answers = state.nextAnswers
      state.isEnd = state.nextIsEnd
      state.id = state.nextId
    },
    setNextQuestion(state, action) {
      state.nextQuestion = action.payload.question
      state.nextIsEnd = action.payload.is_end
      state.nextAnswers = action.payload.answers
      state.nextId = action.payload.id
    },
    setCorrectAnswer(state, action) {
      if(action.payload){
        state.answered = action.payload
      }
    },
  },
})

export const { setQuestion, setCorrectAnswer, ChangeQuestions, setNextQuestion } = questionSlice.actions
export default questionSlice.reducer