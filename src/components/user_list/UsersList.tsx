import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { 
  selectUser, 
  setFilterCriteria, 
  resetUsers, 
  fetchUsers,
  setPage,
  setPageSize,
  selectPaginatedUsers
} from '../../store/usersSlice';
import { User } from '../../types';
import styles from './UserList.module.scss';

interface UsersListProps {
  onUserSelect?: (user: User) => void;
}

console.log('Redux store data:', {
  users: useSelector((state: RootState) => state.users.users),
  filteredUsers: useSelector((state: RootState) => state.users.filteredUsers),
  paginatedUsers: useSelector(selectPaginatedUsers)
});

const UsersList: React.FC<UsersListProps> = ({ onUserSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    filteredUsers,
    selectedUser, 
    loading,
    error,
    filterCriteria,
    currentPage,
    pageSize,
    totalCount,
    hasMore
  } = useSelector((state: RootState) => state.users);

  const paginatedUsers = useSelector(selectPaginatedUsers);
  
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchUsers({ page: currentPage, size: pageSize }));
        setIsInitialLoad(false);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    
    if (isInitialLoad) {
      loadData();
    }
  }, [dispatch, currentPage, pageSize, isInitialLoad]);

  // Обработчики фильтрации
  const filterByDepartment = useCallback((department: string) => {
    dispatch(setFilterCriteria({ department }));
  }, [dispatch]);

  const filterByJobTitle = useCallback((jobTitle: string) => {
    dispatch(setFilterCriteria({ jobTitle }));
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    dispatch(resetUsers());
  }, [dispatch]);

  // Пагинация
  const handlePageChange = useCallback((newPage: number) => {
    dispatch(setPage(newPage));
  }, [dispatch]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    dispatch(setPageSize(newSize));
  }, [dispatch]);

  // Выбор пользователя
  const handleUserClick = useCallback((user: User) => {
    dispatch(selectUser(user));
    onUserSelect?.(user);
  }, [dispatch, onUserSelect]);

  // Рендер строки пользователя
  const UserRow = useCallback(({ index, style }: ListChildComponentProps) => {
    const user = paginatedUsers[index];
    if (!user) return null;

    const isSelected = selectedUser?.id === user.id;
    
    return (
      <div 
        style={style}
        className={`${styles.userCard} ${isSelected ? styles.selected : ''}`}
        onClick={() => handleUserClick(user)}
        data-testid={`user-row-${user.id}`}
      >
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {user.name} {user.surname} (ID: {user.id})
          </span>
          <span className={styles.userMeta}>
            {user.company} • {user.department} • {user.jobTitle}
            {user.age && ` • ${user.age} лет`}
          </span>
        </div>
      </div>
    );
  }, [paginatedUsers, selectedUser, handleUserClick]);

  // Состояния загрузки и ошибок
  if (isInitialLoad || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Загрузка данных... ({Math.round((currentPage * pageSize / totalCount) * 100)}%)</p>
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
            setIsInitialLoad(true);
          }}
          className={styles.retryButton}
        >
          Повторить попытку
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Список пользователей</h2>
        
        <div className={styles.controls}>
          <div className={styles.filterGroup}>
            <button 
              onClick={() => filterByDepartment('IT')}
              className={`${styles.filterButton} ${filterCriteria.department === 'IT' ? styles.active : ''}`}
            >
              IT отдел
            </button>
            <button 
              onClick={() => filterByJobTitle('Developer')}
              className={`${styles.filterButton} ${filterCriteria.jobTitle === 'Developer' ? styles.active : ''}`}
            >
              Разработчики
            </button>
            <button 
              onClick={resetFilters}
              className={styles.resetButton}
              disabled={!filterCriteria.department && !filterCriteria.jobTitle}
            >
              Сбросить фильтры
            </button>
          </div>

          <div className={styles.paginationControls}>
            <select 
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className={styles.pageSizeSelect}
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size} на странице</option>
              ))}
            </select>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={styles.pageButton}
            >
              Назад
            </button>

            <span className={styles.pageInfo}>
              Страница {currentPage + 1} из {Math.ceil(totalCount / pageSize)}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasMore}
              className={styles.pageButton}
            >
              Вперед
            </button>
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        Всего пользователей: {totalCount}
        {filteredUsers.length > 0 && ` (Отфильтровано: ${filteredUsers.length})`}
      </div>

      <div className={styles.listWrapper}>
        {paginatedUsers.length > 0 ? (
          <FixedSizeList
            height={600}
            width="100%"
            itemCount={paginatedUsers.length}
            itemSize={85}
            overscanCount={10}
            className={styles.virtualizedList}
          >
            {UserRow}
          </FixedSizeList>
        ) : (
          <div className={styles.noResults}>
            {filterCriteria.department || filterCriteria.jobTitle 
              ? 'Нет пользователей по выбранным фильтрам' 
              : 'Нет данных для отображения'}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(UsersList);