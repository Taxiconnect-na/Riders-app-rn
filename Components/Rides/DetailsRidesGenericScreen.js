import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import SOCKET_CORE from '../Helpers/managerNode';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import {
  UpdateErrorModalLog,
  UpdateRides_history_YourRides_tab,
} from '../Redux/HomeActionsCreators';
import ErrorModal from '../Helpers/ErrorModal';
import GenericLoader from '../Modules/GenericLoader/GenericLoader';
import NetInfo from '@react-native-community/netinfo';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFeather from 'react-native-vector-icons/Feather';
import IconEntypo from 'react-native-vector-icons/Entypo';

class DetailsRidesGenericScreen extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      loaderState: false,
      fetchingRides_Data: false, //To know whether the loading process is on
      areResultsEmpty: false, //To know whether the results where empty or not
      gotErrorDuringRequest: false, //TO know whether an error occured during the fetching
      detailed_requestData: false, //The fetched request data - default: false
      pullRefreshing: false, //To activate of not the pull refresh icon - default: false
      networkStateChecker: false,
    };
  }

  componentDidMount() {
    //Go back the "your rides" if no targeted variables found
    if (
      this.props.App.rides_history_details_data.targetedRequestSelected
        .request_fp === undefined
    ) {
      this.props.navigation.navigate('YourRidesEntry');
    }
    let globalObject = this;

    //Network state checker
    this.state.networkStateChecker = NetInfo.addEventListener((state) => {
      if (state.isConnected === false) {
        globalObject.props.UpdateErrorModalLog(
          state.isConnected,
          'connection_no_network',
          state.type,
        );
        globalObject.setState({loaderState: false});
      } //connected
      else {
        if (
          globalObject.props.App.generalErrorModal_vars
            .showErrorGeneralModal !== false
        ) {
          globalObject.props.UpdateErrorModalLog(false, false, state.type);
        }
      }

      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
    });

    //connection
    SOCKET_CORE.on('connect', () => {
      if (
        globalObject.props.App.generalErrorModal_vars.showErrorGeneralModal !==
        false
      ) {
        globalObject.props.UpdateErrorModalLog(false, false, 'any');
      }
    });
    //Socket error handling
    SOCKET_CORE.on('error', (error) => {
      //console.log('something');
    });
    SOCKET_CORE.on('disconnect', () => {
      //console.log('something');
      SOCKET_CORE.connect();
    });
    SOCKET_CORE.on('connect_error', () => {
      console.log('connect_error');
      //Ask for the OTP again
      globalObject.props.UpdateErrorModalLog(
        true,
        'connection_no_network',
        'any',
      );
      SOCKET_CORE.connect();
    });
    SOCKET_CORE.on('connect_timeout', () => {
      console.log('connect_timeout');
      SOCKET_CORE.connect();
    });
    SOCKET_CORE.on('reconnect', () => {
      ////console.log('something');
    });
    SOCKET_CORE.on('reconnect_error', () => {
      console.log('reconnect_error');
      SOCKET_CORE.connect();
    });
    SOCKET_CORE.on('reconnect_failed', () => {
      console.log('reconnect_failed');
      SOCKET_CORE.connect();
    });

    /**
     * SOCKET.IO RESPONSES
     */
    SOCKET_CORE.on(
      'getRides_historyRiders_batchOrNot-response',
      function (response) {
        globalObject.setState({
          loaderState: false,
          fetchingRides_Data: false,
          pullRefreshing: false,
        });
        if (
          response !== false &&
          response.response !== undefined &&
          response.response !== false
        ) {
          //Got something
          if (/success/i.test(response.response)) {
            //Successfull
            if (
              response.data !== undefined &&
              response.data !== false &&
              response.data.length > 0
            ) {
              //Got some results
              //Update the local state
              globalObject.setState({
                detailed_requestData: response.data[0],
                areResultsEmpty: false,
                gotErrorDuringRequest: false,
              });
            } //EMpty results
            else {
              globalObject.setState({
                areResultsEmpty: true,
                gotErrorDuringRequest: false,
              });
            }
          } //An error happened
          else {
            globalObject.setState({
              areResultsEmpty: true,
              gotErrorDuringRequest: true,
            });
          }
        } //Empty
        else {
          globalObject.setState({
            areResultsEmpty: true,
            gotErrorDuringRequest: true,
          });
        }
      },
    );

    //Request for ride
    this.fetchRequestedRequests_history();
  }

  componentWillUnmount() {
    //Remove the network state listener
    if (this.state.networkStateChecker !== false) {
      this.state.networkStateChecker();
    }
  }

  /**
   * @func renderCorrestHeaderDate
   * @param date: date of the ride
   * @param rideType: type of "ride" or "delivery",
   * Responsible for rendering the correct date and graphical elements based on if
   * the request is a ride, delivery or business.
   */
  renderCorrestHeaderDate(date, rideType) {
    if (/ride/i.test(rideType)) {
      //RIDE
      return (
        <>
          <Text
            style={{
              fontFamily: 'Allrounder-Grotesk-Regular',
              color: '#fff',
              fontSize: 16,
              marginLeft: 5,
            }}>
            {date}
          </Text>
        </>
      );
    } //DELIVERY
    else {
      return (
        <>
          <Text
            style={{
              fontFamily: 'Allrounder-Grotesk-Regular',
              color: '#fff',
              fontSize: 16,
              marginLeft: 5,
              flex: 1,
            }}>
            {date}
          </Text>
          <IconFeather name="package" size={25} color="#fff" />
        </>
      );
    }
  }

  /**
   * @func fetchRequestedRequests_history
   * Responsible for finding the data for the selected ride type
   * @param type: the type of request (past, scheduled, business)
   *
   */
  fetchRequestedRequests_history(type = false) {
    this.setState({
      loaderState: true,
      fetchingRides_Data: true,
      areResultsEmpty: false,
      gotErrorDuringRequest: false,
      detailed_requestData: false,
    }); //Activate the loader
    //Get from the server
    SOCKET_CORE.emit('getRides_historyRiders_batchOrNot', {
      user_fingerprint: this.props.App.user_fingerprint,
      target: 'single',
      request_fp: this.props.App.rides_history_details_data
        .targetedRequestSelected.request_fp,
    });
  }

  /**
   * @func fillForEmptyRequests
   * Responsible for filling the page with error log - should have results - so strange
   */
  fillForEmptyRequests() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          paddingTop: '35%',
        }}>
        <IconCommunity
          name="network-strength-1-alert"
          size={40}
          color="#a5a5a5"
        />
        <Text
          style={{
            fontFamily: 'Allrounder-Grotesk-Book',
            fontSize: 16,
            marginTop: 15,
            width: '80%',
            textAlign: 'center',
          }}>
          We were unable to get more details about this request, try again
          later.
        </Text>
      </View>
    );
  }

  /**
   * @func pullRefreshRequest
   * Responsible for launching a fresh loading of the details on pull of the screen
   */
  pullRefreshRequest() {
    this.setState({pullRefreshing: true});
    this.fetchRequestedRequests_history();
  }

  render() {
    return (
      <ScrollView
        style={styles.mainWindow}
        refreshControl={
          <RefreshControl
            onRefresh={() => this.pullRefreshRequest()}
            refreshing={this.state.pullRefreshing}
          />
        }>
        {this.state.loaderState ? (
          <GenericLoader active={this.state.loaderState} thickness={4} />
        ) : null}
        <ErrorModal
          active={this.props.App.generalErrorModal_vars.showErrorGeneralModal}
          error_status={
            this.props.App.generalErrorModal_vars.generalErrorModalType
          }
          parentNode={this}
        />

        {this.state.fetchingRides_Data === false ? (
          this.state.areResultsEmpty === false &&
          this.state.detailed_requestData !== false ? (
            <>
              <View
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.29,
                  shadowRadius: 4.65,

                  elevation: 7,
                }}>
                <View
                  style={{
                    height: 150,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}>
                  <Image
                    source={require('../../Media_assets/Images/windhoekMap.png')}
                    style={{
                      resizeMode: 'cover',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </View>
                <View
                  style={{
                    borderWidth: 1,
                    padding: 20,
                    paddingTop: 10,
                    paddingBottom: 10,
                    flexDirection: 'row',
                    backgroundColor: '#000',
                    alignItems: 'center',
                  }}>
                  {this.renderCorrestHeaderDate(
                    this.state.detailed_requestData.date_requested,
                    this.state.detailed_requestData.ride_mode,
                  )}
                </View>
              </View>
              <View style={{marginTop: 10}}>
                <View style={{}}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontFamily: 'Allrounder-Grotesk-Regular',
                      color: '#a5a5a5',
                      padding: 20,
                      paddingBottom: 0,
                    }}>
                    {/ride/i.test(this.state.detailed_requestData.ride_mode)
                      ? 'Trip'
                      : 'Delivery'}
                  </Text>
                  <View
                    style={{
                      padding: 20,
                    }}>
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                        }}>
                        <View style={{width: 16, height: '87%', top: 6}}>
                          <View style={{position: 'absolute', top: 0}}>
                            <View
                              style={{
                                height: 11,
                                width: 11,
                                borderRadius: 100,
                                backgroundColor: '#000',
                              }}
                            />
                          </View>

                          <View
                            style={{
                              flex: 1,
                              left: 5,
                              width: 1.5,
                              height: 50,
                              backgroundColor: '#000',
                            }}></View>
                          <View style={{position: 'absolute', bottom: 0}}>
                            <View
                              style={{
                                height: 11,
                                width: 11,
                                borderRadius: 0,
                                backgroundColor: '#096ED4',
                              }}
                            />
                          </View>
                        </View>
                        <View style={{flex: 1}}>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <View style={{width: 35}}>
                              <Text
                                style={{
                                  fontFamily: 'Allrounder-Grotesk-Book',
                                  fontSize: 13,
                                  top: 2,
                                }}>
                                From
                              </Text>
                            </View>
                            <View
                              style={{
                                flex: 1,
                                alignItems: 'flex-start',
                              }}>
                              <View
                                style={{
                                  flex: 1,
                                  alignItems: 'flex-start',
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Allrounder-Grotesk-Medium',
                                    fontSize: 15,
                                    marginLeft: 5,
                                    flex: 1,
                                  }}>
                                  {String(
                                    this.state.detailed_requestData.pickup_name,
                                  )}
                                </Text>
                              </View>
                            </View>
                          </View>
                          {/**Destination */}
                          <View
                            style={{
                              flexDirection: 'row',
                              marginTop: 25,
                            }}>
                            <View style={{width: 35}}>
                              <Text
                                style={{
                                  fontFamily: 'Allrounder-Grotesk-Book',
                                  fontSize: 13,
                                  top: 1,
                                }}>
                                To
                              </Text>
                            </View>
                            <View
                              style={{
                                flex: 1,
                                alignItems: 'flex-start',
                              }}>
                              {this.state.detailed_requestData.destination_name
                                .split(',')
                                .map((destination, index) => {
                                  return (
                                    <View
                                      key={String(index + 1)}
                                      style={{
                                        flex: 1,
                                        alignItems: 'flex-start',
                                        marginTop: index > 0 ? 5 : 0,
                                      }}>
                                      <Text
                                        style={{
                                          fontFamily:
                                            'Allrounder-Grotesk-Regular',
                                          fontSize: 16,
                                          marginLeft: 5,
                                          flex: 1,
                                        }}>
                                        {this.state.detailed_requestData.destination_name.split(
                                          ',',
                                        ).length > 1 ? (
                                          <Text
                                            style={{
                                              fontFamily:
                                                'Allrounder-Grotesk-Regular',
                                              fontSize: 13,
                                              marginLeft: 5,
                                              flex: 1,
                                              color: '#096ED4',
                                            }}>
                                            {index + 1 + '. '}
                                          </Text>
                                        ) : null}
                                        {destination.trim()}
                                      </Text>
                                    </View>
                                  );
                                })}
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                  {/**ETA */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 20,
                      borderTopWidth: 0.7,
                      borderTopColor: '#d0d0d0',
                      borderBottomWidth: 0.7,
                      borderBottomColor: '#d0d0d0',
                      backgroundColor: '#fafafa',
                    }}>
                    <View>
                      <View
                        style={{
                          top: 1,
                          height: 10,
                          width: 10,
                          borderWidth: 3,
                          borderColor: '#096ED4',
                          borderRadius: 100,
                          backgroundColor: '#fff',
                        }}
                      />
                    </View>
                    {this.state.detailed_requestData.estimated_travel_time !==
                      undefined &&
                    this.state.detailed_requestData.estimated_travel_time !==
                      false &&
                    this.state.detailed_requestData.estimated_travel_time !==
                      null ? (
                      <Text
                        style={{
                          fontFamily: 'Allrounder-Grotesk-Book',
                          fontSize: 14,
                          marginLeft: 5,
                          flex: 1,
                        }}>
                        Approximately{' '}
                        <Text
                          style={{
                            fontFamily: 'Allrounder-Grotesk-Medium',
                            fontSize: 16,
                            marginLeft: 5,
                            color: '#096ED4',
                          }}>
                          {this.state.detailed_requestData.estimated_travel_time.replace(
                            ' away',
                            '',
                          )}
                          .
                        </Text>
                      </Text>
                    ) : (
                      <Text
                        style={{
                          fontFamily: 'Allrounder-Grotesk-Book',
                          fontSize: 15,
                          marginLeft: 5,
                          flex: 1,
                        }}>
                        Couldn't find the ETA.
                      </Text>
                    )}
                  </View>
                </View>
                <View
                  style={{
                    padding: 20,
                    borderBottomWidth: 0.7,
                    borderBottomColor: '#d0d0d0',
                    height: 70,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}>
                    {/cash/i.test(
                      String(this.state.detailed_requestData.payment_method),
                    ) ? (
                      <IconCommunity
                        name="cash-usd"
                        color={'black'}
                        size={25}
                      />
                    ) : (
                      <IconMaterialIcons name="credit-card" size={25} />
                    )}

                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Regular',
                        fontSize: 17,
                        marginLeft: 4,
                      }}>
                      {String(
                        this.state.detailed_requestData.payment_method,
                      )[0] +
                        String(this.state.detailed_requestData.payment_method)
                          .substring(
                            1,
                            String(
                              this.state.detailed_requestData.payment_method,
                            ).length,
                          )
                          .toLowerCase()}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Allrounder-Grotesk-Medium',
                      fontSize: 20,
                      color: 'green',
                      flex: 1,
                      textAlign: 'center',
                    }}>
                    {'N$' + this.state.detailed_requestData.fare_amount}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      flex: 1,
                    }}>
                    <IconAnt name="user" size={17} />
                    <Text
                      style={{
                        fontFamily: 'Allrounder-Grotesk-Medium',
                        fontSize: 17.5,
                        marginLeft: 4,
                      }}>
                      {this.state.detailed_requestData.numberOf_passengers}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    padding: 20,
                    borderBottomWidth: 0.7,
                    borderBottomColor: '#d0d0d0',
                  }}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontFamily: 'Allrounder-Grotesk-Regular',
                      color: '#a5a5a5',
                      paddingBottom: 25,
                      marginBottom: 10,
                    }}>
                    Driver
                  </Text>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flexDirection: 'row', flex: 1}}>
                      <View
                        style={{
                          width: 45,
                          height: 45,
                          borderRadius: 150,
                          alignItems: 'center',
                          borderWidth: 0.5,
                          borderColor: '#d0d0d0',
                          justifyContent: 'center',
                          backgroundColor: '#fff',
                          shadowColor: '#000',
                          shadowOffset: {
                            width: 0,
                            height: 2,
                          },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,

                          elevation: 3,
                        }}>
                        <Image
                          source={require('../../Media_assets/Images/driver.jpg')}
                          style={{
                            resizeMode: 'cover',
                            width: '100%',
                            height: '100%',
                            borderRadius: 150,
                          }}
                        />
                      </View>
                      <View style={{marginLeft: 10}}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontFamily: 'Allrounder-Grotesk-Regular',
                          }}>
                          {this.state.detailed_requestData.driver_details.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'Allrounder-Grotesk-Medium',
                            color: '#096ED4',
                          }}>
                          {
                            this.state.detailed_requestData.car_details
                              .taxi_number
                          }
                        </Text>
                      </View>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <IconMaterialIcons name="star" size={20} />
                      <Text
                        style={{
                          fontFamily: 'Allrounder-Grotesk-Regular',
                          fontSize: 17,
                        }}>
                        {/notYet/i.test(
                          this.state.detailed_requestData.ride_rating,
                        )
                          ? 'Not rated'
                          : this.state.detailed_requestData.ride_rating}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    padding: 20,
                    marginBottom: 50,
                  }}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontFamily: 'Allrounder-Grotesk-Regular',
                      color: '#a5a5a5',
                      paddingBottom: 15,
                    }}>
                    Car details
                  </Text>
                  <View style={{flexDirection: 'row'}}>
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: '#d0d0d0',
                        width: 130,
                        height: 70,
                        borderRadius: 3,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Image
                        source={require('../../Media_assets/Images/normaltaxieconomy.jpg')}
                        style={{
                          resizeMode: 'cover',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </View>
                    <View style={{marginLeft: 10, flex: 1}}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'Allrounder-Grotesk-Medium',
                        }}>
                        {
                          this.state.detailed_requestData.car_details
                            .plate_number
                        }
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'Allrounder-Grotesk-Book',
                        }}>
                        {this.state.detailed_requestData.car_details.car_brand}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginTop: 8,
                          alignItems: 'center',
                        }}>
                        <IconFeather name="shield" color="green" size={16} />
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: 'Allrounder-Grotesk-Book',
                            color: 'green',
                          }}>
                          {
                            this.state.detailed_requestData.car_details
                              .verification_status
                          }
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </>
          ) : (
            this.fillForEmptyRequests()
          )
        ) : null}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  mainWindow: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      UpdateErrorModalLog,
      UpdateRides_history_YourRides_tab,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DetailsRidesGenericScreen);
