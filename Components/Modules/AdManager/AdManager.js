import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  ShowCountryFilterHeader,
  RenderCountryPhoneCodeSearcher,
  UpdateCountryCodeFormatAfterSelect,
  UpdateDialDataORQueryTyped,
  UpdateErrorMessagesStateInputRecDelivery,
} from '../../Redux/HomeActionsCreators';
import {RFValue} from 'react-native-responsive-fontsize';
import FastImage from 'react-native-fast-image';

class AdManager extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <>
        {this.props.App.ad_vars !== null &&
        this.props.App.ad_vars !== undefined ? (
          <TouchableOpacity
            onPress={() =>
              this.props.App.ad_vars.afterClick_url !== null &&
              this.props.App.ad_vars.afterClick_url !== undefined
                ? Linking.openURL(this.props.App.ad_vars.afterClick_url)
                : {}
            }
            style={[
              styles.mainContainer,
              {
                marginBottom:
                  this.props.marginBottom !== undefined
                    ? this.props.App.ad_vars.is_banner
                      ? 0
                      : this.props.marginBottom
                    : 0,
                marginLeft:
                  this.props.paddingLeftBasic !== undefined &&
                  this.props.paddingLeftBasic
                    ? this.props.App.ad_vars.is_banner
                      ? 0
                      : 20
                    : this.props.paddingLeft !== undefined
                    ? this.props.paddingLeft
                    : 0,
                marginRight:
                  this.props.paddingRight !== undefined
                    ? this.props.paddingRight
                    : 0,
                paddingBottom:
                  this.props.paddingBottom !== undefined
                    ? this.props.paddingBottom
                    : 0,
                bottom: this.props.bottom !== undefined ? this.props.bottom : 0,
                justifyContent:
                  this.props.iconOnly === undefined ||
                  this.props.iconOnly === false
                    ? 'flex-start'
                    : 'center',
                borderRadius:
                  this.props.borderRadius !== undefined
                    ? this.props.borderRadius
                    : 0,
                height: this.props.App.ad_vars.is_banner ? 65 : 45,
              },
            ]}>
            <View
              style={[
                styles.logoContainer,
                {
                  borderRadius:
                    this.props.borderRadius !== undefined
                      ? this.props.borderRadius
                      : 0,
                  width: this.props.App.ad_vars.is_banner ? '100%' : 50,
                  marginRight: this.props.App.ad_vars.is_banner ? 0 : '1%',
                },
              ]}>
              <FastImage
                source={{
                  uri: this.props.App.ad_vars.media.logo,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius:
                    this.props.borderRadius !== undefined
                      ? this.props.borderRadius
                      : 0,
                }}
              />
            </View>
            {this.props.App.ad_vars.is_banner === false ? (
              this.props.iconOnly === undefined ||
              this.props.iconOnly === false ? (
                <View style={styles.textsContainer}>
                  {this.props.App.ad_vars.texts_specs.is_big_text_visible ? (
                    <Text
                      style={[
                        styles.bigText,
                        {
                          color: this.props.App.ad_vars.texts_specs
                            .big_text_color,
                        },
                      ]}>
                      {this.props.App.ad_vars.media.big_text}
                    </Text>
                  ) : null}
                  {this.props.App.ad_vars.texts_specs.is_small_text_visible ? (
                    <Text
                      style={[
                        styles.descText,
                        {
                          color: this.props.App.ad_vars.texts_specs
                            .small_text_color,
                        },
                      ]}>
                      {this.props.App.ad_vars.media.small_text}
                    </Text>
                  ) : null}
                </View>
              ) : null
            ) : null}
          </TouchableOpacity>
        ) : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    //width: '100%',
  },
  logoContainer: {
    height: '100%',
    //marginRight: '1%',
    backgroundColor: '#fff',
    //borderWidth: 1,
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

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ShowCountryFilterHeader,
      RenderCountryPhoneCodeSearcher,
      UpdateCountryCodeFormatAfterSelect,
      UpdateDialDataORQueryTyped,
      UpdateErrorMessagesStateInputRecDelivery,
    },
    dispatch,
  );

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(AdManager),
);
