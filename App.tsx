import React, { ReactElement, useEffect, useRef } from 'react';
import { ThemeProvider, useTheme, useThemeMode } from '@rneui/themed';
import { Platform, StyleSheet, SafeAreaView, Appearance, View } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import theme from './theme';

import MainScreen from './src/screens/main/main';

interface ColorSchemeProps {
    children: ReactElement;
}

const ColorScheme = ({ children }: ColorSchemeProps) => {
    const colorMode = Appearance.getColorScheme() || 'light';
    const { theme } = useTheme();
    const { setMode } = useThemeMode();

    React.useEffect(() => {
        setMode(colorMode);
    }, [colorMode]);

    return <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>{children}</View>;
};

export default function App() {
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });

    async function registerForNotificationsAsync() {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
        } else {
            alert('Must use physical device for Push Notifications');
        }
    }

    useEffect(() => {
        registerForNotificationsAsync().then(() => {
            notificationListener.current = Notifications.addNotificationReceivedListener(
                (notification) => {
                    console.log('notification!');
                }
            );

            responseListener.current = Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    console.log(response);
                }
            );
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }

            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <ColorScheme>
                <SafeAreaView style={styles.container}>
                    <MainScreen />
                </SafeAreaView>
            </ColorScheme>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
});
