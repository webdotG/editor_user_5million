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
  lastUpdated: null
};

// Асинхронные действия
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (count: number) => {
    const worker = new Worker(new URL('../utils/dataGenerator.worker.ts', import.meta.url));
    
    return new Promise<User[]>((resolve) => {
      worker.postMessage({ count });
      
      worker.onmessage = (e) => {
        if (e.data) {
          worker.terminate();
          resolve(e.data);
        }
      };
    });
  }
);

export const processUsers = createAsyncThunk(
  'users/processUsers',
  async ({ action, payload }: { 
    action: 'FILTER' | 'SORT';
    payload: any 
  }, { getState }) => {
    const worker = new Worker(new URL('../utils/dataProcessor.worker.ts', import.meta.url));
    const { users } = (getState() as { users: UsersState }).users;

    return new Promise<User[]>((resolve) => {
      worker.postMessage({ 
        action,
        payload: { 
          users: payload.users || users,
          ...payload 
        }
      });
      
      worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        if (e.data.action === `${action}_RESULT`) {
          worker.terminate();
          resolve(e.data.payload);
        }
      };
    });
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    selectUser: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const updatedUser = action.payload;
      state.users = state.users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      );
      
      // Обновляем filteredUsers если пользователь есть там
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
      // Обработка fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.users = action.payload;
        state.loading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      
      // Обработка processUsers
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
  selectUser, 
  updateUser, 
  setFilterCriteria, 
  setSortConfig,
  resetUsers
} = usersSlice.actions;

export default usersSlice.reducer;