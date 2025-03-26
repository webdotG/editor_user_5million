import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UsersState, FilterCriteria, SortConfig, WorkerMessage } from '../types';

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

// Асинхронные действия
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (count: number, { dispatch }) => {
    const worker = new Worker(new URL('../utils/dataGenerator.worker.ts', import.meta.url));
    
    return new Promise<User[]>((resolve, reject) => {
      worker.postMessage({ count });
      
      worker.onmessage = (e) => {
        if (e.data?.type === 'progress') {
          // Обновляем прогресс через dispatch
          dispatch(setLoadProgress(e.data.loaded / e.data.total * 100));
        } else if (Array.isArray(e.data)) {
          worker.terminate();
          resolve(e.data);
        } else if (e.data?.type === 'error') {
          worker.terminate();
          reject(new Error(e.data.error));
        }
      };
    });
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.initialized = true;
    },
    setLoadProgress: (state, action: PayloadAction<number>) => {
      state.loadProgress = action.payload;
    },
    selectUser: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
    },
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
    setFilterCriteria: (state, action: PayloadAction<FilterCriteria>) => {
      state.filterCriteria = action.payload;
    },
    setSortConfig: (state, action: PayloadAction<SortConfig>) => {
      state.sortConfig = action.payload;
    },
    resetUsers: (state) => {
      state.filteredUsers = [];
      state.filterCriteria = {};
      state.sortConfig = { field: 'name', direction: 'asc' };
    }
  },
  extraReducers: (builder) => {
    builder
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