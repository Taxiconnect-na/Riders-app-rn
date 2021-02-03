import React from 'react';
import {View, Text, Platform, StyleSheet} from 'react-native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
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
import TopUpWalletScreen from '../Components/Wallet/TopUpWalletScreen';
import EnterTopupAmountScreen from '../Components/Wallet/EnterTopupAmountScreen';
import Home from '../Components/Home/Home';
import YourRidesEntry from '../Components/Rides/YourRidesEntry';
import HeaderRideTypesSelector from '../Components/Rides/HeaderRideTypesSelector';
import DetailsRidesGenericScreen from '../Components/Rides/DetailsRidesGenericScreen';
import SettingsEntryScreen from '../Components/Settings/SettingsEntryScreen';
import PersonalinfosEntryScreen from '../Components/Settings/PersonalinfosEntryScreen';
import OTPVerificationGeneric from '../Components/Settings/OTPVerificationGeneric';
import SupportEntry from '../Components/Support/SupportEntry';
import {MainDrawerContent} from './MainDrawerContent';
import {RFValue} from 'react-native-responsive-fontsize';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const styles = StyleSheet.create({
  genericHeader: {
    fontFamily:
      Platform.OS === 'android' ? 'UberMoveTextRegular' : 'Uber Move Text',
    fontSize: RFValue(20),
    right: Platform.OS === 'android' ? 20 : 0,
    color: '#fff',
  },
});

//a. Your rides screens
function YourRidesEntry_drawer() {
  return (
    <Stack.Navigator
      initialRouteName="YourRidesEntry"
      screenOptions={{...TransitionPresets.ScaleFromCenterAndroid}}>
      <Stack.Screen
        name="YourRidesEntry"
        component={YourRidesEntry}
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
          headerTitle: (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingRight: 10,
              }}>
              <Text style={styles.genericHeader}>Your requests</Text>
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
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.genericHeader}>Details</Text>
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
    <Stack.Navigator
      initialRouteName="WalletEntry"
      screenOptions={{...TransitionPresets.ScaleFromCenterAndroid}}>
      <Stack.Screen
        name="WalletEntry"
        component={WalletEntry}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 0,
          },
          headerTintColor: '#000',
          headerBackTitle: 'Back',
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'Allrounder-Grotesk-Medium'
                      : 'Allrounder Grotesk Medium',
                  fontSize: 21,
                  right: Platform.OS === 'android' ? 20 : 0,
                  color: '#000',
                }}>
                Connect Wallet
              </Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="SendFundsEntry"
        component={SendFundsEntry}
        options={{
          headerShown: true,
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.genericHeader}>Transfer funds</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="PayTaxiInputNumber"
        component={PayTaxiInputNumber}
        options={{
          headerShown: true,
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.genericHeader}>Pay a driver</Text>
            </View>
          ),
        }}
      />

      <Stack.Screen
        name="EnterTopupAmountScreen"
        component={EnterTopupAmountScreen}
        options={{
          headerShown: true,
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.genericHeader}>Top-up amount</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="SendFundsConfirmation"
        component={SendFundsConfirmation}
        options={{
          headerShown: true,
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.genericHeader}>Confirmation</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="TopUpWalletScreen"
        component={TopUpWalletScreen}
        options={{
          headerShown: false,
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.genericHeader}>Top-up your wallet</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="SendFundsFriendInputNumber"
        component={SendFundsFriendInputNumber}
        options={{
          headerShown: true,
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.genericHeader}>Transfer funds</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="SendFundsInputAmount"
        component={SendFundsInputAmount}
        options={{
          headerShown: true,
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.genericHeader}>Transfer funds</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="WalletTopUpEntry"
        component={WalletTopUpEntry}
        options={{
          headerShown: true,
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.genericHeader}>Payment settings</Text>
            </View>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

//c. Support
function Support_drawer() {
  return (
    <Stack.Navigator
      initialRouteName="SupportEntry"
      screenOptions={{...TransitionPresets.ScaleFromCenterAndroid}}>
      <Stack.Screen
        name="SupportEntry"
        component={SupportEntry}
        options={{
          headerShown: true,
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.genericHeader}>Support</Text>
            </View>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

function SettingsDrawer_navigator() {
  return (
    <Stack.Navigator
      initialRouteName="SettingsEntryScreen"
      screenOptions={{...TransitionPresets.ScaleFromCenterAndroid}}>
      <Stack.Screen
        name="SettingsEntryScreen"
        component={SettingsEntryScreen}
        options={{
          headerShown: true,
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.genericHeader}>Settings</Text>
            </View>
          ),
        }}
      />

      <Stack.Screen
        name="PersonalinfosEntryScreen"
        component={PersonalinfosEntryScreen}
        options={{
          headerShown: true,
          headerStyle: {backgroundColor: '#000'},
          headerTintColor: '#fff',
          headerBackTitle: 'Back',
          headerTitle: (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.genericHeader}>Personal information</Text>
            </View>
          ),
        }}
      />

      <Stack.Screen
        name="OTPVerificationGeneric"
        component={OTPVerificationGeneric}
        options={{
          headerShown: false,
          headerBackTitle: 'Back',
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
      screenOptions={{...TransitionPresets.ScaleFromCenterAndroid}}
      drawerContent={(props) => <MainDrawerContent {...props} />}>
      <Drawer.Screen name="Home_drawer" component={Home} />
      <Drawer.Screen
        name="YourRidesEntry_drawer"
        component={YourRidesEntry_drawer}
        options={{headerShown: false, headerMode: 'none'}}
      />
      <Drawer.Screen name="Wallet_drawer" component={Wallet_drawer} />
      <Drawer.Screen
        name="SettingsEntryScreen"
        component={SettingsDrawer_navigator}
      />
      <Drawer.Screen name="Support_drawer" component={Support_drawer} />
    </Drawer.Navigator>
  );
}

function RootScreens() {
  return (
    <Stack.Navigator
      initialRouteName={'EntryScreen'}
      screenOptions={{...TransitionPresets.ScaleFromCenterAndroid}}>
      <Stack.Screen
        name="EntryScreen"
        component={EntryScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CreateAccountEntry"
        component={CreateAccountEntry}
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
