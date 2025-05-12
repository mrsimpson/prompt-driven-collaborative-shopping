import { LocalUserService } from "../../../services/user-service";
import { db } from "../../../stores/database";

// Mock UUID generation
jest.mock("../../../utils/uuid", () => ({
  generateUUID: jest.fn().mockReturnValue("test-uuid"),
}));

// Mock the database
jest.mock("../../../stores/database", () => {
  return {
    db: {
      users: {
        add: jest.fn().mockResolvedValue("user-123"),
        where: jest.fn(),
      },
    },
  };
});

describe("UserService - register", () => {
  let service: LocalUserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LocalUserService();

    // Mock user not existing
    (db.users.where as jest.Mock) = jest.fn().mockReturnValue({
      equals: jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(null),
        }),
      }),
    });
  });

  it("should register a user successfully", async () => {
    // Arrange
    const params = {
      username: "testuser",
      email: "test@example.com",
      password: "Password123",
    };

    // Act
    const result = await service.register(params);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.username).toBe("testuser");
    expect(result.data?.email).toBe("test@example.com");
    expect(result.token).toBe("local-auth-token");

    // Verify database interactions
    expect(db.users.add).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "test-uuid",
        username: "testuser",
        email: "test@example.com",
      }),
    );
  });

  it("should return error for invalid username", async () => {
    // Arrange
    const params = {
      username: "te", // Too short
      email: "test@example.com",
      password: "Password123",
    };

    // Act
    const result = await service.register(params);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid username");
    expect(db.users.add).not.toHaveBeenCalled();
  });

  it("should return error for invalid email", async () => {
    // Arrange
    const params = {
      username: "testuser",
      email: "invalid-email", // Invalid format
      password: "Password123",
    };

    // Act
    const result = await service.register(params);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid email address");
    expect(db.users.add).not.toHaveBeenCalled();
  });

  it("should return error for invalid password", async () => {
    // Arrange
    const params = {
      username: "testuser",
      email: "test@example.com",
      password: "password", // Missing uppercase and number
    };

    // Act
    const result = await service.register(params);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number",
    );
    expect(db.users.add).not.toHaveBeenCalled();
  });

  it("should return error if email is already in use", async () => {
    // Arrange
    const params = {
      username: "testuser",
      email: "existing@example.com",
      password: "Password123",
    };

    // Mock existing user
    (db.users.where as jest.Mock) = jest.fn().mockReturnValue({
      equals: jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue({
            id: "existing-user",
            email: "existing@example.com",
          }),
        }),
      }),
    });

    // Act
    const result = await service.register(params);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe("Email address is already in use");
    expect(db.users.add).not.toHaveBeenCalled();
  });

  it("should handle database errors gracefully", async () => {
    // Arrange
    const params = {
      username: "testuser",
      email: "test@example.com",
      password: "Password123",
    };

    // Mock database error
    (db.users.add as jest.Mock).mockRejectedValueOnce(
      new Error("Database error"),
    );

    // Act
    const result = await service.register(params);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe("Database error");
  });
});
