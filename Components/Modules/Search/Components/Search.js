/* eslint-disable prettier/prettier */
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
  InteractionManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialM from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFontisto from 'react-native-vector-icons/Fontisto';
import {systemWeights} from 'react-native-typography';
import {
  UpdateSearchMetadataLoaderState,
  UpdateProcessFlowState,
  UpdateDestinationDetails,
  UpdateDestinationInputValues,
  UpdateCustomPickupDetails,
  UpdateErrorModalLog,
  ResetStateProps,
} from '../../../Redux/HomeActionsCreators';
import SyncStorage from 'sync-storage';

class Search extends React.PureComponent {
  constructor(props) {
    super(props);

    this.fire_search_animation = this.fire_search_animation.bind(this);
    this._onDestinationSelect = this._onDestinationSelect.bind(this);
    this.dismissBackSearchNodeMain = this.dismissBackSearchNodeMain.bind(this);
  }

  componentDidMount() {
    var globalObj = this;

    InteractionManager.runAfterInteractions(() => {
      globalObj.invoke_searchNode();
    });

    this.props.App.socket.on('connect', () => {
      //Auto cancel anything
      //objectApp.socket.emit('cancelCurrentRide-response', {response:'internal'});
    });
    this.props.App.socket.on('error', (error) => {});
    this.props.App.socket.on('disconnect', () => {});
    this.props.App.socket.on('connect_error', () => {});
    this.props.App.socket.on('connect_timeout', () => {});
    this.props.App.socket.on('reconnect', () => {});
    this.props.App.socket.on('reconnect_error', () => {});
    this.props.App.socket.on('reconnect_failed', () => {});
    this.props.App.socket.on('getLocations-response', function (response) {
      InteractionManager.runAfterInteractions(() => {
        if (globalObj.props.App.search_time_requested == null) {
          globalObj.props.App.search_time_requested = new Date();
        }
        //...
        if (response !== false) {
          if (globalObj.props.App.search_querySearch.length !== 0) {
            globalObj.props.UpdateSearchMetadataLoaderState({
              search_metadataResponse: response.result.result,
              search_showLocationSearch_loader: false,
            });
          } //No queries to be processed
          else {
            globalObj.props.UpdateSearchMetadataLoaderState({
              search_metadataResponse: [],
              search_showLocationSearch_loader: false,
            });
          }
        } else {
          //If the search results contained previous results, leave that
          globalObj.props.UpdateSearchMetadataLoaderState({
            search_showLocationSearch_loader: false,
          });
        }
      });
    });
  }

  /**
   * @func _searchForThisQuery()
   * @param {*} query
   * Responsible for launching the server request for a specific query props.App typed by the user.
   */
  _searchForThisQuery(query, inputFieldIndex) {
    //Update the input field index for passengers
    if (inputFieldIndex === 0) {
      //Pickup location
      //this.props.App.search_pickupLocationInfos.isBeingPickedupFromCurrentLocation = false; //Enable custom pickup location
      this.props.App.search_pickupLocationInfos.search_passenger0DestinationInput = query;
      if (query.length <= 0) {
        this.props.App.search_pickupLocationInfos.passenger0Destination = false;
        this.props.App.search_pickupLocationInfos.search_passenger0DestinationInput =
          ''; //Empty string instead of 'false' to not reset to current location name string
      }
    } else if (inputFieldIndex === 1) {
      //Passenger 1
      this.props.App.search_passenger1DestinationInput = query;
      if (query.length <= 0) {
        this.props.App.search_passengersDestinations.passenger1Destination = false;
        this.props.App.search_passenger1DestinationInput = false;
      }
    } else if (inputFieldIndex === 2) {
      this.props.App.search_passenger2DestinationInput = query;
      if (query.length <= 0) {
        this.props.App.search_passengersDestinations.passenger2Destination = false;
        this.props.App.search_passenger2DestinationInput = false;
      }
    } else if (inputFieldIndex === 3) {
      this.props.App.search_passenger3DestinationInput = query;
      if (query.length <= 0) {
        this.props.App.search_passengersDestinations.passenger3Destination = false;
        this.props.App.search_passenger3DestinationInput = false;
      }
    } else if (inputFieldIndex === 4) {
      this.props.App.search_passenger4DestinationInput = query;
      if (query.length <= 0) {
        this.props.App.search_passengersDestinations.passenger4Destination = false;
        this.props.App.search_passenger4DestinationInput = false;
      }
    }
    //--------------------------------------------------------------------------------
    this.search_time_requested = new Date();
    this.props.App.search_querySearch = query.trim();
    if (query.length > 0) {
      if (this.props.App.search_querySearch.length !== 0) {
        //Has some query
        //Alright
        let requestPackage = {};
        requestPackage.user_fp = this.props.App.user_fingerprint;
        requestPackage.query = this.props.App.search_querySearch;
        requestPackage.city =
          this.props.App.userCurrentLocationMetaData.city !== undefined
            ? this.props.App.userCurrentLocationMetaData.city
            : 'Windhoek'; //Default city to windhoek
        requestPackage.country =
          this.props.App.userCurrentLocationMetaData.country !== undefined
            ? this.props.App.userCurrentLocationMetaData.country
            : 'Namibia'; //Default country to Namibia
        //Submit to API
        this.props.UpdateSearchMetadataLoaderState({
          search_showLocationSearch_loader: true,
        });
        this.props.App.socket.emit('getLocations', requestPackage);
      } //NO queries to process
      else {
        this.props.UpdateSearchMetadataLoaderState({
          search_metadataResponse: [],
          search_showLocationSearch_loader: false,
        });
      }
    } //Empty search
    else {
      this.props.UpdateSearchMetadataLoaderState({
        search_metadataResponse: [],
        search_showLocationSearch_loader: false,
      });
    }
  }

  /**
   * @func _onDestinationSelect
   * @param {*} locationObj: Location object data containing all the necessary location infos
   * @param extraString: extra details about what actions to take (for instance when resetting the pickup to the current one)
   *
   */
  _onDestinationSelect(locationObj, extraString = false) {
    InteractionManager.runAfterInteractions(() => {
      //Check if details are for the Pickup location
      if (this.props.App.search_currentFocusedPassenger === 0) {
        //Custom pickup
        this.props.UpdateCustomPickupDetails({
          locationObject: locationObj,
          extraString: extraString,
        });
      } //Destination
      else {
        //If all are going to the same direction unify destination infos
        if (
          this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
            .isAllgoingToTheSamePlace
        ) {
          if (this.props.App.search_currentFocusedPassenger === 1) {
            this.props.UpdateDestinationDetails({
              passengerIndex: 1,
              locationObject: locationObj,
            });
          } else if (this.props.App.search_currentFocusedPassenger === 2) {
            this.props.UpdateDestinationDetails({
              passengerIndex: 1,
              locationObject: locationObj,
            });
            this.props.UpdateDestinationDetails({
              passengerIndex: 2,
              locationObject: locationObj,
            });
          } else if (this.props.App.search_currentFocusedPassenger === 3) {
            this.props.UpdateDestinationDetails({
              passengerIndex: 1,
              locationObject: locationObj,
            });
            this.props.UpdateDestinationDetails({
              passengerIndex: 2,
              locationObject: locationObj,
            });
            this.props.UpdateDestinationDetails({
              passengerIndex: 3,
              locationObject: locationObj,
            });
          } else if (this.props.App.search_currentFocusedPassenger === 4) {
            this.props.UpdateDestinationDetails({
              passengerIndex: 1,
              locationObject: locationObj,
            });
            this.props.UpdateDestinationDetails({
              passengerIndex: 2,
              locationObject: locationObj,
            });
            this.props.UpdateDestinationDetails({
              passengerIndex: 3,
              locationObject: locationObj,
            });
            this.props.UpdateDestinationDetails({
              passengerIndex: 4,
              locationObject: locationObj,
            });
          }
          //....
          if (
            this.props.App.search_passengersDestinations
              .passenger1Destination !== false
          ) {
            //Restore pickup location to current pickup location if no custom location was selected
            if (
              this.props.App.search_pickupLocationInfos
                .passenger0Destination === false
            ) {
              this.props.App.search_currentFocusedPassenger = 0; //Very important refocus on the pickup location field
              this._onDestinationSelect(false, 'currentPickupLocation');
            }
            //All locations filled
            this.props.UpdateProcessFlowState({flowDirection: 'next'});
          }
        } //Going separate places deunify destination infos
        else {
          if (this.props.App.search_currentFocusedPassenger === 1) {
            if (
              this.props.showSimplified !== undefined &&
              this.props.showSimplified
            ) {
              //Simplified mode enabled
              if (/home/i.test(this.props.favoritePlace_label)) {
                //Home
                this.props.App.user_favorites_destinations[0].location_infos = locationObj;
              } else if (/gym/i.test(this.props.favoritePlace_label)) {
                //Gym
                this.props.App.user_favorites_destinations[2].location_infos = locationObj;
              } else if (/work/i.test(this.props.favoritePlace_label)) {
                //Work
                this.props.App.user_favorites_destinations[1].location_infos = locationObj;
              }
              //SAVE the favorite places to the local storage
              SyncStorage.set(
                '@favorite_places',
                this.props.App.user_favorites_destinations,
              );
              //CLOSE THE MODAL
              this.dismissBackSearchNodeMain();
            } //Normal mode
            else {
              this.props.UpdateDestinationDetails({
                passengerIndex: 1,
                locationObject: locationObj,
              });
            }
          } else if (this.props.App.search_currentFocusedPassenger === 2) {
            this.props.UpdateDestinationDetails({
              passengerIndex: 2,
              locationObject: locationObj,
            });
          } else if (this.props.App.search_currentFocusedPassenger === 3) {
            this.props.UpdateDestinationDetails({
              passengerIndex: 3,
              locationObject: locationObj,
            });
          } else if (this.props.App.search_currentFocusedPassenger === 4) {
            this.props.UpdateDestinationDetails({
              passengerIndex: 4,
              locationObject: locationObj,
            });
          }
          //Check if all the location have been filled, if yes, auto dismiss the search window and move forward.
          if (
            this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
              .numberOfPassengersSelected === 1
          ) {
            if (
              this.props.App.search_passengersDestinations
                .passenger1Destination !== false
            ) {
              //Restore pickup location to current pickup location if no custom location was selected
              if (
                this.props.App.search_pickupLocationInfos
                  .passenger0Destination === false
              ) {
                this.props.App.search_currentFocusedPassenger = 0; //Very important refocus on the pickup location field
                this._onDestinationSelect(false, 'currentPickupLocation');
              }
              //All locations filled
              this.props.UpdateProcessFlowState({flowDirection: 'next'});
            }
          } else if (
            this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
              .numberOfPassengersSelected === 2
          ) {
            if (
              this.props.App.search_passengersDestinations
                .passenger1Destination !== false &&
              this.props.App.search_passengersDestinations
                .passenger2Destination !== false
            ) {
              //Restore pickup location to current pickup location if no custom location was selected
              if (
                this.props.App.search_pickupLocationInfos
                  .passenger0Destination === false
              ) {
                this.props.App.search_currentFocusedPassenger = 0; //Very important refocus on the pickup location field
                this._onDestinationSelect(false, 'currentPickupLocation');
              }
              //All locations filled
              this.props.UpdateProcessFlowState({flowDirection: 'next'});
            }
          } else if (
            this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
              .numberOfPassengersSelected === 3
          ) {
            if (
              this.props.App.search_passengersDestinations
                .passenger1Destination !== false &&
              this.props.App.search_passengersDestinations
                .passenger2Destination !== false &&
              this.props.App.search_passengersDestinations
                .passenger3Destination !== false
            ) {
              //Restore pickup location to current pickup location if no custom location was selected
              if (
                this.props.App.search_pickupLocationInfos
                  .passenger0Destination === false
              ) {
                this.props.App.search_currentFocusedPassenger = 0; //Very important refocus on the pickup location field
                this._onDestinationSelect(false, 'currentPickupLocation');
              }
              //All locations filled
              this.props.UpdateProcessFlowState({flowDirection: 'next'});
            }
          } else if (
            this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
              .numberOfPassengersSelected === 4
          ) {
            if (
              this.props.App.search_passengersDestinations
                .passenger1Destination !== false &&
              this.props.App.search_passengersDestinations
                .passenger2Destination !== false &&
              this.props.App.search_passengersDestinations
                .passenger3Destination !== false &&
              this.props.App.search_passengersDestinations
                .passenger4Destination !== false
            ) {
              //Restore pickup location to current pickup location if no custom location was selected
              if (
                this.props.App.search_pickupLocationInfos
                  .passenger0Destination === false
              ) {
                this.props.App.search_currentFocusedPassenger = 0; //Very important refocus on the pickup location field
                this._onDestinationSelect(false, 'currentPickupLocation');
              }
              //All locations filled
              this.props.UpdateProcessFlowState({flowDirection: 'next'});
            }
          }
        }
      }
    });
  }

  /**
   * @func fire_search_animation()
   * Responsible for launching the animation of the line loader on query processing.
   */
  fire_search_animation() {
    let globalObject = this;
    InteractionManager.runAfterInteractions(() => {
      if (this.props.App.search_showLocationSearch_loader) {
        Animated.timing(this.props.App.search_loaderPosition, {
          toValue: this.props.App.windowWidth,
          duration: 500,
          easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(this.props.App.search_loaderPosition, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            setTimeout(function () {
              globalObject.fire_search_animation();
            }, 300);
          });
        });
      }
    });
  }

  /**
   * @func invoke_searchNode()
   * Responsible for the animation for the seach window components: header and footer, closing gate kind of animation.
   */
  invoke_searchNode() {
    if (this.props.App.search_showSearchNodeMain) {
      let globalObj = this;
      Animated.parallel([
        Animated.timing(this.props.App.search_headerSearchNodePosition, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(globalObj.props.App.search_resultsSearchNodeOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(globalObj.props.App.search_resultSearchNodePosition, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start(() => {
        //Done
      });
    }
  }

  /**
   * @func renderFavoritePlaces()
   * Responsible for rendering the favorite places like HOME and WORK, etc..when no search is engaged by the user.
   * Render also pickup from current location when pickup location is selected
   */
  renderFavoritePlaces() {
    //Check the focus, pickup location ? (focus 0) or destination locations (other than 0)
    if (this.props.App.search_currentFocusedPassenger === 0) {
      //Pickup location field
      return (
        <View>
          <TouchableOpacity
            onPress={() =>
              this._onDestinationSelect(false, 'currentPickupLocation')
            }
            style={styles.locationRender}>
            <View>
              <IconMaterialM
                name={'my-location'}
                size={25}
                style={{paddingRight: 20}}
              />
            </View>
            <View>
              <Text
                style={[
                  {fontSize: 16, fontFamily: 'Allrounder-Grotesk-Medium'},
                ]}>
                Set to my current location
              </Text>
              <View style={{flexDirection: 'row', marginTop: 5}}>
                <Text
                  style={[
                    styles.detailsSearchRes,
                    {fontFamily: 'Allrounder-Grotesk-Book'},
                  ]}>
                  {this.props.App.userCurrentLocationMetaData.street !==
                  undefined
                    ? this.props.App.userCurrentLocationMetaData.street !==
                      undefined
                      ? this.props.App.userCurrentLocationMetaData.street
                      : this.props.App.userCurrentLocationMetaData.name
                    : 'Searching...'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    } //Common destination favorite places
    else {
      let globalObject = this;
      return (
        <View>
          {this.props.App.user_favorites_destinations.map((place, index) => {
            if (place.location_infos !== false) {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    place.location_infos !== false
                      ? this._onDestinationSelect(place.location_infos)
                      : globalObject.props.parentNode.props.navigation.navigate(
                          'SettingsEntryScreen',
                        );
                  }}
                  style={styles.locationRender}>
                  <View>
                    {place.name !== 'Gym' ? (
                      <Icon
                        name={place.icon}
                        size={20}
                        style={{paddingRight: 20}}
                        color="#096ED4"
                      />
                    ) : (
                      <IconMaterial
                        name={place.icon}
                        size={21}
                        style={{paddingRight: 20}}
                        color="#096ED4"
                      />
                    )}
                  </View>
                  <View>
                    <Text style={[systemWeights.semibold, {fontSize: 16.5}]}>
                      {place.name}
                    </Text>
                    <View style={{flexDirection: 'row', marginTop: 5}}>
                      {place.location_infos !== false ? (
                        <>
                          <Text
                            style={[
                              {
                                fontSize: 14,
                                fontFamily: 'Allrounder-Grotesk-Book',
                              },
                            ]}>
                            {place.location_infos.location_name !== false
                              ? place.location_infos.location_name.length > 35
                                ? place.location_infos.location_name.substring(
                                    0,
                                    35,
                                  ) + '...'
                                : place.location_infos.location_name
                              : place.location_infos.street === undefined
                              ? ''
                              : place.location_infos.street === false
                              ? ''
                              : place.location_infos.street.length > 20
                              ? place.location_infos.street.substring(0, 20) +
                                '. '
                              : place.location_infos.street + '  '}
                          </Text>
                        </>
                      ) : (
                        <Text
                          style={[
                            styles.detailsSearchRes,
                            {fontFamily: 'Allrounder-Grotesk-Book'},
                          ]}>
                          Add a location.
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            } //Skip the favorite
            else {
              return null;
            }
          })}
        </View>
      );
    }
  }

  /**
   * @func renderSearch()
   * Responsible for revealing the search results when the user is tiping.
   */
  renderSearch() {
    return (
      <Animated.View
        style={[
          styles.resultsSearchNode,
          {
            opacity: this.props.App.search_resultsSearchNodeOpacity,
            transform: [
              {translateY: this.props.App.search_resultSearchNodePosition},
            ],
          },
        ]}>
        <ScrollView
          persistentScrollbar={true}
          keyboardShouldPersistTaps={'always'}>
          {this.props.App.search_metadataResponse.length === 0
            ? this.props.showSimplified !== undefined &&
              this.props.showSimplified
              ? null
              : this.renderFavoritePlaces()
            : this.props.App.search_querySearch.trim().length === 0
            ? this.props.showSimplified !== undefined &&
              this.props.showSimplified
              ? null
              : this.renderFavoritePlaces()
            : this.props.App.search_metadataResponse.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={index + 1}
                    onPress={() => this._onDestinationSelect(item)}
                    style={styles.locationRender}>
                    <View>
                      <IconFontisto
                        name="map-marker-alt"
                        size={20}
                        style={{paddingRight: 20, top: 2}}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          {
                            fontSize: 15.5,
                            fontFamily: 'Allrounder-Grotesk-Medium',
                          },
                        ]}>
                        {item.location_name.length > 35
                          ? item.location_name.substring(0, 35) + '...'
                          : item.location_name}
                      </Text>
                      <View style={{flexDirection: 'row', marginTop: 5}}>
                        <Text
                          style={[
                            styles.detailsSearchRes,
                            {fontFamily: 'Allrounder-Grotesk-Regular'},
                          ]}>
                          {item.street === undefined
                            ? ''
                            : item.street === false
                            ? ''
                            : item.street.length > 20
                            ? item.street.substring(0, 20) + '. '
                            : item.street + '  '}
                        </Text>
                        <Text
                          style={[
                            {
                              color: '#707070',
                              paddingRight: item.city === undefined ? 0 : 10,
                              fontFamily: 'Allrounder-Grotesk-Regular',
                            },
                          ]}>
                          {item.city === undefined ? '' : item.city}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
        </ScrollView>
      </Animated.View>
    );
  }

  /**
   * @func dismissBackSearchNodeMain()
   * Responsible for closing the search window.
   * Native drivers is the first citizen.
   */
  dismissBackSearchNodeMain() {
    let globalObj = this;
    InteractionManager.runAfterInteractions(() => {
      //Close the search node backward (not moving forward showing the trip itinerary)
      if (
        globalObj.props.showSimplified === undefined ||
        globalObj.props.showSimplified === false
      ) {
        //Normal mode
        globalObj.props.UpdateProcessFlowState({flowDirection: 'previous'});
      }
      Animated.parallel([
        Animated.timing(globalObj.props.App.search_headerSearchNodePosition, {
          toValue: -500,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(globalObj.props.App.search_resultsSearchNodeOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(globalObj.props.App.search_resultSearchNodePosition, {
          toValue: 90,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        globalObj.props.App.search_querySearch = '';
        globalObj.props.UpdateSearchMetadataLoaderState({
          search_showSearchNodeMain: false,
          search_metadataResponse: [],
        });
        //...Close modal on simplified mode
        if (
          globalObj.props.showSimplified !== undefined &&
          globalObj.props.showSimplified
        ) {
          //Simplifed mode
          globalObj.props.App.search_passenger1DestinationInput = ''; //Clear the field 1 input
          //! RESET TRIP DATA
          //globalObj.props.ResetStateProps(true);
          //...
          globalObj.props.UpdateErrorModalLog(false, false, 'any');
        }
      });
    });
  }

  /**
   * @func continueNextSearchNodeMain()
   * Responsible for closing the search window and move forward in the flow process.
   * Native drivers is the first class citizen.
   */
  continueNextSearchNodeMain() {
    let globalObj = this;
    InteractionManager.runAfterInteractions(() => {
      //Close the search node backward (not moving forward showing the trip itinerary)
      Animated.parallel([
        Animated.timing(globalObj.props.App.search_headerSearchNodePosition, {
          toValue: -500,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(globalObj.props.App.search_resultsSearchNodeOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(globalObj.props.App.search_resultSearchNodePosition, {
          toValue: 90,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        globalObj.props.App.search_querySearch = '';
        globalObj.props.UpdateSearchMetadataLoaderState({
          search_showSearchNodeMain: false,
          search_metadataResponse: [],
        });
        globalObj.props.UpdateProcessFlowState({flowDirection: 'next'});
      });
    });
  }

  /**
   * @func renderRouter()
   * Responsible for rendering the search window of the normal window of the current process.
   * Main props.App variable: search_showSearchNodeMain
   */
  renderRouter() {
    //1. Search destination called
    if (this.props.App.search_showSearchNodeMain) {
      return (
        <View style={styles.mainWindow}>
          <StatusBar backgroundColor="#000" barStyle="light-content" />
          <Animated.View
            style={[
              styles.headerSearchNode,
              {
                transform: [
                  {translateY: this.props.App.search_headerSearchNodePosition},
                ],
              },
            ]}>
            <TouchableOpacity
              onPress={() => this.dismissBackSearchNodeMain()}
              style={styles.backArrowHeaderSearch}>
              <IconAnt name="arrowleft" size={28} />
            </TouchableOpacity>
            <View style={{flexDirection: 'row'}}>
              <View style={[styles.imageSearchNode]}>
                {this.props.showSimplified !== undefined &&
                this.props.showSimplified ? null : (
                  <>
                    <View style={styles.doBlackImageSearch} />
                    <View style={styles.lineMiddleImageSearch} />
                  </>
                )}
                <View style={styles.squareBlueImageSearch} />
              </View>
              <View style={[styles.inputSearchNode]}>
                {this.props.showSimplified !== undefined &&
                this.props.showSimplified ? null : (
                  <TextInput
                    style={[
                      {
                        fontSize: 16.5,
                        borderWidth: 0.5,
                        padding: 10,
                        paddingTop: 5,
                        paddingBottom: 7,
                        borderRadius: 3,
                        backgroundColor: '#fcfcfc',
                        borderColor: '#e7e7e7',
                        fontFamily: 'Allrounder-Grotesk-Regular',
                      },
                    ]}
                    placeholder="Where are you?"
                    selectTextOnFocus
                    onChangeText={(text) => this._searchForThisQuery(text, 0)}
                    value={
                      this.props.App.search_pickupLocationInfos
                        .isBeingPickedupFromCurrentLocation &&
                      this.props.App.search_pickupLocationInfos
                        .search_passenger0DestinationInput === false
                        ? this.props.App.userCurrentLocationMetaData.street !==
                          undefined
                          ? this.props.App.userCurrentLocationMetaData
                              .street !== undefined
                            ? this.props.App.userCurrentLocationMetaData.street
                            : this.props.App.userCurrentLocationMetaData.name
                          : 'Searching...'
                        : this.props.App.search_pickupLocationInfos
                            .search_passenger0DestinationInput === false
                        ? ''
                        : this.props.App.search_pickupLocationInfos
                            .search_passenger0DestinationInput
                    }
                    clearButtonMode="always"
                    onFocus={() =>
                      this.props.UpdateSearchMetadataLoaderState({
                        search_currentFocusedPassenger: 0,
                      })
                    }
                    autoCorrect={false}
                  />
                )}

                {this.renderDestinationStaged_inputs()}
              </View>
            </View>
          </Animated.View>
          <Animated.View
            style={[
              {
                backgroundColor: '#fff',
                transform: [
                  {translateY: this.props.App.search_headerSearchNodePosition},
                ],
              },
            ]}>
            <Animated.View
              style={[
                styles.loader,
                {
                  borderTopColor: this.props.App
                    .search_showLocationSearch_loader
                    ? '#000'
                    : '#fff',
                  transform: [
                    {translateX: this.props.App.search_loaderPosition},
                  ],
                },
              ]}
            />
          </Animated.View>

          {this.renderSearch()}
        </View>
      );
    } //Normal window
    else {
      return null;
    }
  }

  /**
   * @func renderDestinationStaged_inputs()
   * Responsible for dynamically propose destination input texts based on the number of users sepcified
   * and if they are going to the same place (1 input) or not (X inputs)
   */
  renderDestinationStaged_inputs() {
    //! Limit staged input to 1 for the simplified mode
    if (this.props.showSimplified !== undefined && this.props.showSimplified) {
      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata.numberOfPassengersSelected = 1;
    }
    //! ------
    if (
      this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
        .isAllgoingToTheSamePlace
    ) {
      //Only one destination
      return (
        <TextInput
          autoFocus={true}
          style={[styles.mainSearchBar, {marginBottom: 15}]}
          placeholder="Where are you going?"
          onChangeText={(text) => this._searchForThisQuery(text, 1)}
          value={
            this.props.App.search_passenger1DestinationInput === false
              ? ''
              : this.props.App.search_passenger1DestinationInput
          }
          clearButtonMode="always"
          onFocus={() =>
            this.props.UpdateSearchMetadataLoaderState({
              search_currentFocusedPassenger: 1,
            })
          }
          autoCorrect={false}
        />
      );
    } //Many or one possible destinations
    else {
      if (
        this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
          .numberOfPassengersSelected === 1
      ) {
        return (
          <TextInput
            autoFocus={true}
            style={[styles.mainSearchBar, {marginBottom: 15}]}
            placeholder={
              this.props.showSimplified !== undefined &&
              this.props.showSimplified &&
              this.props.favoritePlace_label !== undefined
                ? `Where's your ${this.props.favoritePlace_label}?`
                : 'Where are you going?'
            }
            onChangeText={(text) => this._searchForThisQuery(text, 1)}
            value={
              this.props.App.search_passenger1DestinationInput === false
                ? ''
                : this.props.App.search_passenger1DestinationInput
            }
            clearButtonMode="always"
            onFocus={() =>
              this.props.UpdateSearchMetadataLoaderState({
                search_currentFocusedPassenger: 1,
              })
            }
            autoCorrect={false}
          />
        );
      } else if (
        this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
          .numberOfPassengersSelected === 2
      ) {
        return (
          <>
            <TextInput
              autoFocus={true}
              style={[styles.mainSearchBar, {marginBottom: 10}]}
              placeholder="Passenger's 1 destination"
              onChangeText={(text) => this._searchForThisQuery(text, 1)}
              value={
                this.props.App.search_passenger1DestinationInput === false
                  ? ''
                  : this.props.App.search_passenger1DestinationInput
              }
              clearButtonMode="always"
              onFocus={() =>
                this.props.UpdateSearchMetadataLoaderState({
                  search_currentFocusedPassenger: 1,
                })
              }
              autoCorrect={false}
            />
            <TextInput
              style={[styles.mainSearchBar, {marginTop: 0, marginBottom: 10}]}
              placeholder="Passenger's 2 destination"
              onChangeText={(text) => this._searchForThisQuery(text, 2)}
              value={
                this.props.App.search_passenger2DestinationInput === false
                  ? ''
                  : this.props.App.search_passenger2DestinationInput
              }
              clearButtonMode="always"
              onFocus={() =>
                this.props.UpdateSearchMetadataLoaderState({
                  search_currentFocusedPassenger: 2,
                })
              }
              autoCorrect={false}
            />
          </>
        );
      } else if (
        this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
          .numberOfPassengersSelected === 3
      ) {
        return (
          <>
            <TextInput
              autoFocus={true}
              style={[styles.mainSearchBar, {marginBottom: 10}]}
              placeholder="Passenger's 1 destination"
              onChangeText={(text) => this._searchForThisQuery(text, 1)}
              value={
                this.props.App.search_passenger1DestinationInput === false
                  ? ''
                  : this.props.App.search_passenger1DestinationInput
              }
              clearButtonMode="always"
              onFocus={() =>
                this.props.UpdateSearchMetadataLoaderState({
                  search_currentFocusedPassenger: 1,
                })
              }
              autoCorrect={false}
            />
            <TextInput
              style={[styles.mainSearchBar, {marginTop: 0, marginBottom: 10}]}
              placeholder="Passenger's 2 destination"
              onChangeText={(text) => this._searchForThisQuery(text, 2)}
              value={
                this.props.App.search_passenger2DestinationInput === false
                  ? ''
                  : this.props.App.search_passenger2DestinationInput
              }
              clearButtonMode="always"
              onFocus={() =>
                this.props.UpdateSearchMetadataLoaderState({
                  search_currentFocusedPassenger: 2,
                })
              }
              autoCorrect={false}
            />
            <TextInput
              style={[styles.mainSearchBar, {marginTop: 0, marginBottom: 10}]}
              placeholder="Passenger's 3 destination"
              onChangeText={(text) => this._searchForThisQuery(text, 3)}
              value={
                this.props.App.search_passenger3DestinationInput === false
                  ? ''
                  : this.props.App.search_passenger3DestinationInput
              }
              clearButtonMode="always"
              onFocus={() =>
                this.props.UpdateSearchMetadataLoaderState({
                  search_currentFocusedPassenger: 3,
                })
              }
              autoCorrect={false}
            />
          </>
        );
      } else if (
        this.props.App.bottomVitalsFlow.rideOrDeliveryMetadata
          .numberOfPassengersSelected === 4
      ) {
        return (
          <>
            <TextInput
              autoFocus={true}
              style={[styles.mainSearchBar, {marginBottom: 10}]}
              placeholder="Passenger's 1 destination"
              onChangeText={(text) => this._searchForThisQuery(text, 1)}
              value={
                this.props.App.search_passenger1DestinationInput === false
                  ? ''
                  : this.props.App.search_passenger1DestinationInput
              }
              clearButtonMode="always"
              onFocus={() =>
                this.props.UpdateSearchMetadataLoaderState({
                  search_currentFocusedPassenger: 1,
                })
              }
              autoCorrect={false}
            />
            <TextInput
              style={[styles.mainSearchBar, {marginTop: 0, marginBottom: 10}]}
              placeholder="Passenger's 2 destination"
              onChangeText={(text) => this._searchForThisQuery(text, 2)}
              value={
                this.props.App.search_passenger2DestinationInput === false
                  ? ''
                  : this.props.App.search_passenger2DestinationInput
              }
              clearButtonMode="always"
              onFocus={() =>
                this.props.UpdateSearchMetadataLoaderState({
                  search_currentFocusedPassenger: 2,
                })
              }
              autoCorrect={false}
            />
            <TextInput
              style={[styles.mainSearchBar, {marginTop: 0, marginBottom: 10}]}
              placeholder="Passenger's 3 destination"
              onChangeText={(text) => this._searchForThisQuery(text, 3)}
              value={
                this.props.App.search_passenger3DestinationInput === false
                  ? ''
                  : this.props.App.search_passenger3DestinationInput
              }
              clearButtonMode="always"
              onFocus={() =>
                this.props.UpdateSearchMetadataLoaderState({
                  search_currentFocusedPassenger: 3,
                })
              }
              autoCorrect={false}
            />
            <TextInput
              style={[styles.mainSearchBar, {marginTop: 0, marginBottom: 15}]}
              placeholder="Passenger's 4 destination"
              onChangeText={(text) => this._searchForThisQuery(text, 4)}
              value={
                this.props.App.search_passenger4DestinationInput === false
                  ? ''
                  : this.props.App.search_passenger4DestinationInput
              }
              clearButtonMode="always"
              onFocus={() =>
                this.props.UpdateSearchMetadataLoaderState({
                  search_currentFocusedPassenger: 4,
                })
              }
              autoCorrect={false}
            />
          </>
        );
      }
    }
  }

  render() {
    this.fire_search_animation();
    return <View style={styles.window}>{this.renderRouter()}</View>;
  }
}

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      UpdateSearchMetadataLoaderState,
      UpdateProcessFlowState,
      UpdateDestinationDetails,
      UpdateDestinationInputValues,
      UpdateCustomPickupDetails,
      UpdateErrorModalLog,
      ResetStateProps,
    },
    dispatch,
  );

const styles = StyleSheet.create({
  window: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 90000000000,
  },
  mainWindow: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backArrowHeaderSearch: {
    width: 50,
    marginLeft: -5,
    paddingBottom: 5,
  },
  loader: {
    borderTopWidth: 4,
    width: 10,
    marginBottom: 10,
  },
  detailsSearchRes: {
    color: '#707070',
    fontSize: 15,
  },
  headerSearchNode: {
    borderBottomWidth: 1,
    padding: 20,
    paddingTop: 15,
    paddingBottom: 0,
    borderBottomColor: '#fff',
    backgroundColor: '#fff',
    shadowColor: '#707070',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,

    elevation: 5,
  },
  imageSearchNode: {
    height: 80,
    top: -2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doBlackImageSearch: {
    borderWidth: 1,
    width: 6,
    height: 6,
    borderRadius: 200,
    backgroundColor: '#000',
  },
  lineMiddleImageSearch: {
    borderLeftWidth: 1,
    height: 44,
    width: 1,
    marginTop: 2,
    marginBottom: 2,
  },
  squareBlueImageSearch: {
    borderColor: '#096ED4',
    width: 9,
    height: 9,
    borderRadius: 1,
    backgroundColor: '#096ED4',
  },
  inputSearchNode: {
    flex: 1,
    paddingLeft: 10,
    minHeight: 110,
  },
  mainSearchBar: {
    borderWidth: 1,
    borderColor: '#e7e7e7',
    padding: 10,
    color: '#096ED4',
    borderRadius: 3,
    marginTop: 20,
    marginBottom: 25,
    fontSize: 17.5,
    backgroundColor: '#e7e7e7',
    fontFamily: 'Allrounder-Grotesk-Regular',
  },
  resultsSearchNode: {
    padding: 20,
    paddingTop: 0,
    flex: 1,
    backgroundColor: '#fff',
  },
  locationRender: {
    paddingTop: 10,
    paddingBottom: 15,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d0d0d0',
    marginBottom: 5,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Search);
