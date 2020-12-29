/**
 * Responsible for triggering no Internet connection in the whole app
 */

import NetInfo from '@react-native-community/netinfo';

const NoInternetErrorManager = () => {
  NetInfo.addEventListener((state) => {
    console.log('Connection type', state.type);
    console.log('Is connected?', state.isConnected);
  });
};

export default NoInternetErrorManager;
