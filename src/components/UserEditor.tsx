import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import styles from './UserEditor.module.scss';
import AppInitializer from '../InitializeData/AppInitializer';
import UserList from './user_list/UsersList';
import UserEditing from './editing_user/EditingUser';

const UserEditor: React.FC = () => {
  const { loading, initialized, selectedUser } = useSelector((state: RootState) => state.users);

  if (!initialized || loading) {
    return <AppInitializer />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.listContainer}>
        <UserList />
      </div>
      <div className={styles.editorContainer}>
        {selectedUser ? (
          <UserEditing />
        ) : (
          <div className={styles.noSelection}>
            Выберите пользователя для редактирования
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(UserEditor);