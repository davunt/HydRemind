import { createTheme } from '@rneui/themed';

export default createTheme({
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
