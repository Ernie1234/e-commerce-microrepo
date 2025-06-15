import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api/axiosInstance';

const fetchUser = async () => {
  const res = await api.get('/auth/api/v1//logged-in-user');
  console.log(res.data);
  return res.data.data;
};

const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
  return {
    user,
    isLoading,
    isError,
    refetch,
  };
};

export default useUser;
