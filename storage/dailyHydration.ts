import AsyncStorage from '@react-native-async-storage/async-storage';
import { signal } from '@preact/signals-react';
import { DateTime } from 'luxon';

const hydrationKeyPrefix = '@hydration-';

export const todaysHydrationSig = signal({});

export const addHydrationStat = async (time: string) => {
    try {
        let todaysHydration: {} = (await getTodaysHydration()) || {};
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
        todaysHydration = (await getTodaysHydration()) || {};

        todaysHydrationSig.value = todaysHydration;
    } catch (err) {
        console.error(err);
    }
};

export const removeHydrationStat = async (time: string) => {
    try {
        let todaysHydration: {} = (await getTodaysHydration()) || {};
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

export const getTodaysHydration = async () => {
    try {
        const todaysHydrationArrayString: string =
            (await AsyncStorage.getItem(
                `${hydrationKeyPrefix}${DateTime.now().toLocaleString()}`
            )) ?? '{}';

        const todaysHydration: {} = JSON.parse(todaysHydrationArrayString);
        todaysHydrationSig.value = todaysHydration;

        return todaysHydration;
    } catch (err) {
        console.error(err);
    }
};
