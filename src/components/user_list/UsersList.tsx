import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { selectUser, setFilterCriteria, resetUsers, fetchUsers } from '../../store/usersSlice';
import styles from './UserList.module.scss';

interface UsersListProps {
  onUserSelect?: (user: any) => void;
}

const UsersList: React.FC<UsersListProps> = ({ onUserSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    users, 
    filteredUsers, 
    selectedUser, 
    loading: reduxLoading, 
    error: reduxError,
    currentPage,
    pageSize
  } = useSelector((state: RootState) => state.users);
  
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Users data changed:', {
      users,
      filteredUsers,
      displayUsers,
      currentPage,
      pageSize
    });
  }, []);

  // Загрузка данных при монтировании и изменении страницы
  useEffect(() => {
    const loadData = async () => {
      try {
        setLocalLoading(true);
        await dispatch(fetchUsers({ page: currentPage, size: pageSize }));
        setLocalLoading(false);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Unknown error');
        setLocalLoading(false);
      }
    };
    
    loadData();
  }, [dispatch, currentPage, pageSize]);

  const displayUsers = useMemo(() => {
    return filteredUsers.length > 0 ? filteredUsers : users;
  }, [filteredUsers, users]);

  const filterByDepartment = useCallback((department: string) => {
    dispatch(setFilterCriteria({ department }));
  }, [dispatch]);

  const filterByJobTitle = useCallback((jobTitle: string) => {
    dispatch(setFilterCriteria({ jobTitle }));
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    dispatch(resetUsers());
  }, [dispatch]);

  const handleUserClick = useCallback((user: any) => {
    dispatch(selectUser(user));
    onUserSelect?.(user);
  }, [dispatch, onUserSelect]);

  const UserRow = useCallback(({ index, style }: ListChildComponentProps) => {
    const user = displayUsers[index];
    const isSelected = selectedUser?.id === user.id;
    
    return (
      <div 
        style={style}
        className={`${styles.userCard} ${isSelected ? styles.selected : ''}`}
        onClick={() => handleUserClick(user)}
      >
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name} {user.surname}</span>
          <span className={styles.userMeta}>
            {user.company} • {user.department} • {user.jobTitle}
          </span>
        </div>
      </div>
    );
  }, [displayUsers, selectedUser, handleUserClick]);

  if (reduxLoading || localLoading) {
    return <div className={styles.loading}>Загрузка данных...</div>;
  }

  if (reduxError || localError) {
    return <div className={styles.error}>Ошибка: {reduxError || localError}</div>;
  }

  return (
    <div className={styles.userList}>
      <div className={styles.filterControls}>
        <button 
          onClick={() => filterByDepartment('IT')}
          className={styles.filterButton}
        >
          IT отдел
        </button>
        <button 
          onClick={() => filterByJobTitle('Developer')}
          className={styles.filterButton}
        >
          Разработчики
        </button>
        <button 
          onClick={resetFilters}
          className={styles.resetButton}
        >
          Сбросить
        </button>
      </div>
      
      <div className={styles.userCount}>
        Всего: {displayUsers.length} {filteredUsers.length > 0 && `(Отфильтровано: ${filteredUsers.length})`}
      </div>
      
      <div className={styles.listContainer}>
        {displayUsers.length > 0 ? (
          <FixedSizeList
            height={600}
            itemCount={displayUsers.length}
            itemSize={80}
            width="100%"
            overscanCount={10}
          >
            {UserRow}
          </FixedSizeList>
        ) : (
          <div className={styles.noData}>Нет данных для отображения</div>
        )}
      </div>
    </div>
  );
};

export default React.memo(UsersList);