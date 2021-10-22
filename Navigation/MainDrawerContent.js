import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import HeaderDrawerContent from './HeaderDrawerContent';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {RFValue} from 'react-native-responsive-fontsize';
import AdManager from '../Components/Modules/AdManager/AdManager';

export function MainDrawerContent(props) {
  const propKing = props;

  return (
    <View style={{flex: 1}}>
      <SafeAreaView style={{backgroundColor: '#0e8491'}}>
        <HeaderDrawerContent />
      </SafeAreaView>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView style={styles.menuContent}>
          <TouchableOpacity
            onPress={() =>
              propKing.navigation.navigate('YourRidesEntry_drawer')
            }
            style={[styles.menuItem, {paddingTop: 30}]}>
            <Text style={styles.menuTitles}>Your rides</Text>
            <IconMaterialIcons
              name="keyboard-arrow-right"
              color="#AFAFAF"
              size={20}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => propKing.navigation.navigate('Wallet_drawer')}
            style={[styles.menuItem, {paddingTop: 10}]}>
            <Text style={styles.menuTitles}>Wallet</Text>
            <IconMaterialIcons
              name="keyboard-arrow-right"
              color="#AFAFAF"
              size={20}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => propKing.navigation.navigate('SettingsEntryScreen')}
            style={[styles.menuItem, {paddingTop: 10}]}>
            <Text style={styles.menuTitles}>Settings</Text>
            <IconMaterialIcons
              name="keyboard-arrow-right"
              color="#AFAFAF"
              size={20}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => propKing.navigation.navigate('Referral_drawer')}
            style={[styles.menuItem, {paddingTop: 10}]}>
            <Text style={styles.menuTitles}>Make money</Text>
            <IconMaterialIcons
              name="keyboard-arrow-right"
              color="#AFAFAF"
              size={20}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => propKing.navigation.navigate('Support_drawer')}
            style={[styles.menuItem, {paddingTop: 10, borderBottomWidth: 0}]}>
            <Text style={styles.menuTitles}>Support</Text>
            <IconMaterialIcons
              name="keyboard-arrow-right"
              color="#AFAFAF"
              size={20}
            />
          </TouchableOpacity>
        </ScrollView>
        <AdManager marginBottom={'3%'} paddingLeftBasic={true} />
        <View style={styles.footerDrawer}>
          <Text
            onPress={() =>
              Linking.openURL('https://taxiconnectna.com/privacy.html')
            }
            style={{
              fontFamily:
                Platform.OS === 'android'
                  ? 'UberMoveTextRegular'
                  : 'Uber Move Text',
              fontSize: RFValue(16),
              flex: 1,
            }}>
            Legal
          </Text>
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android'
                  ? 'UberMoveTextRegular'
                  : 'Uber Move Text',
              fontSize: RFValue(15),
              flex: 1,
              color: '#AFAFAF',
              textAlign: 'right',
            }}>
            v2.1.412
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContent: {
    flex: 1,
  },
  menuItem: {
    padding: 20,
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d0d0d0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitles: {
    fontFamily:
      Platform.OS === 'android'
        ? 'UberMoveTextMedium'
        : 'Uber Move Text Medium',
    fontSize: RFValue(20),
    flex: 1,
  },
  footerDrawer: {
    borderTopWidth: 1,
    borderTopColor: '#d0d0d0',
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
});
