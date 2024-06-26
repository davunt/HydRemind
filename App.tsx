import React, { type ReactElement, useEffect, useRef, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider, useTheme, useThemeMode } from '@rneui/themed';
import { AppState, Platform, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import MainScreen from './src/screens/main/main';
import theme from './theme';

interface WrapperProps {
  children: ReactElement;
}

const ColorSchemeWrapper = ({ children }: WrapperProps): React.ReactElement => {
  const colorMode = useColorScheme() ?? 'light';
  const { theme } = useTheme();
  const { setMode } = useThemeMode();

  React.useEffect(() => {
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

const SafeAreaWrapper = ({ children }: WrapperProps): React.ReactElement => {
  const { theme } = useTheme();

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          flexDirection: 'column',
        }}
        edges={['top', 'left', 'right']}
      >
        {children}
      </SafeAreaView>
      <SafeAreaView
        edges={['bottom']}
        style={{ flex: 0, backgroundColor: theme.colors.white }}
      ></SafeAreaView>
    </>
  );
};

export default function App(): React.ReactElement {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const [appStateVisible, setAppStateVisible] = useState(false);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  useEffect(() => {
    async function registerForNotificationsAsync(): Promise<undefined> {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: theme.lightColors?.primary,
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
        }
      } else {
        alert('Must use physical device for Push Notifications');
      }
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        setAppStateVisible(true);
        void Notifications.dismissAllNotificationsAsync();
      }

      if (nextAppState === 'background') {
        setAppStateVisible(false);
      }
    });

    void registerForNotificationsAsync();

    return () => {
      subscription.remove();

      if (notificationListener.current != null) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }

      if (responseListener.current != null) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <ColorSchemeWrapper>
          <SafeAreaProvider>
            <SafeAreaWrapper>
              <BottomSheetModalProvider>
                <MainScreen appStateVisible={appStateVisible} />
              </BottomSheetModalProvider>
            </SafeAreaWrapper>
          </SafeAreaProvider>
        </ColorSchemeWrapper>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
