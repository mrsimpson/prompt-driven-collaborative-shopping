import { LocalUserService } from '../../../services/user-service';
import { db } from '../../../stores/database';

// Mock the database
jest.mock('../../../stores/database', () => {
  return {
    db: {
      users: {
        where: jest.fn(),
      },
    },
  };
});

describe('UserService - login', () => {
  let service: LocalUserService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new LocalUserService();
  });
  
  it('should log in a user successfully', async () => {
    // Arrange
    const params = {
      email: 'test@example.com',
      password: 'Password123',
    };
    
    // Mock user found
    (db.users.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue({
            id: 'user-123',
            username: 'testuser',
            email: 'test@example.com',
          })
        })
      })
    });
    
    // Act
    const result = await service.login(params);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.id).toBe('user-123');
    expect(result.data?.username).toBe('testuser');
    expect(result.data?.email).toBe('test@example.com');
    expect(result.token).toBe('local-auth-token');
  });
  
  it('should return error for invalid email format', async () => {
    // Arrange
    const params = {
      email: 'invalid-email',
      password: 'Password123',
    };
    
    // Act
    const result = await service.login(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email address');
    expect(db.users.where).not.toHaveBeenCalled();
  });
  
  it('should return error if user is not found', async () => {
    // Arrange
    const params = {
      email: 'nonexistent@example.com',
      password: 'Password123',
    };
    
    // Mock user not found
    (db.users.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(null)
        })
      })
    });
    
    // Act
    const result = await service.login(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email or password');
  });
  
  it('should handle database errors gracefully', async () => {
    // Arrange
    const params = {
      email: 'test@example.com',
      password: 'Password123',
    };
    
    // Mock database error
    (db.users.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        and: jest.fn().mockRejectedValue(new Error('Database error'))
      })
    });
    
    // Act
    const result = await service.login(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
  });
});
