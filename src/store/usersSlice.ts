import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UsersState, SortConfig, FilterCriteria } from '../types';

const initialState: UsersState = {
    users: [],
    filteredUsers: [],
    selectedUser: null,
    loading: false,
    error: null,
    filterCriteria: {},
    sortConfig: { field: 'name', direction: 'asc' }
  };

export const filterUsers = createAsyncThunk(
  'users/filterUsers',
  async ({ users, criteria }: { users: User[]; criteria: FilterCriteria }) => {
    const worker = new Worker(new URL('../workers/userWorker.ts', import.meta.url));
    
    return new Promise<User[]>((resolve) => {
      worker.postMessage({ 
        action: 'FILTER', 
        payload: { users, criteria } 
      });
      
      worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        if (e.data.action === 'FILTER_RESULT') {
          worker.terminate();
          resolve(e.data.payload);
        }
      };
    });
  }
);

export const sortUsers = createAsyncThunk(
  'users/sortUsers',
  async ({ users, field, direction }: { users: User[]; field: keyof User; direction: 'asc' | 'desc' }) => {
    const worker = new Worker(new URL('../workers/userWorker.ts', import.meta.url));
    
    return new Promise<User[]>((resolve) => {
      worker.postMessage({ 
        action: 'SORT', 
        payload: { users, field, direction } 
      });
      
      worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        if (e.data.action === 'SORT_RESULT') {
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
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    selectUser: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const updatedUser = action.payload;
      state.users = state.users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      );
      
      if (state.selectedUser?.id === updatedUser.id) {
        state.selectedUser = updatedUser;
      }
    },
    setFilterCriteria: (state, action: PayloadAction<FilterCriteria>) => {
      state.filterCriteria = action.payload;
    },
    setSortConfig: (state, action: PayloadAction<SortConfig>) => {
      state.sortConfig = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(filterUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(filterUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.filteredUsers = action.payload;
        state.loading = false;
      })
      .addCase(filterUsers.rejected, (state, action) => {
        state.error = action.error.message || 'Filtering failed';
        state.loading = false;
      })
      .addCase(sortUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(sortUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.filteredUsers = action.payload;
        state.loading = false;
      })
      .addCase(sortUsers.rejected, (state, action) => {
        state.error = action.error.message || 'Sorting failed';
        state.loading = false;
      });
  }
});

export const { setUsers, selectUser, updateUser, setFilterCriteria, setSortConfig } = usersSlice.actions;
export default usersSlice.reducer;