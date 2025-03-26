import React from 'react';
import styles from './AppInitializer.module.scss';
import { useSelector } from 'react-redux';

const AppInitializer: React.FC = () => {
  const { loading, loadProgress } = useSelector((state: RootState) => state.users);

  return loading ? (
    <div className={styles.loader}>
      <div className={styles.spinner}></div>
      <p>Loading 7.5M users... {Math.round(loadProgress / 75000)}%</p>
      <div className={styles.progressBar}>
        <div 
          className={styles.progress} 
          style={{ width: `${loadProgress / 75000}%` }}
        ></div>
      </div>
    </div>
  ) : null;
};

export default AppInitializer;