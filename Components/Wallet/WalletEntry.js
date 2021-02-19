import React from 'react';
import {connect} from 'react-redux';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import WalletTransacRecords from './WalletTransacRecords';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {RFValue} from 'react-native-responsive-fontsize';
import FastImage from 'react-native-fast-image';
import {FlatList} from 'react-native-gesture-handler';

class WalletEntry extends React.PureComponent {
  constructor(props) {
    super(props);

    this._isMounted = true; //! RESPONSIBLE TO LOCK PROCESSES IN THE MAIN SCREEN WHEN UNMOUNTED.

    //Handlers
    this.backHander = null;
    this._navigatorEvent = null;
  }

  componentWillUnmount() {
    this._isMounted = false; //! MARK AS UNMOUNTED
    //...
    /*if (this.backHander !== null) {
      this.backHander.remove();
    }
    //...
    if (this._navigatorEvent != null) {
      this._navigatorEvent();
      this._navigatorEvent = null;
    }*/
  }

  componentDidMount() {
    let globalObject = this;
    this._isMounted = true;

    //? Add navigator listener - auto clean on focus
    globalObject.props.navigation.addListener('focus', () => {
      console.log('focused');
    });

    //Add home going back handler-----------------------------
    this._navigatorEvent = this.props.navigation.addListener(
      'beforeRemove',
      (e) => {
        // Prevent default behavior of leaving the screen
        e.preventDefault();
        globalObject.props.navigation.navigate('Home_drawer');
        return;
      },
    );
    //--------------------------------------------------------
    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        globalObject.props.navigation.navigate('Home_drawer');
        return true;
      },
    );
  }

  render() {
    return (
      <>
        {this._isMounted ? (
          <DismissKeyboard>
            <View style={styles.mainWindow}>
              <StatusBar backgroundColor="#000" />
              <View style={styles.presentationWindow}>
                <View
                  style={{
                    padding: 20,
                    backgroundColor: '#0e8491',
                    height: 200,
                    marginBottom: 15,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      flex: 1,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        flex: 1,
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        fontSize: RFValue(17),
                        color: '#fff',
                      }}>
                      Hey, {this.props.App.username}
                    </Text>
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 200,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 7,
                        },
                        shadowOpacity: 0.41,
                        shadowRadius: 9.11,

                        elevation: 14,
                      }}>
                      {this.props.App.user_profile_pic !== undefined &&
                      this.props.App.user_profile_pic !== null &&
                      !/user\.png/i.test(this.props.App.user_profile_pic) ? (
                        <FastImage
                          source={{
                            uri: this.props.App.user_profile_pic,
                            priority: FastImage.priority.normal,
                          }}
                          resizeMode={FastImage.resizeMode.cover}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 150,
                          }}
                        />
                      ) : (
                        <Image
                          source={require('../../Media_assets/Images/user.png')}
                          style={{
                            resizeMode: 'contain',
                            width: '60%',
                            height: '80%',
                            borderRadius: 0,
                          }}
                        />
                      )}
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={[
                        {
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'MoveBold'
                              : 'Uber Move Bold',
                          fontSize: RFValue(37),
                          color: '#fff',
                        },
                      ]}>
                      {`N$${
                        this.props.App.wallet_state_vars.totalWallet_amount !==
                          undefined &&
                        this.props.App.wallet_state_vars.totalWallet_amount !==
                          null
                          ? this.props.App.wallet_state_vars.totalWallet_amount
                          : 0
                      }`}
                    </Text>
                    <Text
                      style={{
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextRegular'
                            : 'Uber Move Text',
                        color: '#d0d0d0',
                        fontSize: RFValue(16),
                      }}>
                      Your balance
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    backgroundColor: '#fff',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      padding: 20,
                    }}>
                    {/**Send money */}
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate('SendFundsEntry')
                      }
                      style={{alignItems: 'center', marginRight: '11%'}}>
                      <View
                        style={[
                          styles.selectMenu3,
                          {
                            backgroundColor: '#000',
                            borderWidth: 0,
                          },
                        ]}>
                        <IconFeather name="share" size={30} color={'#fff'} />
                      </View>
                      <Text style={[styles.textSelectMenu3, {color: '#000'}]}>
                        Send
                      </Text>
                    </TouchableOpacity>

                    {/**Top-up wallet */}
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate('WalletTopUpEntry')
                      }
                      style={{alignItems: 'center', marginRight: '11%'}}>
                      <View
                        style={[
                          styles.selectMenu3,
                          {
                            backgroundColor: '#000',
                            borderWidth: 0,
                          },
                        ]}>
                        <IconMaterialIcons
                          name="account-balance-wallet"
                          size={30}
                          color={'#fff'}
                        />
                      </View>
                      <Text style={[styles.textSelectMenu3, {color: '#000'}]}>
                        Top-up
                      </Text>
                    </TouchableOpacity>

                    <View
                      style={[
                        styles.selectMenu3,
                        {borderWidth: 2, opacity: 0},
                      ]}>
                      <IconMaterialIcons name="shield" size={30} />
                      <Text style={styles.textSelectMenu3}>Secure</Text>
                    </View>
                  </View>
                  <View style={{padding: 20, flex: 1}}>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate(
                          'ShowAllTransactionsEntry',
                        )
                      }
                      style={{
                        flexDirection: 'row',
                        paddingBottom: 10,
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                          fontSize: RFValue(18),
                          color: '#AFAFAF',
                          paddingBottom: 15,
                          flex: 1,
                        }}>
                        Last transaction
                      </Text>
                      {this.props.App.wallet_state_vars.transactions_details !==
                        undefined &&
                      this.props.App.wallet_state_vars.transactions_details !==
                        null &&
                      this.props.App.wallet_state_vars
                        .transactions_details[0] !== undefined &&
                      this.props.App.wallet_state_vars
                        .transactions_details[0] !== null &&
                      this.props.App.wallet_state_vars.transactions_details
                        .length > 0 ? (
                        <Text
                          style={[
                            {
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextMedium'
                                  : 'Uber Move Text Medium',
                              fontSize: RFValue(17.5),
                              color: '#757575',
                              paddingBottom: 15,
                            },
                          ]}>
                          Show all
                        </Text>
                      ) : null}
                    </TouchableOpacity>

                    <View style={{flex: 1}}>
                      {this.props.App.wallet_state_vars.transactions_details !==
                        undefined &&
                      this.props.App.wallet_state_vars.transactions_details !==
                        null &&
                      this.props.App.wallet_state_vars
                        .transactions_details[0] !== undefined &&
                      this.props.App.wallet_state_vars
                        .transactions_details[0] !== null &&
                      this.props.App.wallet_state_vars.transactions_details
                        .length > 0 ? (
                        <FlatList
                          data={[
                            this.props.App.wallet_state_vars
                              .transactions_details[0],
                          ]}
                          keyboardShouldPersistTaps={'always'}
                          keyExtractor={(item, index) => item + index}
                          renderItem={({item}) => (
                            <WalletTransacRecords transactionDetails={item} />
                          )}
                        />
                      ) : (
                        <View
                          style={{
                            height: '30%',
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <IconMaterialIcons
                            name="info"
                            color={'#757575'}
                            size={18}
                          />
                          <Text
                            style={{
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextRegular'
                                  : 'Uber Move Text',
                              fontSize: RFValue(17),
                              color: '#757575',
                              marginLeft: 5,
                            }}>
                            No transactions yet.
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </DismissKeyboard>
        ) : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  mainWindow: {
    flex: 1,
    backgroundColor: '#0e8491',
  },
  presentationWindow: {
    flex: 1,
  },
  selectMenu3: {
    borderWidth: 1,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 300,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
  textSelectMenu3: {
    fontFamily:
      Platform.OS === 'android'
        ? 'UberMoveTextMedium'
        : 'Uber Move Text Medium',
    fontSize: RFValue(17),
    marginTop: 15,
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default React.memo(connect(mapStateToProps)(WalletEntry));
