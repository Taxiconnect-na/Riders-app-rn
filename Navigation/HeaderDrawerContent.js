import React from 'react';
import {connect} from 'react-redux';
import {View, Text, StyleSheet, Image, Platform} from 'react-native';

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
          <Image
            source={
              this.props.App.user_profile_pic !== undefined &&
              this.props.App.user_profile_pic !== null
                ? {
                    uri: this.props.App.user_profile_pic,
                    cache: 'reload',
                  }
                : require('../Media_assets/Images/user.png')
            }
            style={{
              resizeMode:
                this.props.App.user_profile_pic !== undefined &&
                this.props.App.user_profile_pic !== null
                  ? 'cover'
                  : 'contain',
              width:
                this.props.App.user_profile_pic !== undefined &&
                this.props.App.user_profile_pic !== null
                  ? '100%'
                  : '60%',
              height:
                this.props.App.user_profile_pic !== undefined &&
                this.props.App.user_profile_pic !== null
                  ? '100%'
                  : '80%',
              borderRadius:
                this.props.App.user_profile_pic !== undefined &&
                this.props.App.user_profile_pic !== null
                  ? 200
                  : 0,
            }}
          />
        </View>
        <View style={{flex: 1}}>
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android'
                  ? 'Allrounder-Grotesk-Medium'
                  : 'Allrounder Grotesk Medium',
              fontSize: 18,
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
              marginTop: 5,
              width: '100%',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'Allrounder-Grotesk-Regular'
                    : 'Allrounder Grotesk',
                fontSize: 15,
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
  menuContent: {
    flex: 1,
  },
  menuItem: {
    padding: 20,
    marginBottom: 10,
  },
  menuTitles: {
    fontFamily:
      Platform.OS === 'android'
        ? 'Allrounder-Grotesk-Regular'
        : 'Allrounder Grotesk',
    fontSize: 20,
  },
  footerDrawer: {
    borderTopWidth: 0.5,
    borderTopColor: '#d0d0d0',
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default connect(mapStateToProps)(HeaderDrawerContent);
