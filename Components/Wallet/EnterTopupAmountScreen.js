import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {systemWeights} from 'react-native-typography';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import {TextInput} from 'react-native-gesture-handler';
import DismissKeyboard from '../Helpers/DismissKeyboard';

class EnterTopupAmountScreen extends React.PureComponent {
  constructor(props) {
    super(props);
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
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  marginBottom: 35,
                  marginTop: 10,
                },
              ]}>
              Voucher amount
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
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  paddingLeft: 10,
                  paddingRight: 5,
                }}>
                N$
              </Text>
              <TextInput
                style={{
                  fontSize: 19,
                  fontFamily: 'Allrounder-Grotesk-Medium',
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
                    fontFamily: 'Allrounder-Grotesk-Book',
                    color: '#000',
                    fontSize: 15,
                    lineHeight: 20,
                    flex: 1,
                  },
                ]}>
                The maximum amount is{' '}
                <Text style={{fontFamily: 'Allrounder-Grotesk-Medium'}}>
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
                      fontFamily: 'Allrounder-Grotesk-Book',
                    },
                  ]}>
                  Your{' '}
                  <Text style={{fontFamily: 'Allrounder-Grotesk-Medium'}}>
                    Purchased voucher
                  </Text>{' '}
                  will be automatically toped-up.
                </Text>
              </View>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate('TopUpWalletScreen')
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

export default EnterTopupAmountScreen;
