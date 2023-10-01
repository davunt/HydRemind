import AsyncStorage from '@react-native-async-storage/async-storage';

const timesKey = '@times';
const intervalKey = '@intervals';

export const saveNotificationConfig = async (
  times: string[],
  interval: number
): Promise<undefined> => {
  try {
    const timesArrayString = JSON.stringify(times);
    await Promise.all([
      AsyncStorage.setItem(timesKey, timesArrayString),
      AsyncStorage.setItem(intervalKey, interval.toString()),
    ]);
  } catch (err) {
    console.error(err);
  }
};

export const getNotificationConfig = async (): Promise<{ times: []; interval: number }> => {
  try {
    const timesArrayString: string = (await AsyncStorage.getItem(timesKey)) ?? '[]';
    const interval: string = (await AsyncStorage.getItem(intervalKey)) ?? '0';

    const times: [] = JSON.parse(timesArrayString);

    return {
      times,
      interval: parseInt(interval),
    };
  } catch (err) {
    console.error(err);
    return { times: [], interval: 0 };
  }
};
