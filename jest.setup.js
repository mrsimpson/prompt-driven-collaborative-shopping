// Mock Dexie
jest.mock('dexie', () => {
  const actualDexie = jest.requireActual('dexie');
  
  class MockTable {
    constructor() {
      this.items = [];
    }
    
    toArray() {
      return Promise.resolve([...this.items]);
    }
    
    get(id) {
      const item = this.items.find(item => item.id === id);
      return Promise.resolve(item || undefined);
    }
    
    add(item) {
      this.items.push(item);
      return Promise.resolve(item.id);
    }
    
    put(item) {
      const index = this.items.findIndex(i => i.id === item.id);
      if (index >= 0) {
        this.items[index] = item;
      } else {
        this.items.push(item);
      }
      return Promise.resolve(item.id);
    }
    
    update(id, changes) {
      const index = this.items.findIndex(item => item.id === id);
      if (index >= 0) {
        this.items[index] = { ...this.items[index], ...changes };
        return Promise.resolve(1); // Number of updated items
      }
      return Promise.resolve(0);
    }
    
    delete(id) {
      const index = this.items.findIndex(item => item.id === id);
      if (index >= 0) {
        this.items.splice(index, 1);
        return Promise.resolve();
      }
      return Promise.resolve();
    }
    
    clear() {
      this.items = [];
      return Promise.resolve();
    }
    
    count() {
      return Promise.resolve(this.items.length);
    }
    
    where(field) {
      return {
        equals: (value) => {
          return {
            toArray: () => {
              return Promise.resolve(this.items.filter(item => item[field] === value));
            },
            first: () => {
              return Promise.resolve(this.items.find(item => item[field] === value) || null);
            },
            and: (filterFn) => {
              return {
                toArray: () => {
                  return Promise.resolve(this.items.filter(item => item[field] === value && filterFn(item)));
                },
                first: () => {
                  return Promise.resolve(this.items.find(item => item[field] === value && filterFn(item)) || null);
                }
              };
            }
          };
        },
        anyOf: (values) => {
          return {
            toArray: () => {
              return Promise.resolve(this.items.filter(item => values.includes(item[field])));
            },
            and: (filterFn) => {
              return {
                toArray: () => {
                  return Promise.resolve(this.items.filter(item => values.includes(item[field]) && filterFn(item)));
                }
              };
            }
          };
        }
      };
    }
    
    bulkAdd(items) {
      items.forEach(item => this.items.push(item));
      return Promise.resolve();
    }
  }
  
  class MockDexie {
    constructor(name) {
      this.name = name;
      this.tables = {};
    }
    
    version(num) {
      return {
        stores: (storeDefinition) => {
          Object.keys(storeDefinition).forEach(tableName => {
            this[tableName] = new MockTable();
            this.tables[tableName] = this[tableName];
          });
          return this;
        }
      };
    }
    
    table(name) {
      return this.tables[name];
    }
    
    // Add any other methods you need to mock
  }
  
  return {
    __esModule: true,
    ...actualDexie,
    default: MockDexie,
    Dexie: MockDexie,
    Table: MockTable
  };
});

// Mock UUID generation for predictable test results
jest.mock('./src/utils/uuid', () => ({
  generateUUID: jest.fn().mockImplementation(() => 'test-uuid')
}));

// Set up global Date mock for consistent timestamps in tests
const mockDate = new Date('2025-01-01T12:00:00Z');
global.Date = class extends Date {
  constructor() {
    return mockDate;
  }
  
  static now() {
    return mockDate.getTime();
  }
};
