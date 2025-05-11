import { LocalShoppingListService } from '../../../services/shopping-list-service';
import { db } from '../../../stores/database';

// Mock the database
jest.mock('../../../stores/database', () => {
  return {
    db: {
      shoppingLists: {
        get: jest.fn(),
        update: jest.fn(),
        put: jest.fn(),
      },
      listOwners: {
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
        findById: jest.fn().mockImplementation((id) => {
          if (id === 'list-123') {
            return Promise.resolve({
              id: 'list-123',
              name: 'Original List',
              description: 'Original description',
              isShared: false,
              isLocked: false,
              createdBy: 'user-123',
            });
          }
          return Promise.resolve(null);
        }),
        update: jest.fn().mockImplementation((id, updates) => {
          return Promise.resolve({
            id,
            name: updates.name || 'Original List',
            description: updates.description || 'Original description',
            isShared: updates.isShared !== undefined ? updates.isShared : false,
            isLocked: false,
            createdBy: 'user-123',
          });
        }),
        save: jest.fn(),
        softDelete: jest.fn(),
      };
    }),
  };
});

describe('ShoppingListService - updateList', () => {
  let service: LocalShoppingListService;
  const mockUserId = 'user-123';
  const mockListId = 'list-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new LocalShoppingListService();
    
    // Mock list owner check
    (db.listOwners.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue({ id: 'owner-123', userId: mockUserId, listId: mockListId })
        })
      })
    });
  });
  
  it('should update a list successfully', async () => {
    // Arrange
    const params = {
      id: mockListId,
      name: 'Updated List',
      description: 'Updated description',
    };
    
    // Act
    const result = await service.updateList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe('Updated List');
    expect(result.data?.description).toBe('Updated description');
  });
  
  it('should return error if list is not found', async () => {
    // Arrange
    const params = {
      id: 'non-existent-list',
      name: 'Updated List',
    };
    
    // Act
    const result = await service.updateList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('List not found');
  });
  
  it('should return error if list is locked', async () => {
    // Arrange
    const params = {
      id: mockListId,
      name: 'Updated List',
    };
    
    // Mock locked list
    jest.spyOn(service['listRepository'], 'findById').mockResolvedValueOnce({
      id: mockListId,
      name: 'Locked List',
      description: '',
      isLocked: true,
      isShared: false,
      createdBy: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastModifiedAt: new Date(),
    });
    
    // Act
    const result = await service.updateList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Cannot update a locked list');
  });
  
  it('should return error if user is not an owner', async () => {
    // Arrange
    const params = {
      id: mockListId,
      name: 'Updated List',
    };
    
    // Mock user not being an owner
    (db.listOwners.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(null)
        })
      })
    });
    
    // Act
    const result = await service.updateList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('You do not have permission to update this list');
  });
  
  it('should return error for invalid list name', async () => {
    // Arrange
    const params = {
      id: mockListId,
      name: '', // Invalid name
    };
    
    // Act
    const result = await service.updateList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid list name');
  });
  
  it('should handle database errors gracefully', async () => {
    // Arrange
    const params = {
      id: mockListId,
      name: 'Updated List',
    };
    
    // Mock database error
    jest.spyOn(service['listRepository'], 'update').mockRejectedValueOnce(new Error('Database error'));
    
    // Act
    const result = await service.updateList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
  });
});
