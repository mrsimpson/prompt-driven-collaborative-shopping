# Shopping Companion App - Implementation Plan

This document outlines the step-by-step implementation plan for the collaborative shopping application. As features are completed, check them off to track progress.

## Phase 1: Local-First Foundation

- [x] **1.1 Setup Project Structure**

  - [x] Configure project directories and files
  - [x] Set up TypeScript configuration
  - [x] Configure ESLint and Prettier

- [x] **1.2 Create Core Domain Models**

  - [x] Define TypeScript interfaces for all entities (User, ShoppingList, ListItem, etc.)
  - [x] Implement data validation utilities
  - [x] Create type definitions for all operations

- [x] **1.3 Implement Local Storage with Dexie.js**

  - [x] Set up Dexie.js database schema
  - [x] Create database initialization logic
  - [x] Implement basic CRUD operations for all entities
  - [x] Add soft-delete functionality

- [x] **1.4 Create Business Logic Layer**

  - [x] Implement service interfaces for all domain operations
  - [x] Create local-only implementations of these services
  - [x] Add shopping session management logic
  - [x] Implement list locking mechanism

- [x] **1.5 Implement Service Layer Tests**
  - [x] Set up testing framework (Jest)
  - [x] Create mocks for Dexie repositories
  - [x] Implement tests for ShoppingListService
  - [x] Implement tests for ShoppingSessionService
  - [x] Implement tests for UserService

## Phase 2: Basic UI Implementation

- [x] **2.1 Set Up Navigation**

  - [x] Configure Expo Router
  - [x] Create main navigation structure
  - [x] Implement authentication flow screens (placeholder)
  - [x] Add local mode indicator

- [x] **2.2 Implement List Management Screens**

  - [x] Create list overview screen
  - [x] Implement list creation/editing screens
  - [x] Build list item management UI
  - [x] Add direct shopping from list feature

- [x] **2.3 Develop Shopping Mode UI**

  - [x] Create shopping mode entry screen with list selection
  - [x] Implement consolidated shopping view
  - [x] Build checkout view with items grouped by source list
  - [x] Add shopping session completion flow

- [x] **2.4 Create User Management UI**
  - [x] Implement user profile screen with local mode
  - [x] Create placeholder login/logout functionality
  - [x] Remove settings screen (not needed for MVP)

## Phase 3: UI Refinement & Styling

- [x] **3.1 Implement Centralized Styling**

  - [x] Create common style definitions
  - [x] Extract duplicate styles into shared components
  - [x] Implement consistent color scheme and typography

- [x] **3.2 Enhance Navigation Experience**

  - [x] Add contextual back navigation
  - [x] Improve header components with centered titles
  - [x] Create reusable UI components

- [x] **3.3 Connect UI to Local Storage**

  - [x] Create custom hooks for service layer access
  - [x] Implement app initialization flow
  - [x] Wire up list management screens to services
  - [x] Connect shopping mode to services
  - [x] Implement local user management
  - [x] Wire up home screen

- [x] **3.4 Add Offline Capabilities**

  - [x] Implement local UUID generation
  - [x] Add timestamp management for local changes
  - [x] Create local notification system for actions

- [ ] **3.5 Basic usability**
  - [x] Checkout with creation of new lists
  - [x] Drag and drop re-ordering
  - [x] Editing of items
  - [x] Improve navigation efficiency
  - [x] Better shopping experience for multiple lists
  - [x] Edit and delete shopping lists

## Phase 4: State Management

Our application uses a page-oriented architecture with minimal global state. We'll focus on authentication context and use URL parameters for data transfer between screens.

- [x] **4.1 Implement Authentication Context**

  - [x] Create authentication context for user login state
  - [x] Add local mode detection and indicators
  - [ ] Implement persistent login sessions

- [x] **4.2 Optimize Page-to-Page Data Transfer**

  - [x] Standardize URL parameter passing for list IDs
  - [x] Implement efficient data loading patterns
  - [x] Add loading states for data fetching operations

- [x] **4.3 Enhance Local Storage Integration**
  - [x] Optimize service calls in page components
  - [x] Implement data prefetching for common operations
  - [x] Add caching for frequently accessed data

## Phase 5: Supabase Integration

- [ ] **5.1 Set Up Supabase Client**

  - [ ] Configure Supabase connection
  - [ ] Implement authentication with Supabase
  - [ ] Create basic database schema

- [ ] **5.2 Create Repository Layer**

  - [ ] Implement repository interfaces matching service interfaces
  - [ ] Create Supabase implementations of repositories
  - [ ] Add factory methods to switch between local and remote repositories

- [ ] **5.3 Implement Synchronization**

  - [ ] Create sync manager service
  - [ ] Implement outgoing change queue
  - [ ] Add conflict detection logic
  - [ ] Implement "last edit wins" resolution strategy

- [ ] **5.4 Add Real-time Updates**
  - [ ] Configure Supabase real-time subscriptions
  - [ ] Implement handlers for incoming changes
  - [ ] Add UI notifications for remote changes

## Phase 6: Sharing & Collaboration Features

- [ ] **6.1 Implement List Sharing**

  - [ ] Create UI for sharing lists with other users
  - [ ] Implement invitation system (email/link sharing)
  - [ ] Add permission management (view/edit rights)
  - [ ] Build notification system for shared list updates

- [ ] **6.2 Develop Community Features**

  - [ ] Create community creation and management UI
  - [ ] Implement community membership controls
  - [ ] Add community-wide list sharing
  - [ ] Build activity feed for community actions

- [ ] **6.3 Add Collaborative Shopping**
  - [ ] Implement real-time updates during shopping sessions
  - [ ] Create multi-user shopping mode (shop together)
  - [ ] Add chat/communication features for shoppers
  - [ ] Implement shopping assignment system (who buys what)

## Phase 7: Advanced Features

- [ ] **7.1 Add Security Policies**

  - [ ] Implement Row-Level Security policies in Supabase
  - [ ] Add client-side permission checks
  - [ ] Create secure sharing mechanisms

- [ ] **7.2 Enhance Shopping Experience**

  - [ ] Implement item aggregation across lists
  - [ ] Add checkout organization features
  - [ ] Create shopping history view
  - [ ] Intelligent automated ordering based on item-categories

- [ ] **7.3 Optimize Performance**
  - [ ] Implement lazy loading for lists
  - [ ] Add caching strategies
  - [ ] Optimize synchronization for large datasets

## Phase 8: Mobile Storage Migration (WatermelonDB)

- [ ] **8.1 Setup WatermelonDB**
  - [ ] Install WatermelonDB and dependencies
  - [ ] Configure WatermelonDB for React Native/Expo
  - [ ] Set up database schema using Model classes
  - [ ] Create database initialization logic

- [ ] **8.2 Implement Model Classes**
  - [ ] Create User model
  - [ ] Create ShoppingList model
  - [ ] Create ListItem model
  - [ ] Create ShoppingSession model
  - [ ] Implement relationships between models

- [ ] **8.3 Create Repository Implementations**
  - [ ] Implement UserRepository with WatermelonDB
  - [ ] Implement ShoppingListRepository with WatermelonDB
  - [ ] Implement ListItemRepository with WatermelonDB
  - [ ] Implement ShoppingSessionRepository with WatermelonDB

- [ ] **8.4 Adapt Service Layer**
  - [ ] Update service implementations to use WatermelonDB repositories
  - [ ] Ensure all business logic remains unchanged
  - [ ] Adapt query patterns to use WatermelonDB Q builders

- [ ] **8.5 Implement Migration Strategy**
  - [ ] Create data migration utilities from Dexie.js to WatermelonDB
  - [ ] Implement schema migration capabilities
  - [ ] Add fallback mechanisms for data recovery

## Phase 9: Testing & Refinement

- [ ] **9.1 Implement Unit Tests**

  - [ ] Create tests for repository implementations
  - [ ] Add tests for synchronization logic

- [ ] **9.2 Add Integration Tests**

  - [ ] Test UI components
  - [ ] Create end-to-end tests for key flows
  - [ ] Test offline capabilities

- [ ] **9.3 Perform User Testing**

  - [ ] Conduct usability testing
  - [ ] Gather feedback on core workflows
  - [ ] Identify and fix usability issues

- [ ] **9.4 Final Refinements**
  - [ ] Address feedback from testing
  - [ ] Optimize performance bottlenecks
  - [ ] Prepare for production deployment

## Implementation Approach

### Business-Oriented Interfaces

To ensure we can swap out the database layer, we'll create:

1. **Service Interfaces**: Define business operations without implementation details

   ```typescript
   interface ShoppingListService {
     createList(name: string, description: string): Promise<ShoppingList>;
     addItemToList(listId: string, item: ListItem): Promise<ListItem>;
     shareList(listId: string, userId: string): Promise<void>;
     // etc.
   }
   ```

2. **Repository Interfaces**: Create data access interfaces that service implementations will use

   ```typescript
   interface ShoppingListRepository {
     findById(id: string): Promise<ShoppingList | null>;
     save(list: ShoppingList): Promise<ShoppingList>;
     delete(id: string): Promise<void>;
     // etc.
   }
   ```

3. **Implementation Factories**: Create factory functions to switch between implementations
   ```typescript
   function createShoppingListService(
     mode: "local" | "remote" | "hybrid",
   ): ShoppingListService {
     switch (mode) {
       case "local":
         return new LocalShoppingListService(/* dependencies */);
       case "remote":
         return new RemoteShoppingListService(/* dependencies */);
       case "hybrid":
         return new HybridShoppingListService(/* dependencies */);
     }
   }
   ```

### Local-First Development Flow

1. Start with local-only implementations using WatermelonDB
2. Build UI components against service interfaces
3. Add Supabase implementations of repositories
4. Implement synchronization logic
5. Gradually add backend features while maintaining local functionality
