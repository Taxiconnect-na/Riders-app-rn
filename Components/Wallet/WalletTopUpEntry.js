import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import DismissKeyboard from '../Helpers/DismissKeyboard';

class WalletTopUpEntry extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;
  }

  componentWillUnmount() {
    if (this.backHander !== null) {
      this.backHander.remove();
    }
  }

  componentDidMount() {
    let globalObject = this;
    //--------------------------------------------------------
    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        globalObject.props.navigation.goBack();
        return true;
      },
    );
  }

  render() {
    return (
      <DismissKeyboard>
        <SafeAreaView style={styles.mainWindow}>
          <View style={styles.presentationWindow}>
            <ScrollView style={{flex: 1}}>
              <View style={{flex: 1}}>
                <View style={{flex: 1}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      borderBottomWidth: 0.5,
                      borderBottomColor: '#a5a5a5',
                      padding: 20,
                      paddingTop: 30,
                    }}>
                    <IconMaterialIcons
                      name="account-balance-wallet"
                      size={30}
                      color={'#096ED4'}
                    />
                    <Text
                      style={[
                        {
                          fontSize: 19.5,
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'Allrounder-Grotesk-Regular'
                              : 'Allrounder Grotesk Regular',
                          marginLeft: 5,
                          flex: 1,
                        },
                      ]}>
                      Your wallet
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'Allrounder-Grotesk-Medium'
                            : 'Allrounder Grotesk Medium',
                        color: '#096ED4',
                      }}>
                      N${this.props.App.wallet_state_vars.totalWallet_amount}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderBottomWidth: 0.5,
                      paddingBottom: '10%',
                      borderBottomColor: '#a5a5a5',
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'Allrounder-Grotesk-Book'
                            : 'Allrounder Grotesk Book',
                        color: '#a5a5a5',
                        padding: 20,
                        paddingBottom: 10,
                      }}>
                      Top up with
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate('EnterTopupAmountScreen')
                      }
                      style={{marginTop: 15}}>
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
                            fontSize: 18,
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'Allrounder-Grotesk-Regular'
                                : 'Allrounder Grotesk Regular',
                          }}>
                          Credit card
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'Allrounder-Grotesk-Book'
                            : 'Allrounder Grotesk Book',
                        color: '#a5a5a5',
                        padding: 20,
                        paddingBottom: 10,
                      }}>
                      Preferred payment method
                    </Text>
                    <View style={{marginTop: 15}}>
                      <TouchableOpacity
                        onPress={() =>
                          this.props.App.wallet_state_vars
                            .totalWallet_amount === 0
                            ? {}
                            : this.props.App.customFareTripSelected !== false
                            ? this.props.App.customFareTripSelected <=
                              this.props.App.wallet_state_vars
                                .totalWallet_amount
                              ? this.props.UpdatePreferredPayment_method(
                                  'wallet',
                                )
                              : this.props.UpdatePreferredPayment_method('cash')
                            : this.props.App.fareTripSelected <=
                              this.props.App.wallet_state_vars
                                .totalWallet_amount
                            ? this.props.UpdatePreferredPayment_method('wallet')
                            : this.props.UpdatePreferredPayment_method('cash')
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 20,
                          paddingTop: 0,
                          paddingBottom: 5,
                          marginBottom: 20,
                          opacity:
                            this.props.App.wallet_state_vars
                              .totalWallet_amount === 0
                              ? 0.15
                              : 1,
                        }}>
                        <View style={{width: 40}}>
                          <IconMaterialIcons name="credit-card" size={32} />
                        </View>
                        <Text
                          style={{
                            fontSize: 18,
                            flex: 1,
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'Allrounder-Grotesk-Regular'
                                : 'Allrounder Grotesk Regular',
                          }}>
                          Wallet
                        </Text>
                        {this.props.App.wallet_state_vars.totalWallet_amount ===
                        0 ? null : /wallet/i.test(
                            this.props.App.wallet_state_vars
                              .selectedPayment_method,
                          ) ? (
                          <IconCommunity
                            name="check-circle"
                            size={25}
                            style={{top: 1}}
                            color={'#096ED4'}
                          />
                        ) : null}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          this.props.UpdatePreferredPayment_method('cash');
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 20,
                          paddingBottom: 10,
                          borderTopWidth: 0.5,
                          borderTopColor: '#d0d0d0',
                        }}>
                        <View style={{width: 40}}>
                          <IconCommunity
                            name="cash-usd"
                            color={'#000'}
                            size={32}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 18,
                            flex: 1,
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'Allrounder-Grotesk-Regular'
                                : 'Allrounder Grotesk Regular',
                          }}>
                          Cash
                        </Text>
                        {this.props.App.wallet_state_vars.totalWallet_amount ===
                        0 ? null : /cash/i.test(
                            this.props.App.wallet_state_vars
                              .selectedPayment_method,
                          ) ? (
                          <IconCommunity
                            name="check-circle"
                            size={25}
                            style={{top: 1}}
                            color={'#096ED4'}
                          />
                        ) : null}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                paddingLeft: 20,
                paddingRight: 20,
                height: 100,
              }}>
              <TouchableOpacity
                onPress={() => {}}
                style={{
                  borderColor: 'transparent',
                  width: '100%',
                  justifyContent: 'center',
                }}>
                <View style={[styles.bttnGenericTc]}>
                  <Text
                    style={[
                      {
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'Allrounder-Grotesk-Medium'
                            : 'Allrounder Grotesk Medium',
                        fontSize: 23,
                        color: '#fff',
                      },
                    ]}>
                    Done
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </DismissKeyboard>
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
    borderRadius: 5,
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

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default connect(mapStateToProps)(WalletTopUpEntry);
