import React from 'react';
import {connect} from 'react-redux';
import {View, Text, StyleSheet, Image, Platform} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import FastImage from 'react-native-fast-image';

class HeaderDrawerContent extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.headerDrawer}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 160,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,

            elevation: 10,
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
              source={require('../Media_assets/Images/user.png')}
              style={{
                resizeMode: 'contain',
                width: '60%',
                height: '80%',
                borderRadius: 0,
              }}
            />
          )}
        </View>
        <View style={{flex: 1}}>
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android'
                  ? 'UberMoveTextMedium'
                  : 'Uber Move Text Medium',
              fontSize: RFValue(19),
              width: '100%',
              textAlign: 'left',
              paddingLeft: 10,
              paddingRight: 10,
              color: '#fff',
            }}>
            {this.props.App.username !== null &&
            this.props.App.username !== false &&
            this.props.App.username.length === 0
              ? '...'
              : this.props.App.username}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              paddingLeft: 10,
              paddingRight: 10,
              width: '100%',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextRegular'
                    : 'Uber Move Text',
                fontSize: RFValue(15),
                textAlign: 'center',
                color: '#ffff',
              }}>
              {this.props.App.userCurrentLocationMetaData.city !== undefined &&
              this.props.App.userCurrentLocationMetaData.city !== false
                ? this.props.App.userCurrentLocationMetaData.city
                : this.props.App.userCurrentLocationMetaData.street !==
                    undefined &&
                  this.props.App.userCurrentLocationMetaData.street !== false
                ? this.props.App.userCurrentLocationMetaData.street
                : this.props.App.userCurrentLocationMetaData.country !==
                    undefined &&
                  this.props.App.userCurrentLocationMetaData.country !== false
                ? this.props.App.userCurrentLocationMetaData.country
                : null}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerDrawer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    backgroundColor: '#0e8491',
    flexDirection: 'row',
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default React.memo(connect(mapStateToProps)(HeaderDrawerContent));
