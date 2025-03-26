import React, { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateUser } from '../../store/usersSlice';
import styles from './EditingUser.module.scss';

const UserEditing: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser, loading } = useSelector((state: RootState) => state.users);
  const [editedUser, setEditedUser] = useState(selectedUser);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    setEditedUser(selectedUser);
  }, [selectedUser]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => prev ? { ...prev, [name]: value } : null);
  }, []);

  const handleSave = useCallback(() => {
    if (editedUser) {
      setShowNotification(true);
      dispatch(updateUser(editedUser))
        .unwrap()
        .finally(() => {
          setShowNotification(false);
        });
    }
  }, [dispatch, editedUser]);

  if (!selectedUser || !editedUser) {
    return <div className={styles.editorPanel}>Выберите пользователя для редактирования</div>;
  }

  return (
    <div className={styles.editorPanel}>
      <h2>Редактирование профиля</h2>
      
      <div className={styles.formGroup}>
        <label>Имя</label>
        <input
          name="name"
          value={editedUser.name}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Фамилия</label>
        <input
          name="surname"
          value={editedUser.surname}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Возраст</label>
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
        {loading ? 'Сохранение...' : 'Сохранить изменения'}
      </button>

      {showNotification && (
        <div className={styles.notification}>
          Данные отправлены на сервер. Ожидайте подтверждения...
        </div>
      )}
    </div>
  );
};

export default React.memo(UserEditing);