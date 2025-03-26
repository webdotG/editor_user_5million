import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import UserEditor from './components/UserEditor';
import AppInitializer from './InitializeData/AppInitializer';
import styles from './App.module.scss';
import { fetchUsers } from './store/usersSlice';

const App: React.FC = () => {
  useEffect(() => {
    store.dispatch(fetchUsers(100)); 
  }, []);

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