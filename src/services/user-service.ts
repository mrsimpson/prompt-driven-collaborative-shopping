import { User } from '../types/models';
import { RegisterUserParams, LoginParams, AuthResult, Result } from '../types/operations';
import { db } from '../stores/database';
import { generateUUID } from '../utils/uuid';
import { isValidEmail, isValidUsername, isValidPassword } from '../utils/validation/validators';

/**
 * Service interface for user operations
 */
export interface UserService {
  register(params: RegisterUserParams): Promise<AuthResult>;
  login(params: LoginParams): Promise<AuthResult>;
  getCurrentUser(): Promise<Result<User | null>>;
  logout(): Promise<Result<void>>;
  getUser(userId: string): Promise<Result<User>>;
}

/**
 * Local implementation of the user service
 */
export class LocalUserService implements UserService {
  private currentUserId: string | null = null;

  /**
   * Register a new user
   * @param params Registration parameters
   * @returns Result with the registered user
   */
  async register(params: RegisterUserParams): Promise<AuthResult> {
    try {
      // Validate input
      if (!isValidUsername(params.username)) {
        return { success: false, error: 'Invalid username' };
      }
      
      if (!isValidEmail(params.email)) {
        return { success: false, error: 'Invalid email address' };
      }
      
      if (!isValidPassword(params.password)) {
        return { success: false, error: 'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number' };
      }
      
      // Check if email is already in use
      const existingUser = await db.users
        .where('email')
        .equals(params.email)
        .and(user => user.deletedAt === undefined)
        .first();
      
      if (existingUser) {
        return { success: false, error: 'Email address is already in use' };
      }
      
      // Create the user
      const now = new Date();
      const user: User = {
        id: generateUUID(),
        username: params.username,
        email: params.email,
        // In a real app, we would hash the password
        // For this local-first implementation, we're simulating authentication
        createdAt: now,
        updatedAt: now,
        lastModifiedAt: now
      };
      
      await db.users.add(user);
      
      // Set as current user
      this.currentUserId = user.id;
      
      return { 
        success: true, 
        data: user,
        token: 'local-auth-token' // Simulated token
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to register user' 
      };
    }
  }

  /**
   * Log in a user
   * @param params Login parameters
   * @returns Result with the logged-in user
   */
  async login(params: LoginParams): Promise<AuthResult> {
    try {
      // Validate input
      if (!isValidEmail(params.email)) {
        return { success: false, error: 'Invalid email address' };
      }
      
      // Find the user
      const user = await db.users
        .where('email')
        .equals(params.email)
        .and(user => user.deletedAt === undefined)
        .first();
      
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }
      
      // In a real app, we would verify the password hash
      // For this local-first implementation, we're simulating authentication
      
      // Set as current user
      this.currentUserId = user.id;
      
      return { 
        success: true, 
        data: user,
        token: 'local-auth-token' // Simulated token
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to log in' 
      };
    }
  }

  /**
   * Get the current logged-in user
   * @returns Result with the current user or null
   */
  async getCurrentUser(): Promise<Result<User | null>> {
    try {
      if (!this.currentUserId) {
        return { success: true, data: null };
      }
      
      const user = await db.users.get(this.currentUserId);
      
      if (!user || user.deletedAt) {
        this.currentUserId = null;
        return { success: true, data: null };
      }
      
      return { success: true, data: user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get current user' 
      };
    }
  }

  /**
   * Log out the current user
   * @returns Result indicating success
   */
  async logout(): Promise<Result<void>> {
    this.currentUserId = null;
    return { success: true };
  }

  /**
   * Get a user by ID
   * @param userId User ID
   * @returns Result with the user
   */
  async getUser(userId: string): Promise<Result<User>> {
    try {
      const user = await db.users.get(userId);
      
      if (!user || user.deletedAt) {
        return { success: false, error: 'User not found' };
      }
      
      return { success: true, data: user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get user' 
      };
    }
  }
}
