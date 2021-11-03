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
  RefreshControl,
} from 'react-native';
//Import of action creators
import {
  ResetStateProps,
  UpdateErrorModalLog,
} from '../Redux/HomeActionsCreators';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import {RFValue} from 'react-native-responsive-fontsize';
import AdManager from '../Modules/AdManager/AdManager';
import GenericLoader from '../Modules/GenericLoader/GenericLoader';

class MyReferrals extends React.PureComponent {
  constructor(props) {
    super(props);

    this._isMounted = true; //! RESPONSIBLE TO LOCK PROCESSES IN THE MAIN SCREEN WHEN UNMOUNTED.

    //Handlers
    this.backHander = null;
    this.backListener = null; //Responsible to hold the listener for the go back overwritter.
    this.state = {
      referralsData: null, //Will hold all the referrals data.
      isLoading_something: false, //To know if something is loading or not.
      pullRefreshing: false, //To activate of not the pull refresh icon - default: false
    };
  }

  componentWillUnmount() {
    this._isMounted = false; //! MARK AS UNMMOUNTED
    //...
    this._navigatorEvent();
  }

  componentDidMount() {
    let that = this;
    this._isMounted = true;

    //? Add navigator listener - auto clean on focus
    that._navigatorEvent = this.props.navigation.addListener('focus', () => {
      //? Auto request for data
      that.getAllReferrals_data();
    });
    //--------------------------------------------------------
    this.props.App.socket.on(
      'referralOperations_perform_io-response',
      function (response) {
        that.setState({
          isLoading_something: false,
          pullRefreshing: false,
        });
        if (response.response !== undefined && response.response !== null) {
          //Found something
          if (/error/i.test(response.response)) {
            //Some error happend
            that.setState({referralsData: response.response});
          } else if (
            response.response.length !== undefined &&
            response.response.length > 0
          ) {
            //Success
            that.setState({referralsData: response.response});
          } //Error somewhere
          else {
            that.setState({referralsData: 'error'});
          }
        } //Error
        else {
          that.setState({referralsData: 'error'});
        }
      },
    );
  }

  /**
   * @func getAllReferrals_data
   * Responsible for getting all the referrals information and updating the state.
   */
  getAllReferrals_data() {
    this.setState({isLoading_something: true});
    this.props.App.socket.emit('referralOperations_perform_io', {
      user_fingerprint: this.props.App.user_fingerprint,
      user_nature: 'rider',
      action: 'get',
    });
  }

  /**
   * @func getAllReferrals_data_pull
   * Responsible for getting all the referrals information and updating the state.
   * ? Specific for the pull refresher.
   */
  getAllReferrals_data_pull() {
    this.setState({isLoading_something: true, pullRefreshing: true});
    this.props.App.socket.emit('referralOperations_perform_io', {
      user_fingerprint: this.props.App.user_fingerprint,
      user_nature: 'rider',
      action: 'get',
    });
  }

  render() {
    return (
      <ScrollView
        style={styles.mainContainer}
        refreshControl={
          <RefreshControl
            onRefresh={() => this.getAllReferrals_data_pull()}
            refreshing={this.state.pullRefreshing}
          />
        }>
        {this.state.isLoading_something === false ? (
          this.state.referralsData === null ||
          /no_data/i.test(this.state.referralsData) ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: 400,
              }}>
              <IconCommunity name="mailbox-up" size={40} color={'#6d6e74'} />
              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                  fontSize: RFValue(16),
                  marginTop: '5%',
                  color: '#6d6e74',
                }}>
                We could not find any referrals.
              </Text>
              {/**Pull down refresh */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: '5%',
                }}>
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    fontSize: RFValue(15),
                    color: '#6d6e74',
                  }}>
                  Pull down to refresh
                </Text>
                <IconCommunity name="arrow-down" size={18} color={'#000'} />
              </View>
            </View>
          ) : this.state.referralsData === undefined ||
            /error/i.test(this.state.referralsData) ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: 400,
              }}>
              <IconCommunity name="information" size={40} color={'#6d6e74'} />
              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                  fontSize: RFValue(16),
                  marginTop: '5%',
                  color: '#6d6e74',
                  textAlign: 'center',
                }}>
                We were unable to get your referrals, please try again later.
              </Text>
              {/**Pull down refresh */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: '5%',
                }}>
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    fontSize: RFValue(15),
                    color: '#6d6e74',
                  }}>
                  Pull down to refresh
                </Text>
                <IconCommunity name="arrow-down" size={18} color={'#000'} />
              </View>
            </View>
          ) : (
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
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                }}>
                <IconCommunity
                  name="information"
                  size={19}
                  style={{position: 'relative', top: 1, color: '#6d6e74'}}
                />
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
                    fontSize: RFValue(15),
                    marginLeft: 5,
                    flex: 1,
                    color: '#6d6e74',
                  }}>
                  Your referral expires after 2 days if the driver is not
                  registered.
                </Text>
              </View>
              <View style={{marginTop: '7%'}}>
                {this.state.referralsData.map((referralSingledata, index) => {
                  return (
                    <View style={styles.referralContainer} key={index}>
                      <View style={styles.referral_InsideLeftContainer}>
                        <Text style={styles.referral_InsideTaxiNoText}>
                          {referralSingledata.taxi_number}
                        </Text>
                        <Text style={styles.referral_InsideDateText}>
                          {referralSingledata.date_referred_beautified}
                        </Text>
                      </View>
                      {referralSingledata.is_referral_rejected !== undefined &&
                      referralSingledata.is_referral_rejected ? (
                        <View style={styles.referral_InsideRightContainer}>
                          <IconCommunity
                            name="close-circle"
                            size={30}
                            color={'#b22222'}
                            style={[
                              styles.referral_InsideIconStatus,
                              {flex: 1},
                            ]}
                          />
                          <Text
                            style={[
                              styles.referral_InsideTextStatus,
                              {fontSize: 14, color: '#b22222'},
                            ]}>
                            Rejected
                          </Text>
                        </View>
                      ) : referralSingledata.is_referralExpired ? (
                        <View style={styles.referral_InsideRightContainer}>
                          <IconCommunity
                            name="close-circle"
                            size={30}
                            color={'#b22222'}
                            style={[
                              styles.referral_InsideIconStatus,
                              {flex: 1},
                            ]}
                          />
                          <Text
                            style={[
                              styles.referral_InsideTextStatus,
                              {fontSize: 14, color: '#b22222'},
                            ]}>
                            Expired
                          </Text>
                        </View>
                      ) : referralSingledata.is_paid ? (
                        <View style={styles.referral_InsideRightContainer}>
                          <IconCommunity
                            name="check-circle"
                            size={30}
                            color={'#09864A'}
                            style={[
                              styles.referral_InsideIconStatus,
                              {flex: 1},
                            ]}
                          />
                          <Text
                            style={[
                              styles.referral_InsideTextStatus,
                              {color: '#09864A'},
                            ]}>
                            Paid
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.referral_InsideRightContainer}>
                          <IconCommunity
                            name="clock-time-four"
                            size={30}
                            style={[
                              styles.referral_InsideIconStatus,
                              {flex: 1, color: '#FFC043'},
                            ]}
                          />
                          <Text
                            style={[
                              styles.referral_InsideTextStatus,
                              {fontSize: 14, color: '#6d6e74'},
                            ]}>
                            Expires in{' '}
                            <Text
                              style={{fontWeight: 'bold', color: '#1a1a1a'}}>
                              {referralSingledata.time_left}
                            </Text>
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
                {/**PAID */}
                {/*<View style={styles.referralContainer}>
                  <View style={styles.referral_InsideLeftContainer}>
                    <Text style={styles.referral_InsideTaxiNoText}>H900</Text>
                    <Text style={styles.referral_InsideDateText}>
                      14-06-2021
                    </Text>
                  </View>
                  <View style={styles.referral_InsideRightContainer}>
                    <IconCommunity
                      name="check-circle"
                      size={30}
                      color={'#09864A'}
                      style={[styles.referral_InsideIconStatus, {flex: 1}]}
                    />
                    <Text
                      style={[
                        styles.referral_InsideTextStatus,
                        {color: '#09864A'},
                      ]}>
                      Paid
                    </Text>
                  </View>
                    </View>*/}
                {/** Still waiting */}
                {/*<View style={styles.referralContainer}>
                  <View style={styles.referral_InsideLeftContainer}>
                    <Text style={styles.referral_InsideTaxiNoText}>H900</Text>
                    <Text style={styles.referral_InsideDateText}>
                      14-06-2021
                    </Text>
                  </View>
                  <View style={styles.referral_InsideRightContainer}>
                    <IconCommunity
                      name="clock-time-four"
                      size={30}
                      style={[
                        styles.referral_InsideIconStatus,
                        {flex: 1, color: '#6d6e74'},
                      ]}
                    />
                    <Text
                      style={[
                        styles.referral_InsideTextStatus,
                        {fontSize: 14, color: '#6d6e74'},
                      ]}>
                      Expires in 2 days
                    </Text>
                  </View>
                    </View>*/}
                {/** Expired */}
                {/*<View style={styles.referralContainer}>
                  <View style={styles.referral_InsideLeftContainer}>
                    <Text style={styles.referral_InsideTaxiNoText}>H900</Text>
                    <Text style={styles.referral_InsideDateText}>
                      14-06-2021
                    </Text>
                  </View>
                  <View style={styles.referral_InsideRightContainer}>
                    <IconCommunity
                      name="close-circle"
                      size={30}
                      color={'#b22222'}
                      style={[styles.referral_InsideIconStatus, {flex: 1}]}
                    />
                    <Text
                      style={[
                        styles.referral_InsideTextStatus,
                        {fontSize: 14, color: '#b22222'},
                      ]}>
                      Expired
                    </Text>
                  </View>
                    </View>*/}
                {/** Rejected */}
                {/*<View style={styles.referralContainer}>
                  <View style={styles.referral_InsideLeftContainer}>
                    <Text style={styles.referral_InsideTaxiNoText}>H900</Text>
                    <Text style={styles.referral_InsideDateText}>
                      14-06-2021
                    </Text>
                  </View>
                  <View style={styles.referral_InsideRightContainer}>
                    <IconCommunity
                      name="close-circle"
                      size={30}
                      color={'#b22222'}
                      style={[styles.referral_InsideIconStatus, {flex: 1}]}
                    />
                    <Text
                      style={[
                        styles.referral_InsideTextStatus,
                        {fontSize: 14, color: '#b22222'},
                      ]}>
                      Rejected
                    </Text>
                  </View>
                </View>*/}
              </View>
            </View>
          )
        ) : (
          <GenericLoader
            active={this.state.isLoading_something}
            thickness={3}
          />
        )}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    flex: 1,
  },
  referralContainer: {
    padding: 5,
    paddingLeft: 15,
    flexDirection: 'row',
    height: 70,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 1.84,

    elevation: 1,
    marginBottom: '4%',
  },
  referral_InsideLeftContainer: {
    flex: 2,
  },
  referral_InsideRightContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referral_InsideTaxiNoText: {
    fontFamily:
      Platform.OS === 'android'
        ? 'UberMoveTextMedium'
        : 'Uber Move Text Medium',
    fontSize: RFValue(18),
    flex: 1,
  },
  referral_InsideDateText: {
    fontFamily: Platform.OS === 'android' ? 'UberMoveText' : 'Uber Move Text',
    fontSize: RFValue(14),
    color: '#4f5054',
  },
  referral_InsideIconStatus: {
    flex: 1,
  },
  referral_InsideTextStatus: {
    fontFamily: Platform.OS === 'android' ? 'UberMoveText' : 'Uber Move Text',
    fontSize: RFValue(15),
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
  connect(mapStateToProps, mapDispatchToProps)(MyReferrals),
);
