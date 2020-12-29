import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {systemWeights} from 'react-native-typography';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';

class WalletTopUpEntry extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={styles.mainWindow}>
        <View style={styles.presentationWindow}>
          <View style={{flex: 1}}>
            <View
              style={{
                flexDirection: 'row',
                borderBottomWidth: 0.5,
                borderBottomColor: '#a5a5a5',
                padding: 20,
              }}>
              <IconMaterialIcons
                name="account-balance-wallet"
                size={30}
                color={'#000'}
              />
              <Text
                style={[
                  systemWeights.semibold,
                  {
                    fontSize: 19,
                    fontFamily: 'Allrounder-Grotesk-Book',
                    marginLeft: 5,
                    flex: 1,
                  },
                ]}>
                Wallet
              </Text>
              <Text
                style={{
                  fontSize: 19,
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  color: '#096ED4',
                }}>
                N$70
              </Text>
            </View>
            <View
              style={{
                borderBottomWidth: 0.5,
                paddingBottom: '15%',
                borderBottomColor: '#a5a5a5',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Allrounder-Grotesk-Book',
                  color: '#a5a5a5',
                  padding: 20,
                  paddingBottom: 0,
                }}>
                Top up with
              </Text>
              <View style={{marginTop: 15}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 20,
                    paddingTop: 0,
                    paddingBottom: 10,
                  }}>
                  <View style={{width: 40}}>
                    <IconAnt name="creditcard" size={28} />
                  </View>
                  <Text
                    style={{
                      fontSize: 17,
                      fontFamily: 'Allrounder-Grotesk-Book',
                    }}>
                    Credit card
                  </Text>
                </View>
              </View>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Allrounder-Grotesk-Book',
                  color: '#a5a5a5',
                  padding: 20,
                  paddingBottom: 0,
                }}>
                Preferred payment method
              </Text>
              <View style={{marginTop: 15}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 20,
                    paddingTop: 0,
                    paddingBottom: 25,
                  }}>
                  <View style={{width: 40}}>
                    <IconMaterialIcons name="credit-card" size={32} />
                  </View>
                  <Text
                    style={{
                      fontSize: 17,
                      flex: 1,
                      fontFamily: 'Allrounder-Grotesk-Book',
                    }}>
                    Wallet
                  </Text>
                  <IconCommunity
                    name="check-circle"
                    size={25}
                    style={{top: 1}}
                    color={'#096ED4'}
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 20,
                    paddingTop: 0,
                    paddingBottom: 10,
                  }}>
                  <View style={{width: 40}}>
                    <IconCommunity name="cash-usd" color={'green'} size={32} />
                  </View>
                  <Text
                    style={{
                      fontSize: 17,
                      flex: 1,
                      fontFamily: 'Allrounder-Grotesk-Book',
                    }}>
                    Cash
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View
            style={{
              width: '100%',
              alignItems: 'center',
              height: 100,
              paddingLeft: 20,
              paddingRight: 20,
            }}>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: 'transparent',
                width: '100%',
              }}>
              <View style={[styles.bttnGenericTc]}>
                <Text
                  style={[
                    //systemWeights.semibold,
                    {
                      fontFamily: 'Allrounder-Grotesk-Medium',
                      fontSize: 21,
                      fontWeight: 'bold',
                      color: '#fff',
                    },
                  ]}>
                  Confirm preferences
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  mainWindow: {
    flex: 1,
    backgroundColor: '#fff',
  },
  presentationWindow: {
    flex: 1,
  },
  arrowCircledForwardBasic: {
    backgroundColor: '#0e8491',
    width: 60,
    height: 60,
    borderRadius: 10000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowButtonArrowCircledForward: {
    shadowColor: '#d0d0d0',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.6,

    elevation: 6,
  },
  bttnGenericTc: {
    borderColor: '#000',
    padding: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#000',
    borderRadius: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,

    elevation: 3,
  },
});

export default WalletTopUpEntry;
