/* eslint-disable prettier/prettier */
import React from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import {RFValue} from 'react-native-responsive-fontsize';

class WalletTransacRecords extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.mainRecord}>
        <View>
          <IconCommunity
            name="square"
            size={6}
            style={{top: 7, marginRight: 7}}
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
            {/sentToFriend/i.test(
              this.props.transactionDetails.transaction_nature,
            )
              ? `Sent to ${this.props.transactionDetails.recipient_name}`
              : /topup/i.test(this.props.transactionDetails.transaction_nature)
              ? 'Top-up'
              : /(paidDriver|sentToDriver)/i.test(
                  this.props.transactionDetails.transaction_nature,
                )
              ? `Paid ${this.props.transactionDetails.recipient_name}`
              : /(ride|delivery)/i.test(
                  this.props.transactionDetails.transaction_nature,
                )
              ? `Paid for ${this.props.transactionDetails.transaction_nature.toLowerCase()}`
              : 'Transaction'}
          </Text>
          {/(sentToFriend|paidDriver|sentToDriver|topup)/i.test(
            this.props.transactionDetails.transaction_nature,
          ) ? (
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextRegular'
                    : 'Uber Move Text',
                color: '#545454',
                fontSize: RFValue(15),
                marginTop: 5,
              }}>
              Wallet payment
            </Text>
          ) : /(ride|delivery)/i.test(
              this.props.transactionDetails.transaction_nature,
            ) ? (
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextRegular'
                    : 'Uber Move Text',
                color: '#545454',
                fontSize: RFValue(15),
                marginTop: 5,
              }}>
              {`${this.props.transactionDetails.payment_method[0].toUpperCase()}${this.props.transactionDetails.payment_method
                .substr(1)
                .toLowerCase()} payment`}
            </Text>
          ) : null}
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
            {this.props.transactionDetails.date_made
              .replace(/\//g, '-')
              .replace(' ', ' at ')}
          </Text>
        </View>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 55,
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
            {`N$${this.props.transactionDetails.amount}`}
          </Text>
        </View>
      </View>
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

export default React.memo(WalletTransacRecords);
