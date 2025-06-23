import { generateId } from 'ai';

// Use dynamic import to avoid bundling bcrypt-ts in Edge Runtime
function getBcryptFunctions() {
  try {
    // Only import bcrypt-ts in Node.js runtime, not Edge Runtime
    if (typeof process !== 'undefined' && process.versions?.node) {
      const bcrypt = require('bcrypt-ts');
      return {
        genSaltSync: bcrypt.genSaltSync,
        hashSync: bcrypt.hashSync
      };
    }
  } catch (error) {
    // Fallback for environments where bcrypt-ts is not available
  }
  
  // Simple fallback for Edge Runtime using Web Crypto API
  return {
    genSaltSync: (rounds: number) => {
      return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    },
    hashSync: (password: string, salt: string) => {
      // Simple hash for Edge Runtime - not cryptographically secure for production
      const combined = password + salt;
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16);
    }
  };
}

export function generateHashedPassword(password: string) {
  const { genSaltSync, hashSync } = getBcryptFunctions();
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return hash;
}

export function generateDummyPassword() {
  const password = generateId(12);
  const hashedPassword = generateHashedPassword(password);

  return hashedPassword;
}
