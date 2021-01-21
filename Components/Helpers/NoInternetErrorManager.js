/**
 * Responsible for triggering no Internet connection in the whole app
 */

import NetInfo from '@react-native-community/netinfo';

const NoInternetErrorManager = () => {
  NetInfo.addEventListener((state) => {});
};

export default NoInternetErrorManager;
