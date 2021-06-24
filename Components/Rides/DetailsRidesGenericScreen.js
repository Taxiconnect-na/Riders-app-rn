import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  StatusBar,
  RefreshControl,
  BackHandler,
  Platform,
} from 'react-native';
import {
  UpdateErrorModalLog,
  UpdateRides_history_YourRides_tab,
} from '../Redux/HomeActionsCreators';
import GenericLoader from '../Modules/GenericLoader/GenericLoader';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import {RFValue} from 'react-native-responsive-fontsize';
import FastImage from 'react-native-fast-image';

class DetailsRidesGenericScreen extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;
    this._shouldShow_errorModal = true; //! ERROR MODAL AUTO-LOCKER - PERFORMANCE IMPROVER.

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
    let globalObject = this;
    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        //Update data
        globalObject.props.navigation.goBack();
        return true;
      },
    );

    //Go back the "your rides" if no targeted variables found
    if (
      this.props.App.rides_history_details_data.targetedRequestSelected
        .request_fp === undefined
    ) {
      this.props.navigation.navigate('YourRidesEntry');
    }

    /**
     * SOCKET.IO RESPONSES
     */
    this.props.App.socket.on(
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
    //...
    /*if (this.backHander !== null) {
      this.backHander.remove();
    }*/
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
              fontFamily:
                Platform.OS === 'android'
                  ? 'UberMoveTextRegular'
                  : 'Uber Move Text',
              color: '#fff',
              fontSize: RFValue(16),
            }}>
            {date.replace(/\//g, '-')}
          </Text>
        </>
      );
    } //DELIVERY
    else {
      return (
        <>
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android'
                  ? 'UberMoveTextRegular'
                  : 'Uber Move Text',
              color: '#fff',
              fontSize: RFValue(16),
              flex: 1,
            }}>
            {date}
          </Text>
          <IconFeather name="package" size={23} color="#fff" />
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
    this.props.App.socket.emit('getRides_historyRiders_batchOrNot', {
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
            fontFamily:
              Platform.OS === 'android'
                ? 'UberMoveTextRegular'
                : 'Uber Move Text',
            fontSize: RFValue(16),
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
    if (this.state.detailed_requestData.driver_details === undefined) {
      <ScrollView
        style={styles.mainWindow}
        refreshControl={
          <RefreshControl
            onRefresh={() => this.pullRefreshRequest()}
            refreshing={this.state.pullRefreshing}
          />
        }>
        <StatusBar backgroundColor="#000" />
        {this.state.loaderState ? (
          <GenericLoader active={this.state.loaderState} thickness={4} />
        ) : null}
      </ScrollView>;
    }
    //...
    return (
      <ScrollView
        style={styles.mainWindow}
        refreshControl={
          <RefreshControl
            onRefresh={() => this.pullRefreshRequest()}
            refreshing={this.state.pullRefreshing}
          />
        }>
        <StatusBar backgroundColor="#000" />
        {this.state.loaderState ? (
          <GenericLoader active={this.state.loaderState} thickness={4} />
        ) : null}

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
                    height: 180,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}>
                  <FastImage
                    source={{
                      uri:
                        'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/17.0824,-22.5747,11.8,0/1280x1280?access_token=pk.eyJ1IjoiZG9taW5pcXVla3R0IiwiYSI6ImNrYXg0M3gyNDAybDgyem81cjZuMXp4dzcifQ.PpW6VnORUHYSYqNCD9n6Yg',
                      priority: FastImage.priority.normal,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                    style={{width: '100%', height: '100%'}}
                  />
                </View>
                <View
                  style={{
                    padding: 20,
                    paddingTop: 6,
                    paddingBottom: 6,
                    flexDirection: 'row',
                    backgroundColor: '#1a1a1a',
                    alignItems: 'center',
                    shadowColor: '#707070',
                    shadowOffset: {
                      width: 0,
                      height: 3,
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 4.65,

                    elevation: 5,
                  }}>
                  {this.renderCorrestHeaderDate(
                    this.state.detailed_requestData.date_requested,
                    this.state.detailed_requestData.ride_mode,
                  )}
                </View>
              </View>
              {this.state.detailed_requestData.driver_details !== undefined ? (
                <View style={{marginTop: 10}}>
                  <View style={{}}>
                    <Text
                      style={{
                        fontSize: RFValue(17),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        color: '#AFAFAF',
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
                              <View style={{width: 45}}>
                                <Text
                                  style={{
                                    fontFamily:
                                      Platform.OS === 'android'
                                        ? 'UberMoveTextRegular'
                                        : 'Uber Move Text',
                                    fontSize: RFValue(14),
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
                                      fontFamily:
                                        Platform.OS === 'android'
                                          ? 'UberMoveTextMedium'
                                          : 'Uber Move Text Medium',
                                      fontSize: RFValue(17),
                                      marginLeft: 5,
                                      flex: 1,
                                    }}>
                                    {String(
                                      this.state.detailed_requestData
                                        .pickup_name,
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
                              <View style={{width: 45}}>
                                <Text
                                  style={{
                                    fontFamily:
                                      Platform.OS === 'android'
                                        ? 'UberMoveTextRegular'
                                        : 'Uber Move Text',
                                    fontSize: RFValue(14),
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
                                        <View
                                          style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                          }}>
                                          {this.state.detailed_requestData.destination_name.split(
                                            ',',
                                          ).length > 1 ? (
                                            <View
                                              style={{
                                                height: '100%',
                                                justifyContent: 'flex-start',
                                              }}>
                                              <Text
                                                style={{
                                                  fontFamily:
                                                    Platform.OS === 'android'
                                                      ? 'UberMoveTextRegular'
                                                      : 'Uber Move Text',
                                                  fontSize: RFValue(17),
                                                  color: '#096ED4',
                                                }}>
                                                {index + 1 + '. '}
                                              </Text>
                                            </View>
                                          ) : null}
                                          <View
                                            style={{
                                              height: '100%',
                                              alignItems: 'flex-start',
                                            }}>
                                            <Text
                                              style={{
                                                fontFamily:
                                                  Platform.OS === 'android'
                                                    ? 'UberMoveTextRegular'
                                                    : 'Uber Move Text',
                                                fontSize: RFValue(17),
                                              }}>
                                              {destination.trim()}.
                                            </Text>
                                          </View>
                                        </View>
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
                        backgroundColor: '#EEEEEE',
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
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextLight'
                                : 'Uber Move Text Light',
                            fontSize: RFValue(16),
                            marginLeft: 5,
                            flex: 1,
                          }}>
                          Approximately{' '}
                          <Text
                            style={{
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextRegular'
                                  : 'Uber Move Text',
                              fontSize: RFValue(16),
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
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextLight'
                                : 'Uber Move Text Light',
                            fontSize: RFValue(16.5),
                            marginLeft: 5,
                            flex: 1,
                          }}>
                          ...
                        </Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={{
                      padding: 20,
                      borderBottomWidth: 1,
                      borderBottomColor: '#EEEEEE',
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
                        <View style={{width: 20, height: 20}}>
                          <Image
                            source={require('../../Media_assets/Images/cash-payment.png')}
                            style={{
                              resizeMode: 'contain',
                              width: '100%',
                              height: '100%',
                            }}
                          />
                        </View>
                      ) : (
                        <View style={{width: 20, height: 20}}>
                          <Image
                            source={require('../../Media_assets/Images/wallet.png')}
                            style={{
                              resizeMode: 'contain',
                              width: '100%',
                              height: '100%',
                            }}
                          />
                        </View>
                      )}

                      <Text
                        style={{
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                          fontSize: RFValue(18),
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
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        fontSize: RFValue(20),
                        color: '#09864A',
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
                      <View style={{width: 13, height: 13}}>
                        <Image
                          source={require('../../Media_assets/Images/user-3.png')}
                          style={{
                            resizeMode: 'contain',
                            width: '100%',
                            height: '100%',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                          fontSize: RFValue(18),
                          marginLeft: 4,
                        }}>
                        {this.state.detailed_requestData.numberOf_passengers}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      padding: 20,
                      borderBottomWidth: 1,
                      borderBottomColor: '#EEEEEE',
                    }}>
                    <Text
                      style={{
                        fontSize: RFValue(17),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        color: '#AFAFAF',
                        paddingBottom: 25,
                        marginTop: 10,
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
                          {/*<Image
                            source={require('../../Media_assets/Images/driver.jpg')}
                            style={{
                              resizeMode: 'cover',
                              width: '100%',
                              height: '100%',
                              borderRadius: 150,
                            }}
                          />*/}
                          {/http/i.test(
                            this.state.detailed_requestData.driver_details
                              .driver_picture,
                          ) &&
                          this.state.detailed_requestData.driver_details
                            .driver_picture !== undefined &&
                          this.state.detailed_requestData.driver_details
                            .driver_picture !== null ? (
                            <FastImage
                              source={{
                                uri:
                                  this.state.detailed_requestData.driver_details
                                    .driver_picture !== undefined &&
                                  this.state.detailed_requestData.driver_details
                                    .driver_picture !== null
                                    ? this.state.detailed_requestData
                                        .driver_details.driver_picture
                                    : 'user.png',
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
                              source={require('../../Media_assets/Images/driver.jpg')}
                              style={{
                                resizeMode: 'cover',
                                width: '100%',
                                height: '100%',
                                borderRadius: 150,
                              }}
                            />
                          )}
                        </View>
                        <View style={{marginLeft: 10}}>
                          <Text
                            style={{
                              fontSize: RFValue(16.5),
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextRegular'
                                  : 'Uber Move Text',
                            }}>
                            {
                              this.state.detailed_requestData.driver_details
                                .name
                            }
                          </Text>
                          <Text
                            style={{
                              fontSize: RFValue(17),
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextMedium'
                                  : 'Uber Move Text Medium',
                              color: '#096ED4',
                            }}>
                            {
                              this.state.detailed_requestData.car_details
                                .taxi_number
                            }
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <IconMaterialIcons
                          name="star"
                          color="#FFC043"
                          size={20}
                        />
                        <Text
                          style={{
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                            fontSize: RFValue(18),
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
                        fontSize: RFValue(17),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        color: '#AFAFAF',
                        paddingBottom: 25,
                        marginTop: 10,
                      }}>
                      Car details
                    </Text>
                    <View style={{flexDirection: 'row'}}>
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: '#EEEEEE',
                          width: 130,
                          height: 75,
                          borderRadius: 3,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        {/http/i.test(
                          this.state.detailed_requestData.car_details
                            .car_picture,
                        ) &&
                        this.state.detailed_requestData.car_details
                          .car_picture !== undefined &&
                        this.state.detailed_requestData.car_details
                          .car_picture !== null ? (
                          <FastImage
                            source={{
                              uri:
                                this.state.detailed_requestData.car_details
                                  .car_picture !== undefined &&
                                this.state.detailed_requestData.car_details
                                  .car_picture !== null
                                  ? this.state.detailed_requestData.car_details
                                      .car_picture
                                  : 'normaltaxieconomy.png',
                              priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 3,
                            }}
                          />
                        ) : (
                          <Image
                            source={require('../../Media_assets/Images/normaltaxieconomy.jpg')}
                            style={{
                              resizeMode: 'cover',
                              width: '100%',
                              height: '100%',
                            }}
                          />
                        )}
                      </View>
                      <View style={{marginLeft: 10, flex: 1}}>
                        <Text
                          style={{
                            fontSize: RFValue(17),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                          }}>
                          {
                            this.state.detailed_requestData.car_details
                              .plate_number
                          }
                        </Text>
                        <Text
                          style={{
                            fontSize: RFValue(16.5),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                          }}>
                          {
                            this.state.detailed_requestData.car_details
                              .car_brand
                          }
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            marginTop: 8,
                            alignItems: 'center',
                          }}>
                          <IconMaterialIcons
                            name="shield"
                            color="#09864A"
                            size={14}
                          />
                          <Text
                            style={{
                              fontSize: RFValue(14),
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextLight'
                                  : 'Uber Move Text Light',
                              color: '#09864A',
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
              ) : null}
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

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(DetailsRidesGenericScreen),
);
