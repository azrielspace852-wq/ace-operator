import CONFIG from './config.js';

class State {
  constructor() {
    this._state = {
      user: null,
      token: null,
      isAuthenticated: false,
      currentPage: 'dashboard',
      theme: localStorage.getItem('theme') || 'dark'
    };
    this._listeners = {};
    this._loadFromStorage();
  }

  _loadFromStorage() {
    try {
      const token = localStorage.getItem('ace_ops_token');
      const user = JSON.parse(localStorage.getItem('ace_ops_user') || 'null');
      if (token && user) {
        this._state.token = token;
        this._state.user = user;
        this._state.isAuthenticated = true;
      }
    } catch (e) {}
  }

  _persist() {
    if (this._state.token) {
      localStorage.setItem('ace_ops_token', this._state.token);
    } else {
      localStorage.removeItem('ace_ops_token');
    }
    if (this._state.user) {
      localStorage.setItem('ace_ops_user', JSON.stringify(this._state.user));
    } else {
      localStorage.removeItem('ace_ops_user');
    }
  }

  get(key) { return this._state[key]; }
  
  set(key, value) {
    const old = this._state[key];
    this._state[key] = value;
    if (key === 'token' || key === 'user') {
      this._persist();
    }
    if (this._listeners[key]) {
      this._listeners[key].forEach(cb => cb(value, old));
    }
  }

  setUser(user) {
    this.set('user', user);
    this.set('isAuthenticated', !!user);
  }
  
  setToken(token) {
    this.set('token', token);
    this.set('isAuthenticated', !!token);
  }

  clearSession() {
    this.setToken(null);
    this.setUser(null);
    this.set('isAuthenticated', false);
    localStorage.removeItem('ace_ops_token');
    localStorage.removeItem('ace_ops_user');
  }

  subscribe(key, callback) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(callback);
    callback(this._state[key]);
    return () => this.unsubscribe(key, callback);
  }
  
  unsubscribe(key, callback) {
    if (this._listeners[key]) {
      this._listeners[key] = this._listeners[key].filter(cb => cb !== callback);
    }
  }
}

export const AppState = new State();
export default AppState;