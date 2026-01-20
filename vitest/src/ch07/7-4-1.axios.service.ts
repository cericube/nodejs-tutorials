import axios from 'axios';

export const fetchUserData = async (id: number) => {
  const response = await axios.get(`https://api.example.com/users/${id}`);
  return response.data;
};
