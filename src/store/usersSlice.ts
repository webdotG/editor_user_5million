import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { User } from '../types';

// Интерфейс параметров для запроса пользователей
interface FetchUsersParams {
  page?: number;          // Текущая страница
  size?: number;          // Количество элементов на странице
  filters?: UserFilters;  // Параметры фильтрации
  sortField?: keyof User; // Поле сортировки
  sortDirection?: 'asc' | 'desc'; // Направление сортировки
}

// Уточненный интерфейс для фильтров (только строковые поля)
interface UserFilters {
  name?: string;
  email?: string;
  department?: string;
  company?: string;
  jobTitle?: string;
}

// Полное состояние стора пользователей
interface UsersState {
  users: User[];          
  loading: boolean;       
  error: string | null;   
  filterCriteria: UserFilters; 
  sortConfig: {        
    field: keyof User;
    direction: 'asc' | 'desc';
  };
  lastUpdated: string | null; 
  currentPage: number;    
  pageSize: number;       
  totalCount: number;    
  hasMore: boolean;     
  selectedUser: User | null; 
  isFetchingMore: boolean; 
  initialized: boolean;
}


const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  filterCriteria: {},
  sortConfig: { 
    field: 'name', 
    direction: 'asc' 
  },
  lastUpdated: null,
  currentPage: 0,
  pageSize: 50,
  totalCount: 0,
  hasMore: true,
  selectedUser: null, 
  isFetchingMore: false,
  initialized: false
};

// Селектор для пагинированных данных (без дублирования сортировки)
export const selectPaginatedUsers = createSelector(
  [
    (state: { users: UsersState }) => state.users.users,
    (state: { users: UsersState }) => state.users.filterCriteria,
    (state: { users: UsersState }) => state.users.currentPage,
    (state: { users: UsersState }) => state.users.pageSize
  ],
  (users, filters, page, size) => {
    const filteredUsers = users.filter(user => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        // department и jobTitle проверяем точное совпадение
        if (key === 'department' || key === 'jobTitle') {
          return user[key] === value;
        }
        
        // name проверяем частичное совпадение
        return String(user[key as keyof User]).toLowerCase()
          .includes(String(value).toLowerCase());
      });
    });
    
    const start = page * size;
    return filteredUsers.slice(start, start + size);
  }
);

// Селектор для метаданных пагинации
export const selectPaginationMeta = createSelector(
  (state: { users: UsersState }) => state.users,
  (users) => ({
    currentPage: users.currentPage,
    pageSize: users.pageSize,
    totalCount: users.totalCount,
    hasMore: users.hasMore,
    totalPages: Math.ceil(users.totalCount / users.pageSize)
  })
);

// Запрос списка пользователей
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: FetchUsersParams, { rejectWithValue, signal }) => {
    try {
      const { 
        page = 0, 
        size = 50,
        filters = {},
        sortField = 'name',
        sortDirection = 'asc'
      } = params;

      // console.log('[STORE] Запрос пользователей:', { page, size, filters });

      const urlParams = new URLSearchParams({
        page: String(page),
        size: String(size),
        sort: sortField,
        order: sortDirection,
        ...Object.fromEntries(
          Object.entries(filters)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => [key, String(value)])
        )
      });

      const response = await fetch(`/api/users?${urlParams.toString()}`, { signal });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Ошибка ${response.status}`);
      }
      
      const data = await response.json();
      return {
        users: data.users,
        totalCount: data.totalCount,
        page
      };
    } catch (error) {
      console.error('[STORE] Ошибка при загрузке:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }
);

// Обновление пользователя
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (user: User, { rejectWithValue }) => {
    try {
      // console.log('[STORE] Обновление пользователя:', user.id);
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Ошибка ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[STORE] Ошибка при обновлении:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }
);

export const resetAndReloadUsers = createAsyncThunk(
  'users/resetAndReload',
  async (params: { pageSize: number }, { dispatch }) => {
    dispatch(resetUsers());
    await dispatch(fetchUsers({
      page: 0,
      size: params.pageSize,
      filters: {},
      sortField: 'name',
      sortDirection: 'asc'
    })).unwrap();
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Установка критериев фильтрации
    setFilterCriteria: (state, action: PayloadAction<UserFilters>) => {
      state.filterCriteria = action.payload;
      state.currentPage = 0; // сброс на первую страницу
      // console.log('[STORE] Установлены фильтры:', action.payload);
    },
    
    // Установка конфигурации сортировки
    setSortConfig: (state, action: PayloadAction<UsersState['sortConfig']>) => {
      state.sortConfig = action.payload;
      // console.log('[STORE] Установлена сортировка:', action.payload);
    },
    
    // Изменение текущей страницы
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
      // console.log('[STORE] Установлена страница:', action.payload);
    },
    
    // Изменение размера страницы
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 0; // Сброс страницы при изменении размера
      // console.log('[STORE] Установлен размер страницы:', action.payload);
    },

    selectUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
      // console.log('[STORE] Выбран пользователь:', action.payload?.id);
    },
    
    setIsFetchingMore: (state, action: PayloadAction<boolean>) => {
      state.isFetchingMore = action.payload;
      // console.log('[STORE] Установлен isFetchingMore:', action.payload);
    },
    
    resetUsers: (state) => {
      // Сохраняем users, но сбрасываем все остальное
      state.filterCriteria = {};
      state.currentPage = 0;
      state.totalCount = state.users.length; 
      // console.log('[STORE] Сброс фильтров пользователей');
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка начала загрузки
      .addCase(fetchUsers.pending, (state, action) => {
        // Если это не первая страница, устанавливаем isFetchingMore в true
        if (action.meta.arg.page && action.meta.arg.page > 0) {
          state.isFetchingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      
      // Успешная загрузка
      .addCase(fetchUsers.fulfilled, (state, action) => {
        const { users, totalCount, page } = action.payload;
        
        // Важно: сохраняем новые данные только если page === 0
        // Иначе добавляем к существующим
        state.users = page === 0 ? users : [...state.users, ...users];
        state.totalCount = totalCount;
        state.hasMore = (state.users.length < totalCount);
        state.currentPage = page;
        state.loading = false;
        state.isFetchingMore = false;
        state.initialized = true;
        
        // console.log('Saved to Redux:', { 
        //   usersCount: state.users.length,
        //   currentPage: state.currentPage
        // })
      })
      
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.isFetchingMore = false; // Сбрасываем флаг
        state.error = action.payload as string;
      })
      
      // Успешное обновление пользователя
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(u => u.id === updatedUser.id);
        
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        
        state.lastUpdated = new Date().toISOString();
        // console.log(`[STORE] Пользователь ${updatedUser.id} обновлен`);
      })
      
      // Ошибка обновления
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload as string;
        console.error('[STORE] Ошибка :', action.payload);
      })
      
  }
});

export const { 
  setFilterCriteria,
  setSortConfig,
  setPage,
  setPageSize,
  resetUsers,
  selectUser,
  setIsFetchingMore
} = usersSlice.actions;

export default usersSlice.reducer;