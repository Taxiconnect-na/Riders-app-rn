/**
 * Taxiconnect riders app official
 *
 * @format
 * @flow strict-local
 */
import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import HomeReducer from './Components/Redux/Reducers/HomeReducer';
import {NavigationContainer} from '@react-navigation/native';
import RootScreens from './Navigation/RootScreens';
import config from './Components/Helpers/config';
import StorageManager from './Components/Helpers/StorageManager';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
//import {LogBox} from 'react-native';

//LogBox.ignoreAllLogs();

//Initiate the storage
StorageManager('init');

MapboxGL.setAccessToken(config.get('accessToken'));
MapboxGL.removeCustomHeader('Authorization');

const store = createStore(HomeReducer);

const App: () => React$Node = () => {
  let persistor = persistStore(store);

  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NavigationContainer>
            <RootScreens />
          </NavigationContainer>
        </PersistGate>
      </Provider>
    </>
  );
};

export default App;
