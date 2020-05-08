// import axios from 'axios'
import jwtDecode from 'jwt-decode'
import gql from 'graphql-tag'

const directives = process.env.STANDALONE ? '@client' : ''

const state = {
  authStatus: '',
  authToken: null,
  user: null
}

const getters = {
  authStatus: (state) => {
    return state.authStatus
  },
  isLoggedIn: (state) => {
    if (localStorage.getItem('user') !== null) {
      state.authStatus = 'success'
    }
    return state.authStatus === 'success'
  },
  authToken: (state) => {
    return state.authToken
  },
  user: (state) => {
    return state.user
  }
}

const actions = {
  login: (info, data) => {
    const { commit, rootState } = info
    console.log(info)
    commit('login') // show spinner
    return new Promise(resolve => {
      rootState.apolloProvider.defaultClient.mutate({
        // Query
        mutation: gql`
          mutation ($data: LoginInput!) {
            login(data: $data) ${directives} {
              token
            }
          }`,
        // Parameters
        variables: {
          data
        }
      }).then((data) => {
        // console.log('login success')
        console.log(data)
        state.authStatus = 'success'
        commit('loginSuccess', data.data.login)
        resolve()
      })
    })
  },
  logout: ({ commit }) => {
    commit('logout')
  }
}

const mutations = {
  login: (state) => {
    state.authStatus = 'pending'
  },
  loginSuccess: (state, data) => {
    console.log('login success')
    if (process.env.STANDALONE) {
      state.authStatus = 'success'
      return
    }
    const token = data.token
    state.authToken = token
    localStorage.setItem('user-token', token)
    console.log('Token', token)

    const user = jwtDecode(token)
    state.user = user
    localStorage.setItem('user', user)
    console.log('User', user)

    state.authStatus = 'success'
  },
  logout: (state) => {
    console.log('logout')
    state.authStatus = ''
    state.authToken = null
    state.user = null
    localStorage.removeItem('user')
    localStorage.removeItem('user-token')
  }
}
export default {
  state,
  getters,
  mutations,
  actions
}
