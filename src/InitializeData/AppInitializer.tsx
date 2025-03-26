import React from 'react';
import { useInitializeData } from './useInitializeData';
import styles from './AppInitializer.module.scss';

const AppInitializer: React.FC = () => {
  const { loading } = useInitializeData();

  if (!loading) return null;

  return (
    <div className={styles['loader']}>
      <div className={styles['spinner']}></div>
      <p>Loading 3M users...</p>
    </div>
  );
};

export default AppInitializer;