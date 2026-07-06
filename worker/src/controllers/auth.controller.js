import * as authService from '../services/auth.service.js';

export async function verify(req) {
  const { token } = req.body;
  if (!token) throw new Error('Token required');
  return authService.verify(token);
}