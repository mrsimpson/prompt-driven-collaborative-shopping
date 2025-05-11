import { LocalShoppingSessionService } from '../../../services/shopping-session-service';
import { ShoppingSessionStatus } from '../../../types/models';

// Mock the repositories
jest.mock('../../../repositories/shopping-session-repository', () => {
  return {
    DexieShoppingSessionRepository: jest.fn().mockImplementation(() => {
      return {
        findActiveByUser: jest.fn().mockResolvedValue(null),
        save: jest.fn().mockImplementation((session) => {
          return Promise.resolve({
            ...session,
            id: 'session-123',
          });
        }),
        addListToSession: jest.fn().mockResolvedValue(undefined),
        findById: jest.fn(),
        update: jest.fn(),
      };
    }),
  };
});

jest.mock('../../../repositories/shopping-list-repository', () => {
  return {
    DexieShoppingListRepository: jest.fn().mockImplementation(() => {
      return {
        findById: jest.fn().mockImplementation((id) => {
          if (id === 'list-123' || id === 'list-456') {
            return Promise.resolve({
              id,
              name: `List ${id}`,
              isLocked: false,
              createdBy: 'user-123',
              description: '',
              isShared: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastModifiedAt: new Date(),
            });
          }
          return Promise.resolve(null);
        }),
        lockList: jest.fn().mockResolvedValue(undefined),
        unlockList: jest.fn(),
      };
    }),
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
    
    // Verify repository interactions
    expect(service['sessionRepository'].findActiveByUser).toHaveBeenCalledWith(mockUserId);
    expect(service['listRepository'].findById).toHaveBeenCalledWith(mockListId1);
    expect(service['listRepository'].findById).toHaveBeenCalledWith(mockListId2);
    expect(service['sessionRepository'].save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUserId,
        status: ShoppingSessionStatus.ACTIVE,
      })
    );
    expect(service['sessionRepository'].addListToSession).toHaveBeenCalledTimes(2);
    expect(service['listRepository'].lockList).toHaveBeenCalledTimes(2);
    expect(service['listRepository'].lockList).toHaveBeenCalledWith(mockListId1);
    expect(service['listRepository'].lockList).toHaveBeenCalledWith(mockListId2);
  });
  
  it('should return error if user already has an active session', async () => {
    // Arrange
    const params = {
      userId: mockUserId,
      listIds: [mockListId1],
    };
    
    // Mock existing active session
    (service['sessionRepository'].findActiveByUser as jest.Mock).mockResolvedValueOnce({
      id: 'existing-session',
      userId: mockUserId,
      status: ShoppingSessionStatus.ACTIVE,
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastModifiedAt: new Date(),
    });
    
    // Act
    const result = await service.createSession(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('User already has an active shopping session');
    expect(service['sessionRepository'].save).not.toHaveBeenCalled();
    expect(service['sessionRepository'].addListToSession).not.toHaveBeenCalled();
    expect(service['listRepository'].lockList).not.toHaveBeenCalled();
  });
  
  it('should return error if a list is not found', async () => {
    // Arrange
    const params = {
      userId: mockUserId,
      listIds: [mockListId1, 'non-existent-list'],
    };
    
    // Mock list not found
    (service['listRepository'].findById as jest.Mock).mockImplementation((id) => {
      if (id === mockListId1) {
        return Promise.resolve({
          id: mockListId1,
          name: 'List 1',
          isLocked: false,
          createdBy: 'user-123',
          description: '',
          isShared: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastModifiedAt: new Date(),
        });
      }
      return Promise.resolve(null);
    });
    
    // Act
    const result = await service.createSession(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('List with ID non-existent-list not found');
    expect(service['sessionRepository'].save).not.toHaveBeenCalled();
    expect(service['sessionRepository'].addListToSession).not.toHaveBeenCalled();
    expect(service['listRepository'].lockList).not.toHaveBeenCalled();
  });
  
  it('should return error if a list is already locked', async () => {
    // Arrange
    const params = {
      userId: mockUserId,
      listIds: [mockListId1, mockListId2],
    };
    
    // Mock locked list
    (service['listRepository'].findById as jest.Mock).mockImplementation((id) => {
      if (id === mockListId1) {
        return Promise.resolve({
          id: mockListId1,
          name: 'List 1',
          isLocked: false,
          createdBy: 'user-123',
          description: '',
          isShared: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastModifiedAt: new Date(),
        });
      } else if (id === mockListId2) {
        return Promise.resolve({
          id: mockListId2,
          name: 'List 2',
          isLocked: true, // Already locked
          createdBy: 'user-123',
          description: '',
          isShared: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastModifiedAt: new Date(),
        });
      }
      return Promise.resolve(null);
    });
    
    // Act
    const result = await service.createSession(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe(`List with ID ${mockListId2} is already locked`);
    expect(service['sessionRepository'].save).not.toHaveBeenCalled();
    expect(service['sessionRepository'].addListToSession).not.toHaveBeenCalled();
    expect(service['listRepository'].lockList).not.toHaveBeenCalled();
  });
  
  it('should handle database errors gracefully', async () => {
    // Arrange
    const params = {
      userId: mockUserId,
      listIds: [mockListId1],
    };
    
    // Mock database error
    (service['sessionRepository'].save as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
    
    // Act
    const result = await service.createSession(params);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
    expect(service['sessionRepository'].addListToSession).not.toHaveBeenCalled();
    expect(service['listRepository'].lockList).not.toHaveBeenCalled();
  });
});
