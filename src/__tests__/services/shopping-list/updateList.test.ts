import { LocalShoppingListService } from '../../../services/shopping-list-service';

// Mock the repositories
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
              createdAt: new Date(),
              updatedAt: new Date(),
              lastModifiedAt: new Date(),
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
            createdAt: new Date(),
            updatedAt: new Date(),
            lastModifiedAt: new Date(),
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
    
    // Mock isListOwner method
    jest.spyOn(service as any, 'isListOwner').mockResolvedValue(true);
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
    
    // Verify repository interactions
    expect(service['listRepository'].findById).toHaveBeenCalledWith(mockListId);
    expect(service['listRepository'].update).toHaveBeenCalledWith(
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
    (service['listRepository'].findById as jest.Mock).mockResolvedValueOnce(null);
    
    // Act
    const result = await service.updateList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('List not found');
    expect(service['listRepository'].update).not.toHaveBeenCalled();
  });
  
  it('should return error if list is locked', async () => {
    // Arrange
    const params = {
      id: mockListId,
      name: 'Updated List',
    };
    
    // Mock locked list
    (service['listRepository'].findById as jest.Mock).mockResolvedValueOnce({
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
    expect(service['listRepository'].update).not.toHaveBeenCalled();
  });
  
  it('should return error if user is not an owner', async () => {
    // Arrange
    const params = {
      id: mockListId,
      name: 'Updated List',
    };
    
    // Mock user not being an owner
    (service as any).isListOwner.mockResolvedValueOnce(false);
    
    // Act
    const result = await service.updateList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('You do not have permission to update this list');
    expect(service['listRepository'].update).not.toHaveBeenCalled();
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
    expect(service['listRepository'].update).not.toHaveBeenCalled();
  });
  
  it('should handle database errors gracefully', async () => {
    // Arrange
    const params = {
      id: mockListId,
      name: 'Updated List',
    };
    
    // Mock database error
    (service['listRepository'].update as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
    
    // Act
    const result = await service.updateList(params, mockUserId);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
  });
});
