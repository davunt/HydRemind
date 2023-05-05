import { createTheme } from '@rneui/themed';

export default createTheme({
    lightColors: {
        background: '#FAF9F6',
    },
    darkColors: {
        background: '#121212',
    },
    components: {
        Button: {
            radius: 10,
        },
        Card: {
            containerStyle: {
                borderRadius: 10,
            },
        },
    },
});