# Shopping Companion App

A collaborative grocery shopping application that allows multiple users to create, share, and shop from shared lists. Built with React Native, Expo, and Supabase.

## Features

- **Collaborative Shopping Lists**: Create and share shopping lists with friends, family, or community members
- **Multi-List Shopping**: Shop for multiple people at once by selecting multiple lists to bring along
- **Item Aggregation**: Automatically combines identical items from different lists while shopping
- **Checkout Organization**: Groups purchased items by source list for easy sorting into separate bags
- **Offline Support**: Full functionality even without an internet connection
- **Real-time Updates**: Changes sync instantly across all devices when online

## Architecture

The Shopping Companion App follows a local-first architecture with real-time synchronization:

- **Frontend**: React Native with Expo
- **Local Storage**: Dexie.js for IndexedDB access
- **Backend**: Supabase for authentication, database, and real-time updates
- **Synchronization**: Lazy sync with "last edit wins" conflict resolution

For detailed architecture information, see the [Architecture Documentation](./docs/arc42.md).

## Tech Stack

- **Frontend Framework**: React Native
- **Development Platform**: Expo
- **State Management**: React Context API with custom hooks
- **Local Database**: Dexie.js
- **Backend Services**: Supabase
- **Authentication**: Supabase Auth
- **Real-time Communication**: Supabase Realtime
- **Testing**: Jest and React Native Testing Library
- **Styling**: React Native Paper

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Supabase CLI
- Docker (for local Supabase development)
- iOS Simulator or Android Emulator (optional for local development)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/shopping-companion-app.git
   cd shopping-companion-app
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the project root with your Supabase credentials:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:

   ```bash
   npx expo start
   ```

### Setting Up Supabase

We use Supabase CLI for local development:

1. Install the Supabase CLI:

   ```bash
   # macOS and Linux
   brew install supabase/tap/supabase

   # Windows
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

2. Start the local Supabase development environment:

   ```bash
   supabase start
   ```

3. The CLI will output your local Supabase URL and anon key. Add these to your `.env` file:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
   ```

4. Apply database migrations:

   ```bash
   supabase db push
   ```

   This will apply all migrations, including schema, RLS policies, and triggers defined in the `supabase/migrations` directory.

5. To create new migrations:

   ```bash
   supabase migration new your_migration_name
   ```

6. When you're done developing, you can stop the local Supabase instance:

   ```bash
   supabase stop
   ```

### Running Tests

```bash
npm test
# or
yarn test
```

To run tests with coverage:

```bash
npm test -- --coverage
# or
yarn test --coverage
```

## Project Structure

```text
shopping-companion-app/
├── app/                   # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── components/            # Reusable components
├── hooks/                 # Custom React hooks
├── services/              # API and service functions
│   ├── supabase.ts        # Supabase client setup
│   └── sync.ts            # Data synchronization logic
├── stores/                # Dexie.js store definitions
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── supabase/              # Supabase configuration files
│   ├── migrations/        # Database migrations
│   │   ├── 20250509000000_initial_schema.sql
│   │   ├── 20250509000001_rls_policies.sql
│   │   └── 20250509000002_triggers.sql
│   ├── seed.sql           # Seed data for development
│   └── config.toml        # Supabase configuration
├── docs/                  # Documentation
│   ├── pdd.md             # Product Design Document
|   ├── arc42.md           # Architecture documentation
│   └── data-model.md      # Data Model details
├── app.json               # Expo configuration
└── package.json           # Project dependencies
```

## Backend Logic

All backend logic responsible for data consistency resides within Supabase:

### PL/pgSQL Database Functions

Located in `supabase/migrations/*_functions.sql` files, these handle simpler operations:

- Timestamp management (created_at, updated_at, last_modified_at)
- Soft delete functionality
- List locking/unlocking during shopping sessions
- Basic validation and constraint enforcement

### Deno Edge Functions

Located in `supabase/functions/` directory, these handle more complex operations:

- Creating shopping sessions with multiple lists
- Ending shopping sessions and moving unpurchased items to new lists
- Complex permission checks that go beyond basic RLS
- Business logic that requires multiple database operations

This approach ensures data consistency is maintained at the database level rather than relying on client-side enforcement.

1. **Feature Development**:

   - Create a new branch for each feature
   - Implement the feature with appropriate tests
   - Submit a pull request for review

2. **Testing**:

   - Write unit tests for all components and services
   - Run the test suite before submitting pull requests
   - Aim for >80% test coverage

3. **Deployment**:
   - Staging builds are created automatically for pull requests
   - Production builds require manual approval

## Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Supabase](https://supabase.com/)
- [Dexie.js](https://dexie.org/)
