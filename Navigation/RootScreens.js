import React from 'react';
import {View, Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator, DrawerContent} from '@react-navigation/drawer';
import IconAnt from 'react-native-vector-icons/AntDesign';
import EntryScreen from '../Components/Login/EntrySreen';
import PhoneDetailsScreen from '../Components/Login/PhoneDetailsScreen';
import OTPVerificationEntry from '../Components/Login/OTPVerificationEntry';
import CreateAccountEntry from '../Components/Login/CreateAccountEntry';
import NewAccountAdditionalDetails from '../Components/Login/NewAccountAdditionalDetails';
import WalletEntry from '../Components/Wallet/WalletEntry';
import SendFundsEntry from '../Components/Wallet/SendFundsEntry';
import PayTaxiInputNumber from '../Components/Wallet/PayTaxiInputNumber';
import SendFundsInputAmount from '../Components/Wallet/SendFundsInputAmount';
import SendFundsConfirmation from '../Components/Wallet/SendFundsConfirmation';
import SendFundsFriendInputNumber from '../Components/Wallet/SendFundsFriendInputNumber';
import WalletTopUpEntry from '../Components/Wallet/WalletTopUpEntry';
import Home from '../Components/Home/Home';
import YourRidesEntry from '../Components/Rides/YourRidesEntry';
import HeaderRideTypesSelector from '../Components/Rides/HeaderRideTypesSelector';
import DetailsRidesGenericScreen from '../Components/Rides/DetailsRidesGenericScreen';
import {MainDrawerContent} from './MainDrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

//a. Your rides screens
function YourRidesEntry_drawer() {
  return (
    <Stack.Navigator initialRouteName="YourRidesEntry">
      <Stack.Screen
        name="YourRidesEntry"
        component={YourRidesEntry}
        options={{
          headerShown: true,
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <IconAnt name="arrowleft" size={25} style={{top: 1}} />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 18,
                  marginLeft: 5,
                }}>
                Your rides
              </Text>
            </View>
          ),
          headerRight: () => <HeaderRideTypesSelector />,
        }}
      />
      <Stack.Screen
        name="DetailsRidesGenericScreen"
        component={DetailsRidesGenericScreen}
        options={{
          headerShown: true,
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 18,
                  right: 20,
                }}>
                Details
              </Text>
            </View>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

//b. Wallet screens
function Wallet_drawer() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="EntryScreen"
        component={WalletEntry}
        options={{
          headerShown: true,
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <IconAnt name="arrowleft" size={25} style={{top: 1}} />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 18,
                  marginLeft: 5,
                }}>
                Connect Wallet
              </Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="EntryScreen"
        component={SendFundsEntry}
        options={{
          headerShown: true,
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <IconAnt name="arrowleft" size={25} style={{top: 1}} />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 18,
                  marginLeft: 5,
                }}>
                Transfer funds
              </Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="EntryScreen"
        component={PayTaxiInputNumber}
        options={{
          headerShown: true,
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <IconAnt name="arrowleft" size={25} style={{top: 1}} />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 18,
                  marginLeft: 5,
                }}>
                Pay a driver
              </Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="EntryScreen"
        component={SendFundsFriendInputNumber}
        options={{
          headerShown: true,
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <IconAnt name="arrowleft" size={25} style={{top: 1}} />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 18,
                  marginLeft: 5,
                }}>
                Transfer funds
              </Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="EntryScreen"
        component={WalletTopUpEntry}
        options={{
          headerShown: true,
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <IconAnt name="arrowleft" size={25} style={{top: 1}} />
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 18,
                  marginLeft: 5,
                }}>
                Payment settings
              </Text>
            </View>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

//1. MAIN SCREEN DRAWER NAVIGATOR
function MainDrawer_navigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home_drawer"
      drawerContent={(props) => <MainDrawerContent {...props} />}>
      <Drawer.Screen name="Home_drawer" component={Home} />
      <Drawer.Screen
        name="YourRidesEntry_drawer"
        component={YourRidesEntry_drawer}
      />
      <Drawer.Screen name="Wallet_drawer" component={Wallet_drawer} />
    </Drawer.Navigator>
  );
}

function RootScreens() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="EntryScreen"
        component={EntryScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PhoneDetailsScreen"
        component={PhoneDetailsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="OTPVerificationEntry"
        component={OTPVerificationEntry}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CreateAccountEntry"
        component={CreateAccountEntry}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="NewAccountAdditionalDetails"
        component={NewAccountAdditionalDetails}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Home"
        component={MainDrawer_navigator}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

export default RootScreens;
