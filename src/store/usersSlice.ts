import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UsersState, FilterCriteria, SortConfig, WorkerMessage } from '../types';

// Начальное состояние хранилища
const initialState: UsersState = {
  users: [],
  filteredUsers: [],
  selectedUser: null,
  loading: false,
  error: null,
  filterCriteria: {},
  sortConfig: { field: 'name', direction: 'asc' },
  lastUpdated: null,
  initialized: false,
  loadProgress: 0
};

// Асинхронная загрузка пользователей через Web Worker
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (count: number, { dispatch }) => {
    const worker = new Worker(new URL('../utils/fakerDataGenerator.worker.ts', import.meta.url), {
      type: 'module' 
    });

    return new Promise<User[]>((resolve, reject) => {
      const allUsers: User[] = [];
      
      worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        if (e.data.type === 'progress') {
          dispatch(setLoadProgress(e.data.progress));
        } else if (e.data.type === 'batch') { 
          allUsers.push(...e.data.data);
        } else if (e.data.type === 'complete') {
          worker.terminate();
          resolve(allUsers);
        } else if (e.data.type === 'error') {
          worker.terminate();
          reject(new Error(e.data.error));
        }
      };

      worker.onerror = (error) => {
        worker.terminate();
        reject(new Error(`Worker error: ${error.message}`));
      };

      worker.postMessage({ count });
    });
  }
);

// Асинхронная обработка пользователей (фильтрация + сортировка)
export const processUsers = createAsyncThunk(
  'users/processUsers',
  async (_, { getState }) => {
    const state = getState() as { users: UsersState };
    const { users, filterCriteria, sortConfig } = state.users;

    await new Promise(resolve => setTimeout(resolve, 100)); // Имитация асинхронности

    let filteredUsers = [...users];
    
    // Фильтрация по имени (если задано)
    if (filterCriteria.name) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(filterCriteria.name!.toLowerCase())
      );
    }
    
    // Фильтрация по возрасту (если задан)
    if (typeof filterCriteria.age === 'number') {
      const targetAge = filterCriteria.age;
      filteredUsers = filteredUsers.filter(user => 
        user.age === targetAge
      );
    }

    // Сортировка (если задана)
    if (sortConfig.field) {
      filteredUsers.sort((a, b) => {
        const fieldA = a[sortConfig.field as keyof User];
        const fieldB = b[sortConfig.field as keyof User];
        
        if (fieldA < fieldB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filteredUsers;
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Установка списка пользователей
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.initialized = true;
    },
    
    // Обновление прогресса загрузки
    setLoadProgress: (state, action: PayloadAction<number>) => {
      state.loadProgress = action.payload;
    },
    
    // Выбор конкретного пользователя
    selectUser: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
    },
    
    // Обновление данных пользователя
    updateUser: (state, action: PayloadAction<User>) => {
      const updatedUser = action.payload;
      state.users = state.users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      );
      state.filteredUsers = state.filteredUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      );
      if (state.selectedUser?.id === updatedUser.id) {
        state.selectedUser = updatedUser;
      }
      state.lastUpdated = new Date().toISOString();
    },
    
    // Установка критериев фильтрации
    setFilterCriteria: (state, action: PayloadAction<FilterCriteria>) => {
      state.filterCriteria = action.payload;
    },
    
    // Установка параметров сортировки
    setSortConfig: (state, action: PayloadAction<SortConfig>) => {
      state.sortConfig = action.payload;
    },
    
    // Сброс фильтров и сортировки
    resetUsers: (state) => {
      state.filteredUsers = [];
      state.filterCriteria = {};
      state.sortConfig = { field: 'name', direction: 'asc' };
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка состояний загрузки пользователей
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loadProgress = 0;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.users = action.payload;
        state.loading = false;
        state.loadProgress = 100;
        state.lastUpdated = new Date().toISOString();
        state.initialized = true;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      
      // Обработка состояний фильтрации/сортировки
      .addCase(processUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.filteredUsers = action.payload;
        state.loading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(processUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Processing failed';
      });
  }
});

// Экспорт действий
export const { 
  setUsers,
  setLoadProgress,
  selectUser, 
  updateUser, 
  setFilterCriteria, 
  setSortConfig,
  resetUsers
} = usersSlice.actions;

export default usersSlice.reducer;