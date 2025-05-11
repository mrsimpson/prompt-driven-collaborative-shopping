import { UserService, LocalUserService } from './user-service';
import { ShoppingListService, LocalShoppingListService } from './shopping-list-service';
import { ShoppingSessionService, LocalShoppingSessionService } from './shopping-session-service';

/**
 * Factory for creating service instances
 */
export class ServiceFactory {
  private static userService: UserService;
  private static shoppingListService: ShoppingListService;
  private static shoppingSessionService: ShoppingSessionService;

  /**
   * Get the user service instance
   * @returns UserService instance
   */
  static getUserService(): UserService {
    if (!this.userService) {
      this.userService = new LocalUserService();
    }
    return this.userService;
  }

  /**
   * Get the shopping list service instance
   * @returns ShoppingListService instance
   */
  static getShoppingListService(): ShoppingListService {
    if (!this.shoppingListService) {
      this.shoppingListService = new LocalShoppingListService();
    }
    return this.shoppingListService;
  }

  /**
   * Get the shopping session service instance
   * @returns ShoppingSessionService instance
   */
  static getShoppingSessionService(): ShoppingSessionService {
    if (!this.shoppingSessionService) {
      this.shoppingSessionService = new LocalShoppingSessionService();
    }
    return this.shoppingSessionService;
  }
}

export { UserService, ShoppingListService, ShoppingSessionService };
