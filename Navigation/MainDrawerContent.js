import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';

export function MainDrawerContent(props) {
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.headerDrawer}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 160,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,

            elevation: 10,
          }}>
          <IconAnt name="user" size={30} />
        </View>
        <View style={{flex: 1}}>
          <Text
            style={{
              fontFamily: 'Allrounder-Grotesk-Medium',
              fontSize: 18,
              width: '100%',
              textAlign: 'left',
              paddingLeft: 10,
              paddingRight: 10,
              color: '#fff',
            }}>
            Dominique
          </Text>
          <View
            style={{
              flexDirection: 'row',
              paddingLeft: 10,
              paddingRight: 10,
              marginTop: 5,
              width: '100%',
              alignItems: 'center',
            }}>
            <IconMaterialIcons name="location-on" color="#fff" size={16} />
            <Text
              style={{
                fontFamily: 'Allrounder-Grotesk-Regular',
                fontSize: 14,
                textAlign: 'center',
                color: '#ffff',
              }}>
              Windhoek, Namibia
            </Text>
          </View>
        </View>
      </View>
      <ScrollView style={styles.menuContent}>
        <TouchableOpacity
          onPress={() => props.navigation.navigate('YourRidesEntry_drawer')}
          style={[styles.menuItem, {paddingTop: 30}]}>
          <Text style={styles.menuTitles}>Your rides</Text>
        </TouchableOpacity>
        <View
          onPress={() => props.navigation.navigate('Wallet_drawer')}
          style={[styles.menuItem, {paddingTop: 15}]}>
          <Text style={styles.menuTitles}>Wallet</Text>
        </View>
        <View style={[styles.menuItem, {paddingTop: 15}]}>
          <Text style={styles.menuTitles}>Settings</Text>
        </View>
        <View style={[styles.menuItem, {paddingTop: 15}]}>
          <Text style={styles.menuTitles}>Support</Text>
        </View>
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
          v2.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerDrawer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    backgroundColor: '#01101F',
    flexDirection: 'row',
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuItem: {
    padding: 20,
  },
  menuTitles: {fontFamily: 'Allrounder-Grotesk-Medium', fontSize: 19},
  footerDrawer: {
    borderTopWidth: 0.5,
    borderTopColor: '#d0d0d0',
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
});
