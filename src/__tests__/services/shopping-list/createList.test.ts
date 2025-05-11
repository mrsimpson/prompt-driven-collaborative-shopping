import { LocalShoppingListService } from '../../../services/shopping-list-service';
import { db } from '../../../stores/database';
import { generateUUID } from '../../../utils/uuid';

// Mock the database
jest.mock('../../../stores/database', () => {
  return {
    db: {
      shoppingLists: {
        add: jest.fn(),
        get: jest.fn(),
        where: jest.fn(),
        update: jest.fn(),
        put: jest.fn(),
      },
      listOwners: {
        add: jest.fn(),
        where: jest.fn(),
      },
    },
  };
});

// Mock the repository methods
jest.mock('../../../repositories/shopping-list-repository', () => {
  return {
    DexieShoppingListRepository: jest.fn().mockImplementation(() => {
      return {
        save: jest.fn().mockImplementation((list) => {
          return Promise.resolve({
            ...list,
            id: list.id || 'list-123',
          });
        }),
        findById: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
      };
    }),
  };
});

describe('ShoppingListService - createList', () => {
  let service: LocalShoppingListService;
  const mockUserId = 'user-123';
  const mockDate = new Date('2025-01-01T12:00:00Z');
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new LocalShoppingListService();
    
    // Mock the repository methods used by createList
    (db.shoppingLists.add as jest.Mock).mockResolvedValue('list-123');
    (db.shoppingLists.put as jest.Mock).mockResolvedValue('list-123');
    (db.listOwners.add as jest.Mock).mockResolvedValue('owner-123');
    
    // Mock generateUUID
    (generateUUID as jest.Mock).mockReturnValue('test-uuid');
  });
  
  it('should create a list successfully', async () => {
    // Arrange
    const params = {
      name: 'Grocery List',
      description: 'Weekly groceries',
      isShared: false,
    };
    
    // Act
    const result = await service.createList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe('Grocery List');
    expect(result.data?.description).toBe('Weekly groceries');
    expect(result.data?.createdBy).toBe(mockUserId);
    expect(result.data?.isShared).toBe(false);
    expect(result.data?.isLocked).toBe(false);
    
    // Verify database calls
    expect(db.listOwners.add).toHaveBeenCalledWith(expect.objectContaining({
      id: 'test-uuid',
      listId: expect.any(String),
      userId: mockUserId,
    }));
  });
  
  it('should create a shared list with community ID', async () => {
    // Arrange
    const params = {
      name: 'Family List',
      description: 'Family shopping',
      isShared: true,
      communityId: 'community-123',
    };
    
    // Act
    const result = await service.createList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.data?.communityId).toBe('community-123');
    expect(result.data?.isShared).toBe(true);
  });
  
  it('should return error for invalid list name', async () => {
    // Arrange
    const params = {
      name: '', // Invalid name
      description: 'Test',
      isShared: false,
    };
    
    // Act
    const result = await service.createList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid list name');
    expect(db.listOwners.add).not.toHaveBeenCalled();
  });
  
  it('should handle database errors gracefully', async () => {
    // Arrange
    const params = {
      name: 'Error List',
      description: 'Will cause error',
      isShared: false,
    };
    
    // Mock database error
    (db.listOwners.add as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    // Act
    const result = await service.createList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
  });
});
