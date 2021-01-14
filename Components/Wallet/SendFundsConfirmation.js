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
import {TextInput} from 'react-native-gesture-handler';

class PayDriverConfirmation extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={styles.mainWindow}>
        <View style={styles.presentationWindow}>
          <Text
            style={[
              systemWeights.semibold,
              {
                fontSize: 19,
                fontFamily: 'Allrounder-Grotesk-Medium',
                marginBottom: 25,
              },
            ]}>
            Summary
          </Text>
          <View style={{flex: 1}}>
            <Text
              style={{
                fontSize: 17,
                fontFamily: 'Allrounder-Grotesk-Regular',
                marginBottom: 10,
              }}>
              MR. REINHOLD
            </Text>
            <Text
              style={{
                fontSize: 17,
                fontFamily: 'Allrounder-Grotesk-Medium',
                marginBottom: 15,
                color: '#0e8491',
              }}>
              TAXI H09
            </Text>
            <View style={{marginTop: 20}}>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'Allrounder-Grotesk-Book',
                  marginBottom: 10,
                }}>
                Windhoek, Namibia.
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              marginBottom: 10,
            }}>
            <Text
              style={[
                {
                  fontFamily: 'Allrounder-Grotesk-Book',
                  color: '#0e8491',
                  fontSize: 14,
                  lineHeight: 20,
                  color: '#a5a5a5',
                  flex: 1,
                },
              ]}>
              There will be no VAT or operational charges deducted, every
              transaction is free.
            </Text>
          </View>

          <View
            style={{
              width: '100%',
              alignItems: 'center',
              height: 100,
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
                    {
                      fontFamily: 'Allrounder-Grotesk-Medium',
                      fontSize: 23.5,
                      color: '#fff',
                    },
                  ]}>
                  Proceed - N$50
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

export default PayDriverConfirmation;
