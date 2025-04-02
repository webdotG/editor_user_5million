import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { 
  selectUser, 
  setFilterCriteria, 
  fetchUsers,
  resetAndReloadUsers,
  setPage,
  setPageSize,
  selectPaginatedUsers,
  selectPaginationMeta,
} from '../../store/usersSlice';
import { User } from '../../types';
import { useDebouncedCallback } from 'use-debounce';
import styles from './UserList.module.scss';

interface UsersListProps {
  onUserSelect?: (user: User) => void;
}

const UsersList: React.FC<UsersListProps> = React.memo(({ onUserSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const listRef = useRef<FixedSizeList>(null);
  const scrollPositionRef = useRef(0);
  
  const paginatedUsers = useSelector(selectPaginatedUsers);
  const { 
    loading,
    error,
    filterCriteria,
    sortConfig,
    isFetchingMore,
    users,
    initialized 
  } = useSelector((state: RootState) => state.users);
  
  const {
    currentPage,
    pageSize,
    totalCount,
    hasMore,
    totalPages
  } = useSelector(selectPaginationMeta);
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    scrollPositionRef.current = scrollOffset;
  }, []);
  
  const handleFilterWithScroll = useCallback((criteria: Partial<User>) => {
    dispatch(setFilterCriteria(criteria));
  }, [dispatch]);

  useEffect(() => {
    if (!loading && scrollPositionRef.current > 0 && listRef.current) {
      requestAnimationFrame(() => {
        listRef.current?.scrollTo(scrollPositionRef.current);
        scrollPositionRef.current = 0;
      });
    }
  }, [loading]);

  const debouncedFilter = useDebouncedCallback(handleFilterWithScroll, 300);

  // Загрузка данных при инициализации
  useEffect(() => {
    if (initialized) return;

    const loadInitialData = async () => {
      try {
        await dispatch(fetchUsers({ 
          page: 0, 
          size: pageSize,
          filters: {},
          sortField: sortConfig.field,
          sortDirection: sortConfig.direction
        })).unwrap();
      } catch (err) {
        if (!(err as { name?: string }).name?.includes('AbortError')) {
          setLocalError(err instanceof Error ? err.message : 'Unknown error');
        }
      }
    };
    
    const controller = new AbortController();
    loadInitialData();
    
    return () => controller.abort();
  }, [dispatch, pageSize, sortConfig, initialized]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedFilter({ 
      ...filterCriteria,
      name: query || undefined 
    });
  }, [debouncedFilter, filterCriteria]);

  const handleUserClick = useCallback((user: User) => {
    dispatch(selectUser(user));
    onUserSelect?.(user);
  }, [dispatch, onUserSelect]);

  
const changePage = useCallback((newPage: number) => {
  // Проверяем, есть ли уже данные для новой страницы
  const hasDataForPage = (newPage + 1) * pageSize <= users.length;
  
  if (!hasDataForPage && (newPage > currentPage || hasMore)) {
    // Если данных нет и есть еще страницы - загружаем
    dispatch(fetchUsers({
      page: newPage,
      size: pageSize,
      filters: filterCriteria,
      sortField: sortConfig.field,
      sortDirection: sortConfig.direction
    })).then(() => {
      dispatch(setPage(newPage));
    });
  } else {
    // Если данные уже есть - просто меняем страницу
    dispatch(setPage(newPage));
  }
}, [currentPage, pageSize, users.length, hasMore, dispatch, filterCriteria, sortConfig]);


  const renderUserRow = useCallback(({ index, style }: ListChildComponentProps) => {
    const user = paginatedUsers[index];
    if (!user) return null;

    return (
      <div 
        style={style}
        onClick={() => handleUserClick(user)}
        data-testid={`user-row-${user.id}`}
        className={styles.userRow}
      >
        <div className={styles.userName}>
          {user.name} {user.surname} <span className={styles.userId}>(ID: {user.id})</span>
        </div>
        <div className={styles.userInfo}>
          {user.company} • {user.department} • {user.jobTitle}
        </div>
      </div>
    );
  }, [paginatedUsers, handleUserClick]);

  if (loading && !initialized) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error || localError) {
    return (
      <div className={styles.errorContainer}>
        <p>Ошибка загрузки: {error || localError}</p>
        <button 
          onClick={() => {
            setLocalError(null);
            dispatch(resetAndReloadUsers({ pageSize }));
          }}
          className={styles.retryButton}
        >
          Повторить попытку
        </button>
      </div>
    );
  }

  const listKey = `${currentPage}-${JSON.stringify(filterCriteria)}-${pageSize}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Список пользователей</h2>
        
        <div className={styles.controls}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Поиск по имени..."
            className={styles.searchInput}
            disabled={loading}
          />
          
          <div className={styles.filterGroup}>

          </div>

        </div>
      </div>

      <div className={styles.statsBar}>
  <div className={styles.stats}>
    Всего пользователей: {totalCount}
    {(filterCriteria.department || filterCriteria.company || filterCriteria.jobTitle || searchQuery) && 
      ` (Отфильтровано: ${paginatedUsers.length})`}
  </div>
  
  <div className={styles.pagination}>
    <select 
      value={pageSize}
      onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
      className={styles.pageSizeSelect}
      disabled={loading}
    >
      {[10, 20, 50, 100].map(size => (
        <option key={size} value={size}>{size} на странице</option>
      ))}
    </select>
    
    <button
      onClick={() => changePage(currentPage - 1)}
      disabled={currentPage === 0 || loading}
      className={styles.pageButton}
    >
      Назад
    </button>
    
    <span className={styles.pageInfo}>
      Страница {currentPage + 1} из {totalPages}
    </span>
    
    <button
      onClick={() => changePage(currentPage + 1)}
      disabled={!hasMore || loading}
      className={styles.pageButton}
    >
      {isFetchingMore ? 'Загрузка...' : 'Вперед'}
    </button>
  </div>
</div> 

      <div className={styles.listContainer} style={{ height: 'calc(100vh - 250px)' }}>
        {paginatedUsers.length > 0 ? (
          <FixedSizeList
            ref={listRef}
            key={listKey}
            onScroll={handleScroll}
            height={600}
            itemCount={paginatedUsers.length}
            itemSize={69}
            width="100%"
            onItemsRendered={({ visibleStopIndex }) => {
              if (visibleStopIndex >= paginatedUsers.length - 5 && 
                  hasMore && 
                  !isFetchingMore) {
                dispatch(fetchUsers({ 
                  page: currentPage + 1, 
                  size: pageSize,
                  filters: filterCriteria,
                  sortField: sortConfig.field,
                  sortDirection: sortConfig.direction
                }));
              }
            }}
          >
            {renderUserRow}
          </FixedSizeList>
        ) : (
          <div className={styles.noResults}>
            {filterCriteria.department || filterCriteria.company || filterCriteria.jobTitle || searchQuery
              ? 'Нет пользователей по выбранным фильтрам' 
              : 'Нет данных для отображения'}
          </div>
        )}
        
        {isFetchingMore && (
          <div className={styles.loadingMore}>
            <div className={styles.loadingSpinner} />
            <p>Загрузка дополнительных данных...</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default UsersList;





// <div className={styles.filterGroup}>
//             {/* Фильтр по отделам */}
//             <select
//               value={filterCriteria.department || ''}
//               onChange={(e) => debouncedFilter({ 
//                 ...filterCriteria,
//                 department: e.target.value || undefined 
//               })}
//               className={styles.filterSelect}
//               disabled={loading}
//             >
//               <option value="">Все отделы</option>
//               <option value="IT">IT</option>
//               <option value="HR">HR</option>
//               <option value="Sales">Sales</option>
//               <option value="Marketing">Marketing</option>
//             </select>

//             {/* Фильтр по компаниям */}
//             <select
//               value={filterCriteria.company || ''}
//               onChange={(e) => debouncedFilter({ 
//                 ...filterCriteria,
//                 company: e.target.value || undefined 
//               })}
//               className={styles.filterSelect}
//               disabled={loading}
//             >
//               <option value="">Все компании</option>
//               <option value="Company A">Company A</option>
//               <option value="Company B">Company B</option>
//               <option value="Company C">Company C</option>
//             </select>

//             {/* Фильтр по должностям */}
//             <select
//               value={filterCriteria.jobTitle || ''}
//               onChange={(e) => debouncedFilter({ 
//                 ...filterCriteria,
//                 jobTitle: e.target.value || undefined 
//               })}
//               className={styles.filterSelect}
//               disabled={loading}
//             >
//               <option value="">Все должности</option>
//               <option value="Developer">Developer</option>
//               <option value="Manager">Manager</option>
//               <option value="Director">Director</option>
//             </select>

//             <button 
//               onClick={() => dispatch(resetAndReloadUsers({ pageSize }))}
//               className={styles.resetButton}
//               disabled={
//                 (!filterCriteria.department && 
//                  !filterCriteria.company && 
//                  !filterCriteria.jobTitle && 
//                  !searchQuery) || 
//                 loading
//               }
//             >
//               {loading ? 'Сброс...' : 'Сбросить фильтры'}
//             </button>
//           </div>