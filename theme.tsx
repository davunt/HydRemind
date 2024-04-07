import { createTheme } from '@rneui/themed';

export default createTheme({
  lightColors: {
    primary: '#438eff',
    secondary: '#f6577a',
    background: '#f6f9ff',
  },
  darkColors: {
    background: '#121212',
  },
  components: {
    Button: {
      radius: 10,
      buttonStyle: {
        borderWidth: 2,
      },
      disabledStyle: {
        borderColor: 'grey',
        borderWidth: 0,
      },
    },
    Card: {
      containerStyle: {
        borderRadius: 10,
      },
    },
    BottomSheet: {
      containerStyle: {
        marginBottom: 20,
      },
    },
    ListItem: {
      containerStyle: {
        padding: 20,
      },
    },
  },
});
