export const CONFIG = {
  firebase: {
    apiKey: "AIzaSyBP_9ahQJQDLEYPxaOMhed3Hqo42aUpyak",
    authDomain: "azriel-web2.firebaseapp.com",
    projectId: "azriel-web2",
    storageBucket: "azriel-web2.firebasestorage.app",
    messagingSenderId: "61856199612",
    appId: "1:61856199612:web:9bd6f786857406a9b3f1b9"
  },
  API_BASE_URL: 'https://ace-ops-api.xxx.workers.dev', // GANTI NANTI SETELAH DEPLOY WORKER
  get API_URL() { return `${this.API_BASE_URL}/api/v1`; },
  endpoints: {
    auth: { verify: '/auth/verify' },
    user: { profile: '/user/profile' },
    instances: {
      list: '/instances',
      create: '/instances',
      update: (id) => `/instances/${id}`,
      delete: (id) => `/instances/${id}`
    },
    knowledge: {
      list: '/knowledge',
      create: '/knowledge',
      delete: (id) => `/knowledge/${id}`
    },
    users: {
      list: '/users',
      reset: (id) => `/users/${id}/reset`
    },
    playground: { chat: '/playground/chat' }
  }
};
export default CONFIG;