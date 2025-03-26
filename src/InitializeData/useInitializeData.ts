import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUsers } from '../store/usersSlice';
import { generateMockUsers } from '../utils/fakerMocData';

export const useInitializeData = (count: number = 1000000) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const users = generateMockUsers(count);
        dispatch(setUsers(users));
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [dispatch, count]);

  return { loading };
};