import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUsers } from '../store/usersSlice';

export const useInitializeData = (count: number = 1000000) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const worker = new Worker(new URL('../utils/dataGenerator.worker.ts', import.meta.url));
    
    worker.postMessage({ count });
    
    worker.onmessage = (e) => {
      dispatch(setUsers(e.data));
      setLoading(false);
      worker.terminate();
    };

    return () => worker.terminate();
  }, [dispatch, count]);

  return { loading };
};