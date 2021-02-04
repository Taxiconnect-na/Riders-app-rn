/* eslint-disable prettier/prettier */
import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet, Platform} from 'react-native';
import {systemWeights} from 'react-native-typography';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import {RFValue} from 'react-native-responsive-fontsize';

class WalletTransacRecords extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableOpacity style={styles.mainRecord}>
        <View>
          <IconCommunity
            name="square"
            size={6}
            style={{top: 10, marginRight: 7}}
          />
        </View>
        <View style={{flex: 1}}>
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android'
                  ? 'UberMoveTextMedium'
                  : 'Uber Move Text Medium',
              fontSize: RFValue(17),
            }}>
            Top-up
          </Text>
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android'
                  ? 'UberMoveTextRegular'
                  : 'Uber Move Text',
              color: '#a5a5a5',
              fontSize: RFValue(16),
              marginTop: 5,
            }}>
            Today at 15:45
          </Text>
        </View>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',

            width: 55,
          }}>
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android'
                  ? 'UberMoveTextMedium'
                  : 'Uber Move Text Medium',
              fontSize: RFValue(18),
              color: '#0e8491',
            }}>
            N$50
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  mainRecord: {
    padding: 15,
    flexDirection: 'row',
    borderRadius: 3,
    marginBottom: 13,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#d0d0d0',
  },
});

export default WalletTransacRecords;
