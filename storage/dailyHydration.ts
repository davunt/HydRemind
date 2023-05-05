import AsyncStorage from '@react-native-async-storage/async-storage';
import { signal } from '@preact/signals-react';

import { DateTime } from 'luxon';

const hydrationKeyPrefix = '@hydration-';

export const todaysHydrationSig = signal({});

const test = {
    '13:00': true,
};

export const setH = () => {
    todaysHydrationSig.value = {
        '21:45': true,
        '17:13': true,
        '13:00': true,
        '21:47': true,
        '21:46': true,
        '15:00': true,
    };
};

export const setTodaysHydration = async (time) => {
    try {
        // await AsyncStorage.removeItem(`${hydrationKeyPrefix}${DateTime.now().toLocaleString()}`);
        let todaysHydration = await getTodaysHydration();
        console.log('p', todaysHydration);
        if (todaysHydration.length < 1) {
            console.log('in here2');
            await AsyncStorage.setItem(
                `${hydrationKeyPrefix}${DateTime.now().toLocaleString()}`,
                JSON.stringify({
                    [time]: true,
                })
            );
        } else {
            console.log('in here');
            await AsyncStorage.mergeItem(
                `${hydrationKeyPrefix}${DateTime.now().toLocaleString()}`,
                JSON.stringify({
                    [time]: true,
                })
            );
        }
        todaysHydration = await getTodaysHydration();

        console.log('heyyyyy');

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
            )) ?? '[]';

        if (!todaysHydrationArrayString) return false;

        console.log('f', todaysHydrationArrayString);

        const todaysHydration: [] = JSON.parse(todaysHydrationArrayString);
        todaysHydrationSig.value = { ...todaysHydration };

        return todaysHydration;
    } catch (err) {
        console.error(err);
    }
};
