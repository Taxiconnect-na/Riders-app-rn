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
  Image,
  BackHandler,
  Platform,
} from 'react-native';
import {UpdatePreferredPayment_method} from '../Redux/HomeActionsCreators';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {RFValue} from 'react-native-responsive-fontsize';
import AdManager from '../Modules/AdManager/AdManager';

class WalletTopUpEntry extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;
  }

  componentWillUnmount() {
    /*if (this.backHander !== null) {
      this.backHander.remove();
    }*/
  }

  componentDidMount() {
    let that = this;
    //--------------------------------------------------------
    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        that.props.navigation.goBack();
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
                      borderBottomWidth: 1,
                      borderBottomColor: '#EEEEEE',
                      padding: 20,
                      paddingTop: 20,
                      alignItems: 'center',
                    }}>
                    <View style={{width: 20, height: 20}}>
                      <Image
                        source={require('../../Media_assets/Images/wallet.png')}
                        style={{
                          resizeMode: 'contain',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flex: 1,
                        marginLeft: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={[
                          {
                            fontSize: RFValue(17),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                            flex: 1,
                          },
                        ]}>
                        Your wallet
                      </Text>
                      <Text
                        style={{
                          fontSize: RFValue(20),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextMedium'
                              : 'Uber Move Text Medium',
                          color: '#096ED4',
                        }}>
                        N${this.props.App.wallet_state_vars.totalWallet_amount}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      borderBottomWidth: 1,
                      paddingBottom: '15%',
                      borderBottomColor: '#EEEEEE',
                    }}>
                    <Text
                      style={{
                        fontSize: RFValue(16),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        color: '#AFAFAF',
                        padding: 20,
                        paddingBottom: 5,
                      }}>
                      Top up with
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate('EnterTopupAmountScreen')
                      }
                      style={{marginTop: 10}}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 20,
                          paddingTop: 0,
                          paddingBottom: 10,
                        }}>
                        <View style={{width: 30, height: 30}}>
                          <Image
                            source={require('../../Media_assets/Images/credit-card.png')}
                            style={{
                              resizeMode: 'contain',
                              width: '100%',
                              height: '100%',
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            marginLeft: 10,
                            fontSize: RFValue(18),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                          }}>
                          Credit or Debit card
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: RFValue(16),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        color: '#AFAFAF',
                        padding: 20,
                        paddingBottom: 5,
                      }}>
                      Preferred method
                    </Text>
                    <View style={{marginTop: 15}}>
                      <TouchableOpacity
                        onPress={() =>
                          this.props.UpdatePreferredPayment_method('wallet')
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 20,
                          paddingTop: 0,
                          paddingBottom: 5,
                          marginBottom: 20,
                        }}>
                        <View style={{width: 30, height: 30}}>
                          <Image
                            source={require('../../Media_assets/Images/wallet.png')}
                            style={{
                              resizeMode: 'contain',
                              width: '100%',
                              height: '100%',
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            marginLeft: 10,
                            flex: 1,
                            fontSize: RFValue(18),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                          }}>
                          Wallet
                        </Text>
                        {/wallet/i.test(
                          this.props.App.wallet_state_vars
                            .selectedPayment_method,
                        ) ? (
                          <IconCommunity
                            name="check"
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
                        }}>
                        <View style={{width: 30, height: 30}}>
                          <Image
                            source={require('../../Media_assets/Images/cash-payment.png')}
                            style={{
                              resizeMode: 'contain',
                              width: '100%',
                              height: '100%',
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            marginLeft: 10,
                            flex: 1,
                            fontSize: RFValue(18),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                          }}>
                          Cash
                        </Text>
                        {/cash/i.test(
                          this.props.App.wallet_state_vars
                            .selectedPayment_method,
                        ) ? (
                          <IconCommunity
                            name="check"
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
          </View>
          <AdManager paddingLeft={20} paddingRight={20} borderRadius={7} />
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
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      UpdatePreferredPayment_method,
    },
    dispatch,
  );

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(WalletTopUpEntry),
);
