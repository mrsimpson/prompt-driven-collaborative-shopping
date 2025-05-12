# Shopping Companion App - Product Design Document

## 1. Product Overview

A mobile application that allows multiple users to create and share shopping lists, enabling one person to efficiently shop for multiple people in their community.

## 2. Target Users

- Families
- Roommates
- Friend groups
- Communities (neighborhoods, dorms, etc.)

## 3. Core Features

### Shopping List Management

- Create, read, update, and delete shopping lists
- Add, edit, remove items from lists
- Specify quantities for items
- Mark items as purchased during shopping

### Sharing & Collaboration

- Multiple owners can edit the same list
- Share lists with community/group members
- Real-time updates when changes are made

### Shopping Mode

- Select multiple lists to "bring along" when shopping
- Lists are locked when a user enters shopping mode (no further edits allowed)
- Merge selected lists into a single shopping view with identical items aggregated by quantity
- Mark items as purchased while shopping
- At checkout: group purchased items by source list for easy sorting/bagging
- End shopping session (move unpurchased items to a new list)

### User & Community Management

- Create/join communities
- Basic permissions system:
  - List owners (full edit rights)
  - Community members (view shared lists, select for bring-along)

## 4. User Flows

### List Creation & Sharing

1. User creates a new shopping list
2. User adds items with quantities
3. User shares list with specific people or entire community
4. Recipients receive notification of shared list

### Shopping Process

1. User enters "shopping mode"
2. User selects which shared lists to bring along
3. Selected lists become locked for editing
4. App presents consolidated view of all items (identical items aggregated)
5. User marks items as purchased while shopping
6. At checkout, user switches to "checkout view" showing items grouped by source list
7. User ends shopping session, unpurchased items move to a new list

## 5. Data Structure (Conceptual)

- Users
- Communities (groups of users)
- Shopping Lists (with ownership, sharing properties, and lock status)
- List Items (with quantities and purchase status)

## 6. Out of Scope (For Initial Version)

- Price tracking
- Cost splitting
- Payment integration
- Inventory management
- Notifications
- Item categorization
- Location features
- History/analytics features
