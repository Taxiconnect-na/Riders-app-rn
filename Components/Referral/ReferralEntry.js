import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  Text,
  View,
  Image,
  StyleSheet,
  BackHandler,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
//Import of action creators
import {
  ResetStateProps,
  UpdateErrorModalLog,
} from '../Redux/HomeActionsCreators';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import call from 'react-native-phone-call';
import {RFValue} from 'react-native-responsive-fontsize';
import AdManager from '../Modules/AdManager/AdManager';
import ErrorModal from '../Helpers/ErrorModal';

class ReferralEntry extends React.PureComponent {
  constructor(props) {
    super(props);

    this._isMounted = true; //! RESPONSIBLE TO LOCK PROCESSES IN THE MAIN SCREEN WHEN UNMOUNTED.

    //Handlers
    this.backHander = null;
    this.backListener = null; //Responsible to hold the listener for the go back overwritter.
  }

  componentWillUnmount() {
    this._isMounted = false; //! MARK AS UNMMOUNTED
    //...
    this._navigatorEvent();
  }

  componentDidMount() {
    let globalObject = this;
    this._isMounted = true;

    //? Add navigator listener - auto clean on focus
    globalObject._navigatorEvent = this.props.navigation.addListener(
      'focus',
      () => {
        globalObject.backListener = globalObject.backHander = BackHandler.addEventListener(
          'hardwareBackPress',
          function () {
            globalObject.props.navigation.navigate('Home_drawer');
            return true;
          },
        );
        //? Gather Ad analytics *************************************************
        if (
          this.props.App.ad_vars !== undefined &&
          this.props.App.ad_vars !== null &&
          this.props.App.ad_vars.compaign_id !== undefined &&
          this.props.App.ad_vars.compaign_id !== null
        ) {
          globalObject.props.App.socket.emit('gatherAdsManagerAnalytics_io', {
            user_fingerprint: globalObject.props.App.user_fingerprint,
            user_nature: 'rider',
            screen_identifier: 'BottomSupport',
            company_identifier: globalObject.props.App.ad_vars.company_id,
            campaign_identifier: globalObject.props.App.ad_vars.compaign_id,
          });
        }
        //? *********************************************************************
        //Add home going back handler-----------------------------
        globalObject._navigatorEvent = globalObject.props.navigation.addListener(
          'beforeRemove',
          (e) => {
            // Prevent default behavior of leaving the screen
            e.preventDefault();
            if (/POP/i.test(e.data.action.type)) {
              globalObject.props.navigation.navigate('Home_drawer');
            }
            return;
          },
        );
      },
    );
    //--------------------------------------------------------
  }

  /**
   * @func renderError_modalView
   * Responsible for rendering the modal view only once.
   */
  renderError_modalView() {
    return (
      <ErrorModal
        active={this.props.App.generalErrorModal_vars.showErrorGeneralModal}
        error_status={
          this.props.App.generalErrorModal_vars.generalErrorModalType
        }
        parentNode={this}
      />
    );
  }

  render() {
    return (
      <ScrollView style={styles.mainContainer}>
        {this.props.App.generalErrorModal_vars.showErrorGeneralModal
          ? this.renderError_modalView()
          : null}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingBottom: 50,
          }}>
          <View
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                flex: 1,
                width: 150,
                height: 120,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={require('../../Media_assets/Images/collaboration.png')}
                style={{width: '70%', height: '70%', resizeMode: 'contain'}}
              />
            </View>
          </View>
          <View style={{flex: 1, width: '100%', marginTop: '5%'}}>
            <Text
              style={{
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextBold'
                    : 'Uber Move Text Bold',
                fontSize: RFValue(20),
              }}>
              Earn
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontFamily:
                  Platform.OS === 'android'
                    ? 'UberMoveTextRegular'
                    : 'Uber Move Text',
                fontSize: RFValue(17.5),
              }}>
              Refer a driver and earn seemlessly......
            </Text>
          </View>
          <View
            style={{
              marginTop: '13%',
            }}>
            <TouchableOpacity
              onPress={() =>
                this.props.UpdateErrorModalLog(
                  true,
                  'show_refer_driver_dialog',
                  'any',
                )
              }
              style={[
                styles.bttnGenericTc,
                {flex: 1, justifyContent: 'flex-start'},
              ]}>
              <Text
                style={{
                  flex: 1,
                  color: '#fff',
                  fontSize: RFValue(20),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                }}>
                Refer a driver now
              </Text>
              <IconCommunity name="arrow-right" color={'#fff'} size={28} />
            </TouchableOpacity>
            {/**Who did I refer? */}
            <TouchableOpacity style={{flex: 1, marginTop: '10%'}}>
              <Text
                style={{
                  fontSize: RFValue(16),
                  color: '#0e8491',
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                }}>
                Who did I refer?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    padding: 20,
    paddingLeft: 30,
    paddingRight: 30,
    backgroundColor: '#fff',
    flex: 1,
  },
  bttnGenericTc: {
    borderColor: '#000',
    padding: 12,
    height: 60,
    //width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#000',
    borderRadius: 3,
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

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ResetStateProps,
      UpdateErrorModalLog,
    },
    dispatch,
  );

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(ReferralEntry),
);
