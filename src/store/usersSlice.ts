import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { User } from '../types';

interface UsersState {
  users: User[];
  filteredUsers: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  filterCriteria: Partial<User>;
  sortConfig: {
    field: keyof User;
    direction: 'asc' | 'desc';
  };
  lastUpdated: string | null;
  initialized: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

const initialState: UsersState = {
  users: [],
  filteredUsers: [],
  selectedUser: null,
  loading: false,
  error: null,
  filterCriteria: {},
  sortConfig: { 
    field: 'name', 
    direction: 'asc' 
  },
  lastUpdated: null,
  initialized: false,
  currentPage: 0,
  pageSize: 50,
  totalCount: 0,
  hasMore: true
};

// Селекторы
export const selectPaginatedUsers = createSelector(
  [
    (state: { users: UsersState }) => state.users.filteredUsers.length 
      ? state.users.filteredUsers 
      : state.users.users,
    (state: { users: UsersState }) => state.users.currentPage,
    (state: { users: UsersState }) => state.users.pageSize
  ],
  (users, page, size) => {
    const start = page * size;
    const end = start + size;
    return users.slice(start, end);
  }
);

// Асинхронные действия
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page = 0, size = 50 }: { page?: number; size?: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/paginated?page=${page}&size=${size}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const filterUsers = createAsyncThunk(
  'users/filterUsers',
  async (criteria: Partial<User>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(criteria).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });

      const response = await fetch(`/api/users/filter?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (user: User, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    selectUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setFilterCriteria: (state, action: PayloadAction<Partial<User>>) => {
      state.filterCriteria = action.payload;
      state.currentPage = 0;
    },
    setSortConfig: (state, action: PayloadAction<UsersState['sortConfig']>) => {
      state.sortConfig = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 0;
    },
    resetUsers: (state) => {
      state.filteredUsers = [];
      state.filterCriteria = {};
      state.currentPage = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.data; 
        state.totalCount = action.payload.total;
        state.hasMore = (state.currentPage + 1) * state.pageSize < action.payload.total;
        state.loading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(filterUsers.fulfilled, (state, action) => {
        console.log('API response:', action.payload);
        state.filteredUsers = action.payload;
        state.totalCount = action.payload.length;
        state.currentPage = 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        
        // Обновляем в основном списке
        const userIndex = state.users.findIndex(u => u.id === updatedUser.id);
        if (userIndex !== -1) state.users[userIndex] = updatedUser;
        
        // Обновляем в отфильтрованном списке
        const filteredIndex = state.filteredUsers.findIndex(u => u.id === updatedUser.id);
        if (filteredIndex !== -1) state.filteredUsers[filteredIndex] = updatedUser;
        
        // Обновляем выбранного пользователя
        if (state.selectedUser?.id === updatedUser.id) {
          state.selectedUser = updatedUser;
        }
        
        state.lastUpdated = new Date().toISOString();
      });
  }
});

export const { 
  selectUser,
  setFilterCriteria,
  setSortConfig,
  setPage,
  setPageSize,
  resetUsers
} = usersSlice.actions;

export default usersSlice.reducer;