import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import FastImage from 'react-native-fast-image';

class AdManager extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableOpacity
        onPress={() => Linking.openURL('https://www.taxiconnectna.com/')}
        style={[
          styles.mainContainer,
          {
            marginBottom:
              this.props.marginBottom !== undefined
                ? this.props.marginBottom
                : 0,
            marginLeft:
              this.props.paddingLeft !== undefined ? this.props.paddingLeft : 0,
            paddingBottom:
              this.props.paddingBottom !== undefined
                ? this.props.paddingBottom
                : 0,
            bottom: this.props.bottom !== undefined ? this.props.bottom : 0,
            justifyContent:
              this.props.iconOnly === undefined || this.props.iconOnly === false
                ? 'flex-start'
                : 'center',
          },
        ]}>
        <View style={styles.logoContainer}>
          <FastImage
            source={{
              uri:
                'https://ads-central-tc.s3-us-west-1.amazonaws.com/Company-Logos/1519912805429.png',
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.contain}
            style={{width: '100%', height: '100%'}}
          />
        </View>
        {this.props.iconOnly === undefined || this.props.iconOnly === false ? (
          <View style={styles.textsContainer}>
            <Text style={styles.bigText}>Bank Windhoek</Text>
            <Text style={styles.descText}>First bank in Namibia</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    height: '100%',
    width: 50,
    marginRight: '1%',
    backgroundColor: '#fff',
  },
  textsContainer: {
    flex: 1,
  },
  bigText: {
    fontFamily:
      Platform.OS === 'android'
        ? 'UberMoveTextMedium'
        : 'Uber Move Text Medium',
    fontSize: RFValue(12),
  },
  descText: {
    fontFamily:
      Platform.OS === 'android' ? 'UberMoveTextLight' : 'Uber Move Text Light',
    fontSize: RFValue(12),
  },
});

export default React.memo(AdManager);
