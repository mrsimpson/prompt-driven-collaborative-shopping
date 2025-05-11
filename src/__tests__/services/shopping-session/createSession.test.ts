import { LocalShoppingSessionService } from '../../../services/shopping-session-service';
import { ShoppingSessionStatus } from '../../../types/models';
import { db } from '../../../stores/database';

// Mock the database
jest.mock('../../../stores/database', () => {
  return {
    db: {
      shoppingSessions: {
        add: jest.fn(),
        get: jest.fn(),
        where: jest.fn(),
      },
      sessionLists: {
        add: jest.fn(),
      },
      shoppingLists: {
        get: jest.fn(),
        update: jest.fn(),
      },
    },
  };
});

describe('ShoppingSessionService - createSession', () => {
  let service: LocalShoppingSessionService;
  const mockUserId = 'user-123';
  const mockListId1 = 'list-123';
  const mockListId2 = 'list-456';
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new LocalShoppingSessionService();
    
    // Mock no active session
    (db.shoppingSessions.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(null)
        })
      })
    });
    
    // Mock shopping lists
    (db.shoppingLists.get as jest.Mock).mockImplementation((id) => {
      if (id === mockListId1) {
        return Promise.resolve({
          id: mockListId1,
          name: 'List 1',
          isLocked: false,
        });
      } else if (id === mockListId2) {
        return Promise.resolve({
          id: mockListId2,
          name: 'List 2',
          isLocked: false,
        });
      }
      return Promise.resolve(null);
    });
    
    // Mock session creation
    (db.shoppingSessions.add as jest.Mock).mockResolvedValue('session-123');
    (db.sessionLists.add as jest.Mock).mockResolvedValue('session-list-123');
    (db.shoppingLists.update as jest.Mock).mockResolvedValue(1);
    
    // Mock getting the created session
    (db.shoppingSessions.get as jest.Mock).mockResolvedValue({
      id: 'session-123',
      userId: mockUserId,
      startedAt: new Date(),
      status: ShoppingSessionStatus.ACTIVE,
    });
  });
  
  it('should create a shopping session successfully', async () => {
    // Arrange
    const params = {
      userId: mockUserId,
      listIds: [mockListId1, mockListId2],
    };
    
    // Act
    const result = await service.createSession(params);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.userId).toBe(mockUserId);
    expect(result.data?.status).toBe(ShoppingSessionStatus.ACTIVE);
    
    // Verify database calls
    expect(db.shoppingSessions.add).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockUserId,
      status: ShoppingSessionStatus.ACTIVE,
    }));
    
    // Verify lists were added to session and locked
    expect(db.sessionLists.add).toHaveBeenCalledTimes(2);
    expect(db.shoppingLists.update).toHaveBeenCalledTimes(2);
    expect(db.shoppingLists.update).toHaveBeenCalledWith(
      mockListId1,
      expect.objectContaining({ isLocked: true })
    );
    expect(db.shoppingLists.update).toHaveBeenCalledWith(
      mockListId2,
      expect.objectContaining({ isLocked: true })
    );
  });
  
  it('should return error if user already has an active session', async () => {
    // Arrange
    const params = {
      userId: mockUserId,
      listIds: [mockListId1],
    };
    
    // Mock existing active session
    (db.shoppingSessions.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue({
            id: 'existing-session',
            userId: mockUserId,
            status: ShoppingSessionStatus.ACTIVE,
          })
        })
      })
    });
    
    // Act
    const result = await service.createSession(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('User already has an active shopping session');
    expect(db.shoppingSessions.add).not.toHaveBeenCalled();
    expect(db.sessionLists.add).not.toHaveBeenCalled();
    expect(db.shoppingLists.update).not.toHaveBeenCalled();
  });
  
  it('should return error if a list is not found', async () => {
    // Arrange
    const params = {
      userId: mockUserId,
      listIds: [mockListId1, 'non-existent-list'],
    };
    
    // Mock list not found
    (db.shoppingLists.get as jest.Mock).mockImplementation((id) => {
      if (id === mockListId1) {
        return Promise.resolve({
          id: mockListId1,
          name: 'List 1',
          isLocked: false,
        });
      }
      return Promise.resolve(null);
    });
    
    // Act
    const result = await service.createSession(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('List with ID non-existent-list not found');
    expect(db.shoppingSessions.add).not.toHaveBeenCalled();
    expect(db.sessionLists.add).not.toHaveBeenCalled();
    expect(db.shoppingLists.update).not.toHaveBeenCalled();
  });
  
  it('should return error if a list is already locked', async () => {
    // Arrange
    const params = {
      userId: mockUserId,
      listIds: [mockListId1, mockListId2],
    };
    
    // Mock locked list
    (db.shoppingLists.get as jest.Mock).mockImplementation((id) => {
      if (id === mockListId1) {
        return Promise.resolve({
          id: mockListId1,
          name: 'List 1',
          isLocked: false,
        });
      } else if (id === mockListId2) {
        return Promise.resolve({
          id: mockListId2,
          name: 'List 2',
          isLocked: true, // Already locked
        });
      }
      return Promise.resolve(null);
    });
    
    // Act
    const result = await service.createSession(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe(`List with ID ${mockListId2} is already locked`);
    expect(db.shoppingSessions.add).not.toHaveBeenCalled();
    expect(db.sessionLists.add).not.toHaveBeenCalled();
    expect(db.shoppingLists.update).not.toHaveBeenCalled();
  });
  
  it('should handle database errors gracefully', async () => {
    // Arrange
    const params = {
      userId: mockUserId,
      listIds: [mockListId1],
    };
    
    // Mock database error
    (db.shoppingSessions.add as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    // Act
    const result = await service.createSession(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
    expect(db.sessionLists.add).not.toHaveBeenCalled();
    expect(db.shoppingLists.update).not.toHaveBeenCalled();
  });
});
