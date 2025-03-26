import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { selectUser, updateUser } from '../store/usersSlice';
import styles from './UserEditor.module.scss';
import AppInitializer from '../InitializeData/AppInitializer';

const UserEditor: React.FC = () => {
  // 1. Все хуки состояния и хранилища в начале
  const dispatch = useDispatch<AppDispatch>();
  const {
    users,
    filteredUsers,
    selectedUser,
    loading,
    initialized
  } = useSelector((state: RootState) => state.users);
  
  const [editedUser, setEditedUser] = useState(selectedUser);

  // 2. Мемоизированные значения
  const displayUsers = useMemo(() => 
    filteredUsers.length > 0 ? filteredUsers : users,
    [filteredUsers, users]
  );

  // 3. Все обработчики с useCallback
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

  // 4. Эффекты в конце
  useEffect(() => {
    setEditedUser(selectedUser);
  }, [selectedUser]);

  // 5. Компонент строки должен быть стабильным
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
  }, [displayUsers, selectedUser, handleUserClick, styles]);

  // Ранний возврат должен быть перед любыми хуками
  if (!initialized || loading) {
    return <AppInitializer />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.userList}>
        <FixedSizeList
          height={window.innerHeight}
          itemCount={displayUsers.length}
          itemSize={80}
          width="100%"
          overscanCount={10}
        >
          {UserRow}
        </FixedSizeList>
      </div>

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