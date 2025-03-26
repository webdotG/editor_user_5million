import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import styles from './AppInitializer.module.scss';

const AppInitializer: React.FC = () => {
  const { loading, loadProgress } = useSelector((state: RootState) => state.users);

  return loading ? (
    <div className={styles.loader}>
      <div className={styles.spinner}></div>
      <p>Generating 7.5M users... {Math.round(loadProgress)}%</p>
      <div className={styles.progressBar}>
        <div 
          className={styles.progress} 
          style={{ width: `${loadProgress}%` }}
        ></div>
      </div>
    </div>
  ) : null;
};

export default AppInitializer;