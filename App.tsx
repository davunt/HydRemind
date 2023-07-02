import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme, useThemeMode } from '@rneui/themed';
import { Platform, AppState, View, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import theme from './theme';

import MainScreen from './src/screens/main/main';

import { addHydrationStat } from './storage/dailyHydration';

interface ColorSchemeProps {
    children: ReactElement;
}

const ColorScheme = ({ children }: ColorSchemeProps) => {
    const colorMode = useColorScheme() || 'light';
    const { theme } = useTheme();
    const { setMode } = useThemeMode();

    React.useEffect(() => {
        console.log(colorMode);
        setMode(colorMode);
    }, [colorMode]);

    return (
        <View
            style={{
                flex: 1,
                flexDirection: 'column',
                backgroundColor: theme.colors.background,
            }}
        >
            {children}
        </View>
    );
};

export default function App() {
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(false);

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
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                setAppStateVisible(true);
            }

            if (nextAppState === 'background') {
                setAppStateVisible(false);
            }
        });

        registerForNotificationsAsync().then(() => {
            responseListener.current = Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    if (response.actionIdentifier === 'hydrated') {
                        addHydrationStat(response.notification.request.content.data.time);
                    }
                }
            );
        });

        return () => {
            subscription.remove();

            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }

            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider theme={theme}>
                <ColorScheme>
                    <SafeAreaProvider>
                        <SafeAreaView
                            style={{
                                flex: 1,
                                flexDirection: 'column',
                            }}
                        >
                            <BottomSheetModalProvider>
                                <MainScreen appStateVisible={appStateVisible} />
                            </BottomSheetModalProvider>
                        </SafeAreaView>
                    </SafeAreaProvider>
                </ColorScheme>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
