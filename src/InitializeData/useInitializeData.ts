import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUsers } from '../store/usersSlice'; 

export const useInitializeData = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const USER_COUNT = 2500000; 

  useEffect(() => {
    const worker = new Worker(new URL('../MOCK_SERVER_DATA', import.meta.url));
    
    worker.postMessage({ count: USER_COUNT });
    
    worker.onmessage = (e) => {
      if (e.data) {
        dispatch(setUsers(e.data)); 
        setLoading(false);
        worker.terminate();
      }
    };

    return () => worker.terminate();
  }, [dispatch]);

  return { loading };
};