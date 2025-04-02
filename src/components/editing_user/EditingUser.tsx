import React, { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateUser, selectUser } from '../../store/usersSlice';
import styles from './EditingUser.module.scss';

const UserEditing: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser, loading } = useSelector((state: RootState) => state.users);
  const [editedUser, setEditedUser] = useState(selectedUser);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationTimer, setNotificationTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setEditedUser(selectedUser);
  }, [selectedUser]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (notificationTimer) {
        clearTimeout(notificationTimer);
      }
    };
  }, [notificationTimer]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => prev ? { ...prev, [name]: value } : null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editedUser) return;

    setShowNotification(true);
    
    try {
      await dispatch(updateUser(editedUser)).unwrap();
      
      // Устанавливаем таймер на 2 секунды для скрытия уведомления
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 2000);
      
      setNotificationTimer(timer);
    } catch (error) {
      // В случае ошибки скрываем уведомление сразу
      setShowNotification(false);
    }
  }, [dispatch, editedUser]);

  const handleClose = useCallback(() => {
    dispatch(selectUser(null));
  }, [dispatch]);

  if (!selectedUser || !editedUser) {
    return <div className={styles.editorPanel}>Выберите пользователя для редактирования</div>;
  }

  return (
    <div className={styles.editorPanel}>
      <div className={styles.header}>
        <h2>Редактирование профиля</h2>
        <button 
          onClick={handleClose}
          className={styles.closeButton}
          aria-label="Закрыть редактор"
        >
          &times;
        </button>
      </div>
      
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

      <div className={styles.buttons}>
        <button 
          onClick={handleSave}
          disabled={loading}
          className={styles.saveButton}
        >
          {loading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>

      {showNotification && (
        <div className={styles.notification}>
          Данные успешно отправлены на сервер
        </div>
      )}
    </div>
  );
};

export default React.memo(UserEditing);