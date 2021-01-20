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
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

class PayTaxiInputNumber extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={styles.mainWindow}>
        <StatusBar backgroundColor="#000" />
        <View style={styles.presentationWindow}>
          <Text
            style={[
              systemWeights.semibold,
              {
                fontSize: 19,
                fontFamily: 'Allrounder-Grotesk-Book',
                marginBottom: 35,
              },
            ]}>
            What's the taxi number?
          </Text>
          <CodeField
            //ref={ref}
            //value={value}
            //onChangeText={setValue}
            cellCount={5}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({index, symbol, isFocused}) => (
              <Text
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                /*onLayout={getCellOnLayoutHandler(index)}*/
              >
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            )}
          />
          <View
            style={{
              flexDirection: 'row',
              marginTop: '15%',
              alignItems: 'center',
              width: '100%',
            }}>
            <View
              style={{
                marginRight: 5,
                justifyContent: 'flex-start',
                height: '100%',
              }}>
              <IconAnt name="infocirlce" size={17} />
            </View>
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
              Please make sure that the taxi number is accurate before
              proceeding to any transactions.
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
                  systemWeights.light,
                  {fontSize: 12, marginLeft: 6},
                ]}></Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <TouchableOpacity
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

export default PayTaxiInputNumber;
