import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    users: [
      {
        me: true
      }
    ],
    waiting: [],
}


const userSlice = createSlice({
  name: 'components',
  initialState,
  reducers: {
    retrieveUser(state, action) {
        state.users = action.payload
    },
    createUser(state, action) {
        state.users = state.users.concat([action.payload])
    },
    deleteUser(state, action) {
        state.users = state.users.filter(user => user.pk !== action.payload.pk)
    },
    updateUser(state, action) {
      state.users = state.users.map(user => user.pk === action.payload.pk ? action.payload : user)
    },
    createWaitingUser(state, action) {
      state.waiting = action.payload
      console.log(state.waiting)
    },
    deleteWaitingUser(state, action) {
        state.waiting = state.waiting.filter(user => user.pk !== action.payload.pk)
    },
  },
})

export const { retrieveUser, createUser, deleteUser, createWaitingUser, deleteWaitingUser, updateUser } = userSlice.actions
export default userSlice.reducer