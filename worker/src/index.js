import admin from 'firebase-admin';
import { authenticate } from './middlewares/auth.js';
import * as authCtrl from './controllers/auth.controller.js';
import * as instanceCtrl from './controllers/instance.controller.js';
import * as knowledgeCtrl from './controllers/knowledge.controller.js';
import * as userCtrl from './controllers/user.controller.js';
import * as playgroundCtrl from './controllers/playground.controller.js';

let adminInitialized = false;

function success(data) {
  return { success: true, data };
}

function error(err, status = 500) {
  return {
    success: false,
    error: { code: status, message: err.message || 'Internal server error' },
  };
}

function matchRoute(path, pattern) {
  const pParts = pattern.split('/');
  const pathParts = path.split('/');
  if (pParts.length !== pathParts.length) return null;
  const params = {};
  for (let i = 0; i < pParts.length; i++) {
    if (pParts[i].startsWith(':')) {
      params[pParts[i].slice(1)] = pathParts[i];
    } else if (pParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

const routes = [
  { method: 'POST', path: '/api/v1/auth/verify', handler: authCtrl.verify, public: true },
  { method: 'GET', path: '/api/v1/instances', handler: instanceCtrl.list },
  { method: 'POST', path: '/api/v1/instances', handler: instanceCtrl.create },
  { method: 'PUT', path: '/api/v1/instances/:id', handler: instanceCtrl.update },
  { method: 'DELETE', path: '/api/v1/instances/:id', handler: instanceCtrl.deleteDoc },
  { method: 'GET', path: '/api/v1/knowledge', handler: knowledgeCtrl.list },
  { method: 'POST', path: '/api/v1/knowledge', handler: knowledgeCtrl.create },
  { method: 'DELETE', path: '/api/v1/knowledge/:id', handler: knowledgeCtrl.deleteDoc },
  { method: 'GET', path: '/api/v1/users', handler: userCtrl.list },
  { method: 'POST', path: '/api/v1/users/:id/reset', handler: userCtrl.reset },
  { method: 'POST', path: '/api/v1/playground/chat', handler: playgroundCtrl.chat },
  { method: 'GET', path: '/api/v1/user/profile', handler: userCtrl.profile },
];

export default {
  async fetch(request, env, ctx) {
    if (!adminInitialized) {
      const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      adminInitialized = true;
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
      });
    }

    let matched = null;
    let params = {};
    for (const route of routes) {
      if (route.method !== method) continue;
      const result = matchRoute(path, route.path);
      if (result !== null) {
        matched = route;
        params = result;
        break;
      }
    }

    if (!matched) {
      return new Response(JSON.stringify(error(new Error('Not Found'), 404)), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      let user = null;
      if (!matched.public) {
        user = await authenticate(request.headers);
      }

      let body = {};
      if (method === 'POST' || method === 'PUT') {
        try { body = await request.json(); } catch (_) { body = {}; }
      }

      const req = { body, params, headers: request.headers };
      const result = await matched.handler(req, user, params);

      return new Response(JSON.stringify(success(result)), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err) {
      console.error('API Error:', err);
      const statusCode =
        err.message.includes('token') || err.message.includes('Unauthorized') ? 401
        : err.message.includes('Kredit') ? 429
        : 500;

      return new Response(JSON.stringify(error(err, statusCode)), {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
};