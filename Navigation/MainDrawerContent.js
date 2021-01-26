import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import HeaderDrawerContent from './HeaderDrawerContent';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';

export function MainDrawerContent(props) {
  return (
    <SafeAreaView style={{flex: 1}}>
      <HeaderDrawerContent />
      <ScrollView style={styles.menuContent}>
        <TouchableOpacity
          onPress={() => props.navigation.navigate('YourRidesEntry_drawer')}
          style={[styles.menuItem, {paddingTop: 30}]}>
          <Text style={styles.menuTitles}>Your rides</Text>
          <IconMaterialIcons
            name="keyboard-arrow-right"
            color="#a5a5a5"
            size={20}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => props.navigation.navigate('Wallet_drawer')}
          style={[styles.menuItem, {paddingTop: 10}]}>
          <Text style={styles.menuTitles}>Wallet</Text>
          <IconMaterialIcons
            name="keyboard-arrow-right"
            color="#a5a5a5"
            size={20}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => props.navigation.navigate('SettingsEntryScreen')}
          style={[styles.menuItem, {paddingTop: 10}]}>
          <Text style={styles.menuTitles}>Settings</Text>
          <IconMaterialIcons
            name="keyboard-arrow-right"
            color="#a5a5a5"
            size={20}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => props.navigation.navigate('Support_drawer')}
          style={[styles.menuItem, {paddingTop: 10, borderBottomWidth: 0}]}>
          <Text style={styles.menuTitles}>Support</Text>
          <IconMaterialIcons
            name="keyboard-arrow-right"
            color="#a5a5a5"
            size={20}
          />
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.footerDrawer}>
        <Text
          style={{
            fontFamily: 'Allrounder-Grotesk-Regular',
            fontSize: 15,
            flex: 1,
          }}>
          Legal
        </Text>
        <Text
          style={{
            fontFamily: 'Allrounder-Grotesk-Book',
            fontSize: 14,
            flex: 1,
            color: '#a5a5a5',
            textAlign: 'right',
          }}>
          v2.1.238
        </Text>
      </View>
    </SafeAreaView>
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
    fontFamily: 'Allrounder-Grotesk-Regular',
    fontSize: 20,
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
