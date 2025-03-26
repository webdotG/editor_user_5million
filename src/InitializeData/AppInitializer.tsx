import React from 'react';
import { useInitializeData } from './useInitializeData';
import styles from './AppInitializer.module.scss';

const AppInitializer: React.FC = () => {
  const { loading } = useInitializeData();

  if (!loading) return null;

  return (
    <div className={styles.loader}>
      <div className={styles.spinner} />
      <p>Generating 1M users...</p>
    </div>
  );
};

export default AppInitializer;