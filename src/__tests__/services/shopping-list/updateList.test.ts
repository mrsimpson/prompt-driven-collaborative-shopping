import { LocalShoppingListService } from '../../../services/shopping-list-service';
import { db } from '../../../stores/database';

// Mock the database
jest.mock('../../../stores/database', () => {
  return {
    db: {
      shoppingLists: {
        get: jest.fn(),
        update: jest.fn(),
      },
      listOwners: {
        where: jest.fn(),
      },
    },
  };
});

describe('ShoppingListService - updateList', () => {
  let service: LocalShoppingListService;
  const mockUserId = 'user-123';
  const mockListId = 'list-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new LocalShoppingListService();
    
    // Mock the repository methods used by updateList
    (db.shoppingLists.get as jest.Mock).mockResolvedValue({
      id: mockListId,
      name: 'Original List',
      description: 'Original description',
      isShared: false,
      isLocked: false,
      createdBy: mockUserId,
    });
    
    (db.shoppingLists.update as jest.Mock).mockResolvedValue(1);
    
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
    
    // Mock the updated list
    (db.shoppingLists.get as jest.Mock).mockResolvedValueOnce({
      id: mockListId,
      name: 'Original List',
      description: 'Original description',
      isShared: false,
      isLocked: false,
      createdBy: mockUserId,
    }).mockResolvedValueOnce({
      id: mockListId,
      name: 'Updated List',
      description: 'Updated description',
      isShared: false,
      isLocked: false,
      createdBy: mockUserId,
    });
    
    // Act
    const result = await service.updateList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe('Updated List');
    expect(result.data?.description).toBe('Updated description');
    
    // Verify database calls
    expect(db.shoppingLists.update).toHaveBeenCalledWith(
      mockListId,
      expect.objectContaining({
        name: 'Updated List',
        description: 'Updated description',
      })
    );
  });
  
  it('should return error if list is not found', async () => {
    // Arrange
    const params = {
      id: 'non-existent-list',
      name: 'Updated List',
    };
    
    // Mock list not found
    (db.shoppingLists.get as jest.Mock).mockResolvedValue(null);
    
    // Act
    const result = await service.updateList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('List not found');
    expect(db.shoppingLists.update).not.toHaveBeenCalled();
  });
  
  it('should return error if list is locked', async () => {
    // Arrange
    const params = {
      id: mockListId,
      name: 'Updated List',
    };
    
    // Mock locked list
    (db.shoppingLists.get as jest.Mock).mockResolvedValue({
      id: mockListId,
      name: 'Locked List',
      isLocked: true,
      createdBy: mockUserId,
    });
    
    // Act
    const result = await service.updateList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Cannot update a locked list');
    expect(db.shoppingLists.update).not.toHaveBeenCalled();
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
    expect(db.shoppingLists.update).not.toHaveBeenCalled();
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
    expect(db.shoppingLists.update).not.toHaveBeenCalled();
  });
  
  it('should handle database errors gracefully', async () => {
    // Arrange
    const params = {
      id: mockListId,
      name: 'Updated List',
    };
    
    // Mock database error
    (db.shoppingLists.update as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    // Act
    const result = await service.updateList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
  });
});
