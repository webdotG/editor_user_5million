import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { User } from '../types';

export interface UsersState {
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

// Начальное состояние с явными типами
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
  (state: { users: UsersState }) => state.users.filteredUsers,
  (state: { users: UsersState }) => state.users.currentPage,
  (state: { users: UsersState }) => state.users.pageSize,
  (users, page, size) => users.slice(page * size, (page + 1) * size)
);

// Загрузка пользователей
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page = 0, size = 50 }: { page?: number; size?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/paginated?page=${page}&size=${size}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Фильтрация
export const filterUsers = createAsyncThunk(
  'users/filterUsers',
  async (criteria: Partial<User>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (criteria.department) params.append('department', criteria.department);
      if (criteria.company) params.append('company', criteria.company);
      if (criteria.age) params.append('age', criteria.age.toString());
      
      const response = await fetch(`/api/users/filter?${params.toString()}`);
      if (!response.ok) throw new Error('Filter request failed');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Обновление пользователя
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (user: User, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      });
      if (!response.ok) throw new Error('Update failed');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
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
    setSortConfig: (state, action: PayloadAction<{field: keyof User, direction: 'asc' | 'desc'}>) => {
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
      state.sortConfig = { field: 'name', direction: 'asc' };
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
        state.users = action.payload.data; // берем data из ответа
        state.totalCount = action.payload.total; // берем total из ответа
        state.loading = false;
        state.hasMore = (state.currentPage + 1) * state.pageSize < action.payload.total;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(filterUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(filterUsers.fulfilled, (state, action) => {
        state.filteredUsers = action.payload;
        state.totalCount = action.payload.length;
        state.loading = false;
        state.currentPage = 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(filterUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) state.users[index] = updatedUser;
        
        const filteredIndex = state.filteredUsers.findIndex(u => u.id === updatedUser.id);
        if (filteredIndex !== -1) state.filteredUsers[filteredIndex] = updatedUser;
        
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