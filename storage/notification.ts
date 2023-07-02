import AsyncStorage from '@react-native-async-storage/async-storage';

// const daysKey = '@days';
const timesKey = '@times';
const intervalKey = '@intervals';

export const saveNotificationConfig = async (times: [], interval: number) => {
    try {
        // const daysArrayString = JSON.stringify(days);
        const timesArrayString = JSON.stringify(times);
        await Promise.all([
            // AsyncStorage.setItem(daysKey, daysArrayString),
            AsyncStorage.setItem(timesKey, timesArrayString),
            AsyncStorage.setItem(intervalKey, interval.toString()),
        ]);
    } catch (err) {
        console.error(err);
    }
};

export const getNotificationConfig = async () => {
    try {
        // const daysArrayString: string = (await AsyncStorage.getItem(daysKey)) ?? '[]';
        const timesArrayString: string = (await AsyncStorage.getItem(timesKey)) ?? '[]';
        const interval: string = (await AsyncStorage.getItem(intervalKey)) ?? '';

        if (!timesArrayString || !interval) return false;

        // const days: [] = JSON.parse(daysArrayString);
        const times: [] = JSON.parse(timesArrayString);

        return {
            // days,
            times,
            interval: parseInt(interval),
        };
    } catch (err) {
        console.error(err);
    }
};
