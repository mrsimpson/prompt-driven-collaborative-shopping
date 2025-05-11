import { LocalShoppingListService } from '../../../services/shopping-list-service';
import { db } from '../../../stores/database';

// Mock the repositories
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

// Mock UUID generation
jest.mock('../../../utils/uuid', () => ({
  generateUUID: jest.fn().mockReturnValue('test-uuid')
}));

// Mock the database for list owner creation
jest.mock('../../../stores/database', () => {
  return {
    db: {
      listOwners: {
        add: jest.fn().mockResolvedValue('owner-123'),
      },
    },
  };
});

describe('ShoppingListService - createList', () => {
  let service: LocalShoppingListService;
  const mockUserId = 'user-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new LocalShoppingListService();
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
    
    // Verify repository interactions
    expect(service['listRepository'].save).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Grocery List',
      description: 'Weekly groceries',
      createdBy: mockUserId,
      isShared: false,
      isLocked: false,
    }));
    
    // Verify list owner creation
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
    
    // Verify repository interactions
    expect(service['listRepository'].save).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Family List',
      description: 'Family shopping',
      communityId: 'community-123',
      isShared: true,
    }));
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
    
    // Verify repository was not called
    expect(service['listRepository'].save).not.toHaveBeenCalled();
    expect(db.listOwners.add).not.toHaveBeenCalled();
  });
  
  it('should handle database errors gracefully', async () => {
    // Arrange
    const params = {
      name: 'Error List',
      description: 'Will cause error',
      isShared: false,
    };
    
    // Mock repository error
    (service['listRepository'].save as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
    
    // Act
    const result = await service.createList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
    expect(db.listOwners.add).not.toHaveBeenCalled();
  });
});
