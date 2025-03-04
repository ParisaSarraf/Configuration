// UserQuery.js
import { useMyAxios } from "../utils/Api";

const UserQuery = () => {
  const { myAxios } = useMyAxios();

  const gettAllUser = async () => {
    try {
      const response = await myAxios.get(`/user/get-user/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const createUser = async (userData) => {
    console.log(userData, "userData");

    try {
      const response = await myAxios.post(`/user/add-user/`, userData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await myAxios.delete(`/user/delete-user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const modifyUser = async ({ userId, userData }) => {
    try {
      const response = await myAxios.put(
        `/user/update-user/${userId}`,
        userData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data
    } catch (error) {
      throw error;
    }
  };

  return { gettAllUser, createUser, deleteUser, modifyUser };
};

export default UserQuery;
