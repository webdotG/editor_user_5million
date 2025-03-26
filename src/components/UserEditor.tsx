import React, { useState, useEffect } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useSelector, useDispatch } from 'react-redux';
import { User } from '../types';
import { RootState, AppDispatch } from '../store/store';
import { 
  selectUser, 
  updateUser, 
  setFilterCriteria, 
  setSortConfig,
  filterUsers,
  sortUsers
} from '../store/usersSlice'
import styles from './UserEditor.module.scss';

const UserEditor: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const {
    users,
    filteredUsers,
    selectedUser,
    loading,
    filterCriteria,
    sortConfig
  } = useSelector((state: RootState) => state.users);
  
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const displayUsers = filteredUsers.length > 0 ? filteredUsers : users;

  useEffect(() => {
    if (selectedUser) {
      setEditedUser({ ...selectedUser });
    }
  }, [selectedUser]);

  useEffect(() => {
    if (Object.keys(filterCriteria).length > 0) {
      dispatch(filterUsers({ users, criteria: filterCriteria }));
    }
  }, [filterCriteria, dispatch, users]);

  useEffect(() => {
    if (filteredUsers.length > 0 || Object.keys(filterCriteria).length > 0) {
      dispatch(sortUsers({ 
        users: filteredUsers.length > 0 ? filteredUsers : users,
        field: sortConfig.field, 
        direction: sortConfig.direction 
      }));
    }
  }, [sortConfig, filteredUsers, users, dispatch]);

  const handleUserClick = (user: User) => {
    dispatch(selectUser(user));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleSave = () => {
    if (editedUser) {
      dispatch(updateUser(editedUser));
    }
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(setFilterCriteria({ ...filterCriteria, [name]: value }));
  };
  
  const handleSort = (field: keyof User) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'asc' 
      ? 'desc' 
      : 'asc';
    dispatch(setSortConfig({ field, direction }));
  };

  const UserRow: React.FC<ListChildComponentProps> = ({ index, style }) => {
    const user = displayUsers[index];
    const isSelected = selectedUser?.id === user.id;
    
    return (
      <div 
        style={style}
        className={`${styles['userCard']} ${isSelected ? styles['selected'] : ''}`}
        onClick={() => handleUserClick(user)}
      >
        <div className={styles['userInfo']}>
          <span className={styles['userName']}>{user.name} {user.surname}</span>
          <span className={styles['userDetails']}>Age: {user.age}</span>
          <span className={styles['userDetails']}>Email: {user.email}</span>
          <span className={styles['userDetails']}>Company: {user.company}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles['container']}>
      <div className={styles['controls']}>
        <input
          type="text"
          name="name"
          placeholder="Filter by name"
          onChange={handleFilterChange}
          className={styles['filterInput']}
        />
        <button 
          onClick={() => handleSort('name')}
          className={styles['sortButton']}
        >
          Sort by Name {sortConfig.field === 'name' && `(${sortConfig.direction})`}
        </button>
      </div>
      
      <div className={styles['userList']}>
        {loading ? (
          <div className={styles['loading']}>Processing data...</div>
        ) : (
          <FixedSizeList
            height={window.innerHeight - 100}
            itemCount={displayUsers.length}
            itemSize={120}
            width="100%"
          >
            {UserRow}
          </FixedSizeList>
        )}
      </div>
      
      {selectedUser && editedUser && (
        <div className={styles['editorPanel']}>
          <h2 className={styles['editorTitle']}>Edit User</h2>
          
          <div className={styles['formGroup']}>
            <label className={styles['label']}>Name</label>
            <input
              className={styles['input']}
              type="text"
              name="name"
              value={editedUser.name}
              onChange={handleInputChange}
            />
          </div>
          
          <div className={styles['formGroup']}>
            <label className={styles['label']}>Surname</label>
            <input
              className={styles['input']}
              type="text"
              name="surname"
              value={editedUser.surname}
              onChange={handleInputChange}
            />
          </div>
          
          <div className={styles['formGroup']}>
            <label className={styles['label']}>Age</label>
            <input
              className={styles['input']}
              type="number"
              name="age"
              value={editedUser.age}
              onChange={handleInputChange}
            />
          </div>
          
          <div className={styles['formGroup']}>
            <label className={styles['label']}>Email</label>
            <input
              className={styles['input']}
              type="email"
              name="email"
              value={editedUser.email}
              onChange={handleInputChange}
            />
          </div>
          
          <button 
            className={styles['saveButton']}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserEditor;