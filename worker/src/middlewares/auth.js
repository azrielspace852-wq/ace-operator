import admin from 'firebase-admin';

export async function authenticate(headers) {
  const authHeader = headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    throw new Error('Missing authorization token');
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}