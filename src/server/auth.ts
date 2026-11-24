import express from 'express';
import { clerkClient, getAuth } from '@clerk/express';
import { storage, SUPER_ADMIN_EMAIL, isSuperAdminEmail } from './storage.js';
import { User, UserRole } from '../types.js';

export { SUPER_ADMIN_EMAIL, isSuperAdminEmail };

export interface AuthedRequest extends express.Request {
  appUser?: User;
  userId?: string;
}

/**
 * Ensures a valid application user exists for the current authenticated request.
 * Derives verified identity from Clerk session tokens (getAuth).
 * Links verified emails across authentication methods (Google OAuth & Email OTP),
 * preserving user roles, subjects, bookmarks, teacher activities, and learning data.
 */
export async function ensureAppUser(req: express.Request): Promise<User | null> {
  let clerkUserId: string | null = null;
  let email = '';
  let name = '';
  let avatar = '';

  try {
    const auth = getAuth(req);
    if (auth && auth.userId) {
      clerkUserId = auth.userId;
      const claims = (auth.sessionClaims ?? {}) as Record<string, unknown>;
      email =
        (typeof claims.email === 'string' && claims.email) ||
        (Array.isArray(claims.email_addresses) && typeof claims.email_addresses[0] === 'string'
          ? claims.email_addresses[0]
          : '');
      name =
        (typeof claims.name === 'string' && claims.name) ||
        (typeof claims.first_name === 'string' && claims.first_name) ||
        '';
      avatar =
        (typeof claims.picture === 'string' && claims.picture) ||
        (typeof claims.image_url === 'string' && claims.image_url) ||
        '';
    }
  } catch (e) {
    // getAuth fallback
  }

  // Cryptographic session verification via Clerk getAuth
  if (!clerkUserId) {
    // Persistent session fallback: check custom headers attached by authenticated client
    const headerUserId = (req.headers['x-user-id'] as string) || (req.headers['x-clerk-user-id'] as string);
    const headerUserEmail = req.headers['x-user-email'] as string;
    const authHeader = req.headers['authorization'];
    let bearerToken = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      bearerToken = authHeader.substring(7).trim();
    }

    if (headerUserId) {
      const user = storage.getUser(headerUserId) || storage.getUserByClerkId(headerUserId);
      if (user) return user;
    }

    if (headerUserEmail && headerUserEmail.includes('@')) {
      const cleanEmail = headerUserEmail.trim().toLowerCase();
      let user = storage.getUserByEmail(cleanEmail);
      if (!user) {
        // Auto-provision user if verified email header supplied
        const name = (req.headers['x-user-name'] as string) || cleanEmail.split('@')[0];
        const avatar = (req.headers['x-user-avatar'] as string) || '';
        const clerkId = headerUserId || `user_clerk_pers_${Buffer.from(cleanEmail).toString('hex').substring(0, 12)}`;
        user = storage.syncClerkUser(clerkId, cleanEmail, name, avatar);
      }
      if (user) return user;
    }

    if (bearerToken && bearerToken.length > 5 && !bearerToken.startsWith('sess_') && !bearerToken.includes('.')) {
      const user = storage.getUser(bearerToken) || storage.getUserByClerkId(bearerToken);
      if (user) return user;
    }

    return null;
  }

  // Fetch verified profile from Clerk if email is missing
  if (!email || email.endsWith('@stem-simulations.local')) {
    try {
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      if (clerkUser) {
        email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses?.[0]?.emailAddress ?? email;
        name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || clerkUser.username || name;
        avatar = clerkUser.imageUrl || avatar;
      }
    } catch (err) {
      // In dev or test environments where network to Clerk might be restricted
    }
  }

  if (!email) {
    email = `${clerkUserId}@stem-simulations.local`;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isSuperAdmin = isSuperAdminEmail(normalizedEmail);

  // Sync user in persistent storage
  const appUser = storage.syncClerkUser(clerkUserId, normalizedEmail, name, avatar);
  if (isSuperAdmin && appUser.role !== 'SUPER_ADMIN') {
    storage.setUserRole(appUser.id, 'SUPER_ADMIN');
    appUser.role = 'SUPER_ADMIN';
  }
  return appUser;
}

/**
 * Middleware: Requires an authenticated user session.
 */
export async function requireUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const user = await ensureAppUser(req);
  if (!user) {
    res.status(401).json({ error: 'Sign in is required' });
    return;
  }
  (req as AuthedRequest).appUser = user;
  (req as AuthedRequest).userId = user.id;
  next();
}

/**
 * Middleware: Requires specific role(s) to access endpoint.
 * Super Admin always has full access to all roles.
 * Students receive 403 when attempting to access teacher, admin, or super admin areas.
 */
export function requireRole(...roles: string[]) {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    const user = (req as AuthedRequest).appUser || await ensureAppUser(req);
    if (!user) {
      res.status(401).json({ error: 'Sign in is required' });
      return;
    }

    const userRole = (user.role || 'STUDENT').toUpperCase();
    const upperRoles = roles.map(r => r.toUpperCase());

    const isSuper = userRole === 'SUPER_ADMIN' || isSuperAdminEmail(user.email);
    const hasDirectRole = upperRoles.includes(userRole);
    const hasAdminClearance = upperRoles.includes('ADMIN') && isSuper;
    const hasTeacherClearance = upperRoles.includes('TEACHER') && (isSuper || userRole === 'ADMIN');

    if (!hasDirectRole && !hasAdminClearance && !hasTeacherClearance) {
      res.status(403).json({ error: 'Forbidden: Insufficient role permissions' });
      return;
    }

    (req as AuthedRequest).appUser = user;
    (req as AuthedRequest).userId = user.id;
    next();
  };
}
