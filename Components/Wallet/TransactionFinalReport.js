import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Platform,
} from 'react-native';
import {UpdateErrorModalLog} from '../Redux/HomeActionsCreators';
import IconAnt from 'react-native-vector-icons/AntDesign';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {RFValue} from 'react-native-responsive-fontsize';
import GenericLoader from '../Modules/GenericLoader/GenericLoader';

class TransactionFinalReport extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;
    this._navigatorEvent = null;

    this.state = {
      isWorking: false, //TO know whether the transaction is still loading or not
      hasFoundSomeErrors: true, //TO know whether the checking process was failed or not - default: false
      errorsNature: null, //? The type of errors found : 3 cases (not active Taxiconnect, active account or another error)
      responseData: null, //Will contain the transaction data data if any
    };
  }

  componentWillUnmount() {
    if (this.backHander !== null) {
      this.backHander.remove();
    }
    if (this._navigatorEvent !== undefined && this._navigatorEvent !== null) {
      this._navigatorEvent();
    }
  }

  componentDidMount() {
    let globalObject = this;

    //? Add navigator listener - auto clean on focus
    this._navigatorEvent = globalObject.props.navigation.addListener(
      'focus',
      () => {
        console.log('focused');
        globalObject.makeTransaction(); //! AUTO MAKE THE TRANSACTION THE RECIPIENT
        globalObject.setState({
          isWorking: true,
          hasFoundSomeErrors: false,
          errorsNature: null,
          responseData: null,
        });
      },
    );

    //connection
    this.props.App.socket.on('connect', () => {
      globalObject.props.UpdateErrorModalLog(false, false, 'any');
    });

    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        return;
      },
    );

    /**
     * SOCKET EVENTS HANDLERS
     */
    /**
     * Handle the response of the transaction process.
     * event: getRiders_walletInfos_io
     * ? Have 3 case : successfull, unsufficient funds or general error
     */
    this.props.App.socket.on(
      'makeWallet_transaction_io-response',
      function (response) {
        console.log('HERE -->', response);
        if (
          response !== undefined &&
          response !== null &&
          response.response !== undefined &&
          response.response !== null &&
          /successful/i.test(response.response)
        ) {
          globalObject.setState({
            responseData: response,
            isWorking: false,
            hasFoundSomeErrors: false,
            errorsNature: null,
          }); //? Make sure the close the loader
        } //Transaction error
        else {
          globalObject.setState({
            isWorking: false,
            hasFoundSomeErrors: true,
            responseData: null,
            errorsNature:
              response.flag !== undefined && response.flag !== null
                ? response.flag
                : 'general_error_network_maybe',
          });
        }
      },
    );
  }

  /**
   * @func makeTransaction
   * Responsible for launching the transaction proccess.
   */
  makeTransaction() {
    if (/friend/i.test(this.props.App.user_sender_nature)) {
      //To friend and family
      if (
        this.props.App.user_sender_nature !== undefined &&
        /verified/i.test(this.props.App.recipient_crucial_data.response) &&
        this.props.App.recipient_crucial_data.recipient_number !== undefined &&
        this.props.App.recipient_crucial_data.recipient_number !== null &&
        this.props.App.recipient_crucial_data.amount !== undefined &&
        this.props.App.recipient_crucial_data.amount !== null
      ) {
        //Valid  user nature : friend / driver
        if (this.props.App.recipient_crucial_data.recipient_number !== false) {
          //Start the loader
          this.setState({
            isWorking: true,
            hasFoundSomeErrors: false,
            errorsNature: null,
            responseData: null,
          });

          let bundleMakeRequest = {
            user_fingerprint: this.props.App.user_fingerprint,
            user_nature: this.props.App.user_sender_nature,
            payNumberOrPhoneNumber: this.props.App.recipient_crucial_data
              .recipient_number,
            amount: this.props.App.recipient_crucial_data.amount,
          };
          console.log(bundleMakeRequest);
          //..
          this.props.App.socket.emit(
            'makeWallet_transaction_io',
            bundleMakeRequest,
          );
        } //Return to choose sending users
        else {
          this.props.navigation.navigate('SendFundsEntry');
        }
      } //Return to choose sending users
      else {
        this.props.navigation.navigate('SendFundsEntry');
      }
    } else if (/driver/i.test(this.props.App.user_sender_nature)) {
      //To drivers
      this.props.App.recipient_crucial_data[
        'recipient_number'
      ] = this.props.App.paymentNumberOrTaxiNumber; //? Upddate the recipient number
      //...
      if (
        this.props.App.user_sender_nature !== undefined &&
        /verified/i.test(this.props.App.recipient_crucial_data.response) &&
        this.props.App.recipient_crucial_data.recipient_number !== undefined &&
        this.props.App.recipient_crucial_data.recipient_number !== null &&
        this.props.App.recipient_crucial_data.amount !== undefined &&
        this.props.App.recipient_crucial_data.amount !== null
      ) {
        //Valid  user nature : friend / driver
        if (this.props.App.recipient_crucial_data.recipient_number !== false) {
          //Start the loader
          this.setState({
            isWorking: true,
            hasFoundSomeErrors: false,
            errorsNature: null,
            responseData: null,
          });

          let bundleMakeRequest = {
            user_fingerprint: this.props.App.user_fingerprint,
            user_nature: this.props.App.user_sender_nature,
            payNumberOrPhoneNumber: this.props.App.recipient_crucial_data
              .recipient_number,
            amount: this.props.App.recipient_crucial_data.amount,
          };
          console.log(bundleMakeRequest);
          //..
          this.props.App.socket.emit(
            'makeWallet_transaction_io',
            bundleMakeRequest,
          );
        } //Return to choose sending users
        else {
          this.props.navigation.navigate('SendFundsEntry');
        }
      } //Return to choose sending users
      else {
        this.props.navigation.navigate('SendFundsEntry');
      }
    } //Invalid data
    else {
      this.props.navigation.navigate('SendFundsEntry');
    }
  }

  render() {
    return (
      <DismissKeyboard>
        <SafeAreaView style={styles.mainWindow}>
          <GenericLoader active={this.state.isWorking} thickness={4} />
          <StatusBar backgroundColor="#000" />
          <View style={styles.presentationWindow}>
            <View style={{flex: 1}}>
              {this.state.isWorking ? (
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '80%',
                  }}>
                  <Text
                    style={{
                      fontSize: RFValue(21),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                      color: '#0e8491',
                    }}>
                    Making the transaction...
                  </Text>
                  <Text
                    style={{
                      fontSize: RFValue(16),
                      marginTop: 10,
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextLight'
                          : 'Uber Move Text Light',
                    }}>
                    All transactions are instantly and VAT free.
                  </Text>
                </View>
              ) : this.state.hasFoundSomeErrors === false ? (
                <>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate('WalletEntry')
                    }
                    style={{width: '30%'}}>
                    <IconAnt name="arrowleft" size={29} />
                  </TouchableOpacity>
                  <View
                    style={{
                      height: '80%',
                      alignItems: 'center',
                      paddingTop: '7%',
                    }}>
                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        padding: 20,
                        paddingBottom: '5%',
                      }}>
                      <Text
                        style={{
                          fontSize: RFValue(22),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'MoveMedium'
                              : 'Uber Move Medium',
                        }}>
                        Transfer successful!
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 200,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                      }}>
                      <IconAnt name="checkcircleo" color="#09864A" size={45} />
                    </View>
                    <Text
                      style={{
                        fontSize: RFValue(20),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                      }}>
                      {`Sent N$${this.props.App.recipient_crucial_data.amount}`}
                    </Text>
                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        marginTop: 10,
                      }}>
                      <Text
                        style={{
                          fontSize: RFValue(16),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                          textAlign: 'left',
                          color: '#09864A',
                        }}>
                        Your transaction was successful.
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.goBack()}
                    style={{width: '30%'}}>
                    <IconAnt name="arrowleft" size={29} />
                  </TouchableOpacity>
                  <View
                    style={{
                      flex: 1,
                      paddingTop: '7%',
                    }}>
                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        paddingBottom: 20,
                        flexDirection: 'row',
                      }}>
                      <IconAnt
                        name="closecircleo"
                        size={20}
                        color={'#b22222'}
                      />
                      <Text
                        style={{
                          fontSize: RFValue(21),
                          marginLeft: 5,
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextMedium'
                              : 'Uber Move Text Medium',
                        }}>
                        Transaction failed
                      </Text>
                    </View>

                    <View
                      style={{
                        width: '100%',
                      }}>
                      {/transaction_error_unsifficient_funds/i.test(
                        this.state.errorsNature,
                      ) ? (
                        <Text
                          style={{
                            fontSize: RFValue(17.5),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextLight'
                                : 'Uber Move Text Light',
                            textAlign: 'left',
                            lineHeight: 23,
                          }}>
                          Sorry it looks like you don't have enough funds in
                          your wallet to make this transaction, please top-up
                          first and try again, visit the{' '}
                          <Text style={{fontWeight: 'bold'}}>Support Tab</Text>{' '}
                          for any assistance.
                        </Text>
                      ) : /transaction_error_want_toSend_toHiHermslef/i.test(
                          this.state.errorsNature,
                        ) ? (
                        <Text
                          style={{
                            fontSize: RFValue(17.5),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextLight'
                                : 'Uber Move Text Light',
                            textAlign: 'left',
                            lineHeight: 23,
                          }}>
                          Sorry it looks like you are trying to make this
                          transaction to yourslef, you cannot perform this kind
                          of action, please visit the{' '}
                          <Text style={{fontWeight: 'bold'}}>Support Tab</Text>{' '}
                          for any assistance.
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: RFValue(17.5),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextLight'
                                : 'Uber Move Text Light',
                            textAlign: 'left',
                            lineHeight: 23,
                          }}>
                          We were unable to complete this transaction due to an
                          unexpected error, please try again much later or visit
                          the{' '}
                          <Text style={{fontWeight: 'bold'}}>Support Tab</Text>{' '}
                          if the error persists.
                        </Text>
                      )}
                    </View>
                  </View>
                </>
              )}
            </View>
            <View style={{}}>
              {this.state.isWorking === false ? (
                <TouchableOpacity
                  onPress={() =>
                    this.state.hasFoundSomeErrors === false
                      ? this.props.navigation.navigate('WalletEntry')
                      : this.props.navigation.goBack()
                  }
                  style={{
                    borderColor: 'transparent',
                    width: '100%',
                    justifyContent: 'center',
                  }}>
                  <View style={[styles.bttnGenericTc]}>
                    {this.state.hasFoundSomeErrors === false ? (
                      <>
                        <Text
                          style={[
                            {
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextMedium'
                                  : 'Uber Move Text Medium',
                              fontSize: RFValue(22),
                              color: '#fff',
                              flex: 1,
                              textAlign: 'center',
                            },
                          ]}>
                          Done
                        </Text>
                      </>
                    ) : (
                      <Text
                        style={[
                          {
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                            fontSize: RFValue(22),
                            color: '#fff',
                            flex: 1,
                            textAlign: 'center',
                          },
                        ]}>
                        Try again
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ) : null}
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
    padding: 20,
  },
  bttnGenericTc: {
    borderColor: '#000',
    padding: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#000',
    borderRadius: 3,
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

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      UpdateErrorModalLog,
    },
    dispatch,
  );

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(TransactionFinalReport),
);
