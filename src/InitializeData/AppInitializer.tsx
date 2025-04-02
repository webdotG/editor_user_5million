import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchUsers } from '../store/usersSlice';
import styles from './AppInitializer.module.scss';

const AppInitializer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('AppInitializer: starting data load');
    dispatch(fetchUsers({
      page: 0,
      size: 50,
      filters: {},
      sortField: 'name',
      sortDirection: 'asc'
    }));
  }, [dispatch]);

  return (
    <div className={styles.loader}>
      <div className={styles.spinner}></div>
      <p>Loading initial data...</p>
    </div>
  );
};

export default AppInitializer;