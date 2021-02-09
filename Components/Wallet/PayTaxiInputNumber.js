import React, {useState} from 'react';
import {connect} from 'react-redux';
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
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import IconAnt from 'react-native-vector-icons/AntDesign';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {RFValue} from 'react-native-responsive-fontsize';

const App = ({valueM, parentNode}) => {
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({value, cellCount: 6});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <View style={styles.root}>
      <CodeField
        ref={ref}
        {...props}
        value={valueM.length > 0 ? valueM : value}
        onChangeText={setValue}
        onChange={(event) =>
          parentNode.autoUpdaterThePaymentNumber(event.nativeEvent.text)
        }
        autoFocus
        cellCount={6}
        rootStyle={styles.codeFieldRoot}
        textContentType="oneTimeCode"
        renderCell={({index, symbol, isFocused}) =>
          Platform.OS === 'android' ? (
            <Text
              key={index}
              style={[styles.cell, isFocused && styles.focusCell]}
              onLayout={getCellOnLayoutHandler(index)}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          ) : (
            <View
              key={index}
              style={[styles.cell, isFocused && styles.focusCell]}>
              <Text
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

class PayTaxiInputNumber extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;
    this._navigatorEvent = null;

    this.state = {
      paymentNumber: '', //The value of the taxi number or payment number - default: ''
      showErrorMessage: false, //To know whether to show an error message or not - default: false
      errorType: 'codeTooShort', //The type of error to display the message for - can be: too short or empty
      errorMessageContent: `The code is too short`, //The error message to display - default: AS SET
    };
  }

  componentWillUnmount() {
    if (this.backHander !== null) {
      this.backHander.remove();
    }
    //...
    if (this._navigatorEvent !== null) {
      this._navigatorEvent();
      this._navigatorEvent = null;
    }
  }

  componentDidMount() {
    let globalObject = this;

    //? Add navigator listener - auto clean on focus
    this._navigatorEvent = globalObject.props.navigation.addListener(
      'focus',
      () => {
        globalObject.props.App.paymentNumberOrTaxiNumber = null; //! CLEAR THE GLOBAL PAYMENT NUMBER VARIABLE.
        globalObject.setState({
          paymentNumber: '',
          showErrorMessage: false,
        });
      },
    );

    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        globalObject.props.navigation.goBack();
        return true;
      },
    );
  }

  /**
   * @func autoUpdaterThePaymentNumber
   * Responsible for updating the Taxi number or payment number
   * @param paymentNumber: the payment number value received
   */
  autoUpdaterThePaymentNumber(paymentNumber) {
    this.setState({
      paymentNumber: paymentNumber.toUpperCase(),
      showErrorMessage: false,
    });
  }

  /**
   * @func validDate_paymentNumberFormat
   * Responsible for checking that the taxi number or payment number has the right format.
   * And auto move forward to checking the driver screen.
   */
  validDate_paymentNumberFormat() {
    if (this.state.paymentNumber.trim().length > 1) {
      //Good
      //! Update the global payment number
      this.props.App.paymentNumberOrTaxiNumber = this.state.paymentNumber;
      //? Move to checking
      this.props.navigation.navigate('CheckPhoneOrTaxiNumber');
    } else if (this.state.paymentNumber.trim().length === 0) {
      //Empty
      this.setState({
        showErrorMessage: true,
        errorType: 'EmptyCode',
        errorMessageContent: 'Please fill before proceeding',
      });
    } else if (this.state.paymentNumber.trim().length === 1) {
      this.setState({
        showErrorMessage: true,
        errorType: 'codeTooShort',
        errorMessageContent: 'The code is too short',
      });
    }
  }

  render() {
    return (
      <DismissKeyboard>
        <SafeAreaView style={styles.mainWindow}>
          <StatusBar backgroundColor="#000" />
          <View style={styles.presentationWindow}>
            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={{width: '30%'}}>
              <IconAnt name="arrowleft" size={29} />
            </TouchableOpacity>
            <Text
              style={[
                {
                  fontSize: RFValue(21),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text',
                  marginBottom: 35,
                  marginTop: 15,
                },
              ]}>
              What's the taxi number?
            </Text>
            <View>
              <App valueM={this.state.paymentNumber} parentNode={this} />

              {this.state.showErrorMessage ? (
                /codeTooShort/i.test(this.state.errorType) ? (
                  <View style={{marginTop: '25%'}}>
                    <Text
                      style={[
                        {
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                          color: '#b22222',
                          fontSize: RFValue(17),
                        },
                      ]}>
                      {this.state.errorMessageContent}
                    </Text>
                  </View>
                ) : (
                  <View style={{marginTop: '25%'}}>
                    <Text
                      style={[
                        {
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                          color: '#b22222',
                          fontSize: RFValue(17),
                        },
                      ]}>
                      {this.state.errorMessageContent}
                    </Text>
                  </View>
                )
              ) : null}
            </View>

            <View
              style={{
                flexDirection: 'row',
                position: 'absolute',
                bottom: '10%',
                left: 20,
                right: 20,
                width: '100%',
              }}>
              <View style={{flexDirection: 'row', flex: 1}}>
                <Text
                  style={[
                    {
                      fontSize: RFValue(14),
                      marginLeft: 6,
                      lineHeight: 18,
                      color: '#141414',
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                    },
                  ]}>
                  Note that you can also use the driver's{' '}
                  <Text style={{fontWeight: 'bold', color: '#0e8491'}}>
                    payment number
                  </Text>{' '}
                  instead.
                </Text>
              </View>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <TouchableOpacity
                  onPress={() => this.validDate_paymentNumberFormat()}
                  style={[
                    styles.arrowCircledForwardBasic,
                    styles.shadowButtonArrowCircledForward,
                  ]}>
                  <IconMaterialIcons
                    name="arrow-forward-ios"
                    size={30}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
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
  root: {flex: 1},
  title: {textAlign: 'center', fontSize: 30},
  codeFieldRoot: {marginTop: 10},
  cell: {
    flex: 1,
    height: 40,
    lineHeight: 38,
    marginRight: 10,
    fontSize: 25,
    borderBottomWidth: 2,
    borderColor: '#00000030',
    textAlign: 'center',
  },
  focusCell: {
    borderColor: '#000',
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default React.memo(connect(mapStateToProps)(PayTaxiInputNumber));
