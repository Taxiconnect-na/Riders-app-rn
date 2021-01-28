import React from 'react';
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
import {systemWeights} from 'react-native-typography';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import {TextInput} from 'react-native-gesture-handler';
import DismissKeyboard from '../Helpers/DismissKeyboard';

class SendFundsInputAmount extends React.PureComponent {
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
          <StatusBar backgroundColor="#000" />
          <View style={styles.presentationWindow}>
            <Text
              style={[
                systemWeights.semibold,
                {
                  fontSize: 21,
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'Allrounder-Grotesk-Regular'
                      : 'Allrounder Grotesk',
                  marginBottom: 35,
                  marginTop: 10,
                },
              ]}>
              How much?
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 0.5,
                borderRadius: 3,
                padding: 10,
                borderColor: '#d0d0d0',
              }}>
              <Text
                style={{
                  fontSize: 19,
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'Allrounder-Grotesk-Medium'
                      : 'Allrounder Grotesk Medium',
                  paddingLeft: 10,
                  paddingRight: 5,
                }}>
                N$
              </Text>
              <TextInput
                style={{
                  fontSize: 19,
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'Allrounder-Grotesk-Medium'
                      : 'Allrounder Grotesk Medium',
                  flex: 1,
                }}
                placeholder="Amount"
                keyboardType="number-pad"
                autoFocus
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: '8%',
                alignItems: 'center',
                width: '100%',
              }}>
              <View
                style={{
                  marginRight: 5,
                  justifyContent: 'flex-start',
                  height: '100%',
                }}>
                <IconAnt name="infocirlce" color="#0e8491" size={17} />
              </View>
              <Text
                style={[
                  {
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'Allrounder-Grotesk-Book'
                        : 'Allrounder Grotesk Book',
                    color: '#000',
                    fontSize: 15,
                    lineHeight: 20,
                    flex: 1,
                  },
                ]}>
                Your maximum amount is{' '}
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'Allrounder-Grotesk-Medium'
                        : 'Allrounder Grotesk Medium',
                  }}>
                  N$1000.
                </Text>
              </Text>
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
                      fontSize: 13.5,
                      marginLeft: 6,
                      lineHeight: 18,
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'Allrounder-Grotesk-Book'
                          : 'Allrounder Grotesk Book',
                    },
                  ]}>
                  Visit to the{' '}
                  <Text
                    style={{
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'Allrounder-Grotesk-Medium'
                          : 'Allrounder Grotesk Medium',
                    }}>
                    Support
                  </Text>{' '}
                  tab for any queries.
                </Text>
              </View>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate('SendFundsConfirmation')
                  }
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
  root: {flex: 1, padding: 20},
  title: {textAlign: 'center', fontSize: 30},
  codeFieldRoot: {marginTop: 20},
  cell: {
    flex: 1,
    height: 40,
    lineHeight: 38,
    marginRight: 20,
    fontSize: 25,
    borderBottomWidth: 2,
    borderColor: '#00000030',
    textAlign: 'center',
  },
  focusCell: {
    borderColor: '#000',
  },
});

export default SendFundsInputAmount;
