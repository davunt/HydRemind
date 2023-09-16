import AsyncStorage from '@react-native-async-storage/async-storage';
import { signal } from '@preact/signals-react';
import { DateTime } from 'luxon';

const hydrationKeyPrefix = '@hydration-';

export const todaysHydrationSig = signal({});

export const getTodaysHydration = async (): Promise<object> => {
  try {
    const todaysHydrationArrayString: string =
      (await AsyncStorage.getItem(`${hydrationKeyPrefix}${DateTime.now().toLocaleString()}`)) ??
      '{}';

    const todaysHydration: object = JSON.parse(todaysHydrationArrayString);
    todaysHydrationSig.value = todaysHydration;

    return todaysHydration;
  } catch (err) {
    console.error(err);
    return {};
  }
};

export const addHydrationStat = async (time: string): Promise<undefined> => {
  try {
    let todaysHydration: object = await getTodaysHydration();

    if (Object.keys(todaysHydration).length < 1) {
      await AsyncStorage.setItem(
        `${hydrationKeyPrefix}${DateTime.now().toLocaleString()}`,
        JSON.stringify({
          [time]: true,
        })
      );
    } else {
      await AsyncStorage.mergeItem(
        `${hydrationKeyPrefix}${DateTime.now().toLocaleString()}`,
        JSON.stringify({
          [time]: true,
        })
      );
    }
    todaysHydration = await getTodaysHydration();

    todaysHydrationSig.value = todaysHydration;
  } catch (err) {
    console.error(err);
  }
};

export const removeHydrationStat = async (time: string): Promise<undefined> => {
  try {
    const todaysHydration: Record<string, any> = await getTodaysHydration();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete todaysHydration[time];

    await AsyncStorage.setItem(
      `${hydrationKeyPrefix}${DateTime.now().toLocaleString()}`,
      JSON.stringify(todaysHydration)
    );

    todaysHydrationSig.value = { ...todaysHydration };
  } catch (err) {
    console.error(err);
  }
};

export const clearTodaysHydrationStats = async (): Promise<undefined> => {
  try {
    await AsyncStorage.removeItem(`${hydrationKeyPrefix}${DateTime.now().toLocaleString()}`);
    todaysHydrationSig.value = {};
  } catch (err) {
    console.error(err);
  }
};
