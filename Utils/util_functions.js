import AsyncStorage from '@react-native-async-storage/async-storage';

export const setStorage = async (key,value) => {
    try {AsyncStorage
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error('Error storing :', error);
      }
};

export const getStorage = async (key) => {
    try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error('Error retrieving :', error);
        return null;
      }
};

export const removeStorage = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing :', error);
      }
};

export const removeAll = async () => {
  try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error removing :', error);
    }
};