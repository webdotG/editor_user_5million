import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import UserEditor from './components/UserEditor';
import AppInitializer from './InitializeData/AppInitializer';
import styles from './App.module.scss';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className={styles['app']}>
        <AppInitializer />
        <UserEditor />
      </div>
    </Provider>
  );
};

export default App;