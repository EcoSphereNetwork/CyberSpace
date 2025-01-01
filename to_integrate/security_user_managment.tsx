// Converted to TypeScript with JSX
import React from 'react';
// security_user_management.js

/**
 * Security and User Management: Implements role-based access control (RBAC), plugin sandboxing, and network isolation.
 */

const roles = {
    admin: ['read', 'write', 'delete', 'manage_plugins', 'audit_logs', 'manage_users', 'access_sensitive_data'],
    user: ['read', 'write'],
    guest: ['read'],
  };
  
  const users = new Map(); // In-memory user registry
  const auditLogs = []; // Stores security and system logs
  const sessionTokens = new Map(); // Tracks user sessions for added security
  const failedLoginAttempts = new Map(); // Tracks failed login attempts to prevent brute force attacks
  
  /**
   * Registers a new user with a specified role.
   * @param {string} username - The username of the user.
   * @param {string} role - The role assigned to the user.
   */
  export export function registerUser(username, role) {
    if (!roles[role]) {
      throw new Error(`Invalid role: ${role}`);
    }
    users.set(username, { role, permissions: roles[role], activeSessions: 0, isLocked: false });
    logAudit(`User ${username} registered with role ${role}`);
  }
  
  /**
   * Lists all registered users.
   * @returns {Array} - An array of user objects.
   */
  export export function listUsers() {
    return Array.from(users.entries()).map(([username, data]) => ({ username, ...data }));
  }
  
  /**
   * Updates the role of an existing user.
   * @param {string} username - The username of the user.
   * @param {string} newRole - The new role to assign.
   */
  export export function updateUserRole(username, newRole) {
    const user = users.get(username);
    if (!user) {
      throw new Error(`User ${username} not found.`);
    }
    if (!roles[newRole]) {
      throw new Error(`Invalid role: ${newRole}`);
    }
    user.role = newRole;
    user.permissions = roles[newRole];
    logAudit(`User ${username} role updated to ${newRole}`);
  }
  
  /**
   * Deletes a user.
   * @param {string} username - The username of the user to delete.
   */
  export export function deleteUser(username) {
    if (!users.has(username)) {
      throw new Error(`User ${username} not found.`);
    }
    users.delete(username);
    logAudit(`User ${username} deleted.`);
  }
  
  /**
   * Locks a user account after multiple failed login attempts.
   * @param {string} username - The username to lock.
   */
  export export function lockUser(username) {
    const user = users.get(username);
    if (!user) {
      logAudit(`Failed to lock unknown user: ${username}`, 'error');
      return;
    }
    user.isLocked = true;
    logAudit(`User account locked: ${username}`, 'warning');
  }
  
  /**
   * Handles failed login attempts and locks the account if necessary.
   * @param {string} username - The username for the failed login attempt.
   */
  export export function handleFailedLogin(username) {
    const attempts = failedLoginAttempts.get(username) || 0;
    failedLoginAttempts.set(username, attempts + 1);
  
    if (attempts + 1 >= 3) {
      lockUser(username);
      failedLoginAttempts.delete(username);
    } else {
      logAudit(`Failed login attempt for user: ${username}`, 'warning');
    }
  }
  
  /**
   * Checks if a user has permission for a specific action.
   * @param {string} username - The username of the user.
   * @param {string} action - The action to check.
   * @returns {boolean} - True if the user has permission, false otherwise.
   */
  export export function hasPermission(username, action) {
    const user = users.get(username);
    if (!user) {
      logAudit(`Permission check failed for unknown user: ${username}`, 'error');
      return false;
    }
    if (user.isLocked) {
      logAudit(`Permission check denied for locked user: ${username}`, 'error');
      return false;
    }
    const allowed = user.permissions.includes(action);
    logAudit(`Permission check for ${username}: ${action} - ${allowed ? 'Allowed' : 'Denied'}`);
    return allowed;
  }
  
  /**
   * Logs an action in the audit logs.
   * @param {string} message - The log message.
   * @param {string} level - The severity level ('info', 'warning', 'error'). Default is 'info'.
   */
  export export function logAudit(message, level = 'info') {
    const timestamp = new Date().toISOString();
    auditLogs.push({ timestamp, level, message });
    console.log(`[${level.toUpperCase()}] ${timestamp}: ${message}`);
  }
  
  /**
   * Retrieves the audit logs.
   * @returns {Array} - Array of audit log entries.
   */
  export export function getAuditLogs() {
    return auditLogs;
  }
  
  /**
   * Implements rate limiting to prevent abuse of sensitive operations.
   * @param {Function} fn - The export function to rate limit.
   * @param {number} limit - The maximum number of calls allowed.
   * @param {number} interval - The time window in milliseconds.
   * @returns {Function} - A rate-limited version of the input function.
   */
  export export function rateLimit(fn, limit, interval) {
    const calls = [];
  
    return (...args) => {
      const now = Date.now();
      calls.push(now);
      while (calls.length > 0 && calls[0] <= now - interval) {
        calls.shift();
      }
  
      if (calls.length > limit) {
        logAudit('Rate limit exceeded', 'warning');
        throw new Error('Rate limit exceeded');
      }
  
      return fn(...args);
    };
  }
  
  /**
   * Generates a session token for a user.
   * @param {string} username - The username to generate the token for.
   * @returns {string} - The session token.
   */
  export export function generateSessionToken(username) {
    const user = users.get(username);
    if (!user) {
      logAudit(`Session generation failed for unknown user: ${username}`, 'error');
      throw new Error(`User ${username} not found.`);
    }
    if (user.isLocked) {
      logAudit(`Session generation denied for locked user: ${username}`, 'error');
      throw new Error(`User account is locked: ${username}`);
    }
    const token = `${username}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionTokens.set(token, username);
    user.activeSessions += 1;
    logAudit(`Session token generated for user: ${username}`);
    return token;
  }
  
  /**
   * Revokes a session token.
   * @param {string} token - The session token to revoke.
   */
  export export function revokeSessionToken(token) {
    const username = sessionTokens.get(token);
    if (!username) {
      logAudit(`Session token not found: ${token}`, 'error');
      return;
    }
    sessionTokens.delete(token);
    const user = users.get(username);
    if (user) {
      user.activeSessions -= 1;
      logAudit(`Session token revoked for user: ${username}`);
    }
  }
  
  /** Example Usage */
  try {
    registerUser('Alice', 'admin');
    registerUser('Bob', 'user');
  
    handleFailedLogin('Bob');
    handleFailedLogin('Bob');
    handleFailedLogin('Bob'); // Bob's account will be locked
  
    const tokenAlice = generateSessionToken('Alice');
    console.log('Alice session token valid:', validateSessionToken(tokenAlice));
    revokeSessionToken(tokenAlice);
  
    const sensitiveData = 'This is a secret';
    const encrypted = encryptData(sensitiveData);
    const decrypted = decryptData(encrypted);
    console.log('Encrypted:', encrypted);
    console.log('Decrypted:', decrypted);
  
    console.log('Audit Logs:', getAuditLogs());
  } catch (error) {
    console.error(error);
  }
  
