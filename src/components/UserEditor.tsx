import React, { useState, useCallback } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { selectUser, updateUser } from '../store/usersSlice';
import styles from './UserEditor.module.scss';
import AppInitializer from '../InitializeData/AppInitializer';

const UserEditor: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    users,
    filteredUsers,
    selectedUser,
    loading,
    initialized
  } = useSelector((state: RootState) => state.users);
  
  const [editedUser, setEditedUser] = useState(selectedUser);
  const displayUsers = filteredUsers.length > 0 ? filteredUsers : users;

  if (!initialized) {
    return <AppInitializer />;
  }

  // Мемоизированные обработчики
  const handleUserClick = useCallback((user: typeof selectedUser) => {
    if (user) {
      dispatch(selectUser(user)); 
      setEditedUser({ ...user });
    }
  }, [dispatch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => prev ? { ...prev, [name]: value } : null);
  }, []);

  const handleSave = useCallback(() => {
    if (editedUser) {
      dispatch(updateUser(editedUser)); 
    }
  }, [dispatch, editedUser]);

  // Оптимизированный компонент строки
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
          <span className={styles.userMeta}>{user.company} • {user.department}</span>
        </div>
      </div>
    );
  }, [displayUsers, selectedUser, handleUserClick]);

  return (
    <div className={styles.container}>
      {/* Список пользователей (сайдбар) */}
      <div className={styles.userList}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <FixedSizeList
            height={window.innerHeight}
            itemCount={displayUsers.length}
            itemSize={80} 
            width="100%"
            overscanCount={10} //производительности при скролле
          >
            {UserRow}
          </FixedSizeList>
        )}
      </div>

      {/* Панель редактирования */}
      {selectedUser && editedUser && (
        <div className={styles.editorPanel}>
          <h2>Edit Profile</h2>
          
          <div className={styles.formGroup}>
            <label>First Name</label>
            <input
              name="name"
              value={editedUser.name}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Last Name</label>
            <input
              name="surname"
              value={editedUser.surname}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={editedUser.age}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={editedUser.email}
              onChange={handleInputChange}
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(UserEditor);