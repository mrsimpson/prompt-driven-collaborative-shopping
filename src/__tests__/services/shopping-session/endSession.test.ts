import { LocalShoppingSessionService } from '../../../services/shopping-session-service';
import { ShoppingSessionStatus } from '../../../types/models';
import { db } from '../../../stores/database';
import { generateUUID } from '../../../utils/uuid';

// Mock the database
jest.mock('../../../stores/database', () => {
  return {
    db: {
      shoppingSessions: {
        get: jest.fn(),
        update: jest.fn(),
      },
      sessionLists: {
        where: jest.fn(),
        add: jest.fn(),
      },
      shoppingLists: {
        add: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
      },
      listOwners: {
        add: jest.fn(),
      },
      listItems: {
        where: jest.fn(),
        add: jest.fn(),
        update: jest.fn(),
      },
    },
  };
});

describe('ShoppingSessionService - endSession', () => {
  let service: LocalShoppingSessionService;
  const mockSessionId = 'session-123';
  const mockUserId = 'user-123';
  const mockListId1 = 'list-123';
  const mockListId2 = 'list-456';
  const mockNewListId = 'new-list-789';
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new LocalShoppingSessionService();
    
    // Mock active session
    (db.shoppingSessions.get as jest.Mock).mockResolvedValue({
      id: mockSessionId,
      userId: mockUserId,
      status: ShoppingSessionStatus.ACTIVE,
    });
    
    // Mock session lists
    (db.sessionLists.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { sessionId: mockSessionId, listId: mockListId1 },
            { sessionId: mockSessionId, listId: mockListId2 },
          ])
        })
      })
    });
    
    // Mock shopping lists
    (db.shoppingLists.get as jest.Mock).mockImplementation((id) => {
      if (id === mockListId1) {
        return Promise.resolve({
          id: mockListId1,
          name: 'List 1',
          isLocked: true,
        });
      } else if (id === mockListId2) {
        return Promise.resolve({
          id: mockListId2,
          name: 'List 2',
          isLocked: true,
        });
      } else if (id === mockNewListId) {
        return Promise.resolve({
          id: mockNewListId,
          name: 'Unpurchased Items',
          isLocked: false,
        });
      }
      return Promise.resolve(null);
    });
    
    // Mock list items
    (db.listItems.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { id: 'item-1', listId: mockListId1, name: 'Milk', isPurchased: true },
            { id: 'item-2', listId: mockListId1, name: 'Bread', isPurchased: false },
            { id: 'item-3', listId: mockListId2, name: 'Eggs', isPurchased: true },
            { id: 'item-4', listId: mockListId2, name: 'Cheese', isPurchased: false },
          ])
        })
      })
    });
    
    // Mock creating new list
    (db.shoppingLists.add as jest.Mock).mockResolvedValue(mockNewListId);
    (db.listOwners.add as jest.Mock).mockResolvedValue('owner-123');
    (db.listItems.add as jest.Mock).mockResolvedValue('new-item-id');
    
    // Mock updating session and lists
    (db.shoppingSessions.update as jest.Mock).mockResolvedValue(1);
    (db.shoppingLists.update as jest.Mock).mockResolvedValue(1);
    (db.listItems.update as jest.Mock).mockResolvedValue(1);
    
    // Mock UUID generation
    (generateUUID as jest.Mock).mockReturnValue('test-uuid');
  });
  
  it('should end a shopping session successfully', async () => {
    // Arrange
    const params = {
      sessionId: mockSessionId,
      status: ShoppingSessionStatus.COMPLETED,
    };
    
    // Act
    const result = await service.endSession(params);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.status).toBe(ShoppingSessionStatus.COMPLETED);
    
    // Verify lists were unlocked
    expect(db.shoppingLists.update).toHaveBeenCalledWith(
      mockListId1,
      expect.objectContaining({ isLocked: false })
    );
    expect(db.shoppingLists.update).toHaveBeenCalledWith(
      mockListId2,
      expect.objectContaining({ isLocked: false })
    );
    
    // Verify session was updated
    expect(db.shoppingSessions.update).toHaveBeenCalledWith(
      mockSessionId,
      expect.objectContaining({
        status: ShoppingSessionStatus.COMPLETED,
        endedAt: expect.any(Date),
      })
    );
  });
  
  it('should create a new list for unpurchased items when requested', async () => {
    // Arrange
    const params = {
      sessionId: mockSessionId,
      status: ShoppingSessionStatus.COMPLETED,
      createNewListForUnpurchased: true,
      newListName: 'Unpurchased Items',
    };
    
    // Act
    const result = await service.endSession(params);
    
    // Assert
    expect(result.success).toBe(true);
    
    // Verify new list was created
    expect(db.shoppingLists.add).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Unpurchased Items',
      description: 'Unpurchased items from previous shopping session',
      createdBy: mockUserId,
      isShared: false,
      isLocked: false,
    }));
    
    // Verify user was made owner of the new list
    expect(db.listOwners.add).toHaveBeenCalledWith(expect.objectContaining({
      listId: mockNewListId,
      userId: mockUserId,
    }));
    
    // Verify unpurchased items were moved to the new list
    expect(db.listItems.add).toHaveBeenCalledTimes(2); // Two unpurchased items
    
    // Verify original unpurchased items were soft deleted
    expect(db.listItems.update).toHaveBeenCalledWith(
      'item-2',
      expect.objectContaining({ deletedAt: expect.any(Date) })
    );
    expect(db.listItems.update).toHaveBeenCalledWith(
      'item-4',
      expect.objectContaining({ deletedAt: expect.any(Date) })
    );
  });
  
  it('should return error if session is not found', async () => {
    // Arrange
    const params = {
      sessionId: 'non-existent-session',
      status: ShoppingSessionStatus.COMPLETED,
    };
    
    // Mock session not found
    (db.shoppingSessions.get as jest.Mock).mockResolvedValue(null);
    
    // Act
    const result = await service.endSession(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Session not found');
    expect(db.shoppingLists.update).not.toHaveBeenCalled();
    expect(db.shoppingSessions.update).not.toHaveBeenCalled();
  });
  
  it('should return error if session is not active', async () => {
    // Arrange
    const params = {
      sessionId: mockSessionId,
      status: ShoppingSessionStatus.COMPLETED,
    };
    
    // Mock inactive session
    (db.shoppingSessions.get as jest.Mock).mockResolvedValue({
      id: mockSessionId,
      userId: mockUserId,
      status: ShoppingSessionStatus.COMPLETED, // Already completed
    });
    
    // Act
    const result = await service.endSession(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Session is not active');
    expect(db.shoppingLists.update).not.toHaveBeenCalled();
    expect(db.shoppingSessions.update).not.toHaveBeenCalled();
  });
  
  it('should handle database errors gracefully', async () => {
    // Arrange
    const params = {
      sessionId: mockSessionId,
      status: ShoppingSessionStatus.COMPLETED,
    };
    
    // Mock database error
    (db.shoppingSessions.update as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    // Act
    const result = await service.endSession(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
  });
});
