import React from 'react';
import {connect} from 'react-redux';
import {
  Animated,
  PointAnnotation,
  MarkerView,
} from '@react-native-mapbox-gl/maps';
import {View} from 'react-native';
import AnnotationDestination from './AnnotationDestination';
import AnnotationPickup from './AnnotationPickup';

class PreviewRoute extends React.PureComponent {
  constructor(props) {
    super(props);

    this.previewRouteToDestinationSnapshot_render = this.previewRouteToDestinationSnapshot_render.bind(
      this,
    );
  }

  /**
   * @func previewRouteToDestinationSnapshot_render
   * Responsible for showing to the user the way to the first destination after selecting
   * the destination location on the booking flow. -> Find the best anchor combination
   */
  previewRouteToDestinationSnapshot_render() {
    if (
      this.props.App.previewDestinationData.originDestinationPreviewData !==
        undefined &&
      this.props.App.previewDestinationData.originDestinationPreviewData !==
        false
    ) {
      //Reposition MarkerViews optimally
      //Destination anchor
      this.props.parentNodeDirect.repositionMaviewMarker(
        this.props.App.previewDestinationData.originDestinationPreviewData
          .routePoints.coordinates[
          this.props.App.previewDestinationData.originDestinationPreviewData
            .routePoints.coordinates.length - 1
        ],
        'destination',
      );
      //Origin anchor
      this.props.parentNodeDirect.repositionMaviewMarker(
        this.props.App.previewDestinationData.originDestinationPreviewData
          .routePoints.coordinates[0],
        'origin',
      );

      //Fit to bounds
      this.props.parentNode.recalibrateMap();
      //...
      return (
        <>
          <MarkerView
            id="riderPickupLocation_tooltip"
            anchor={this.props.App.previewDestinationData.destinationAnchor}
            coordinate={
              this.props.App.previewDestinationData.originDestinationPreviewData
                .routePoints.coordinates[
                this.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints.coordinates.length -
                  1
              ]
            }>
            <AnnotationDestination
              title={
                this.props.App.search_passengersDestinations
                  .passenger1Destination.location_name !== undefined &&
                this.props.App.search_passengersDestinations
                  .passenger1Destination.location_name !== false
                  ? this.props.App.search_passengersDestinations
                      .passenger1Destination.location_name
                  : this.props.App.search_passengersDestinations
                      .passenger1Destination.street_name !== undefined &&
                    this.props.App.search_passengersDestinations
                      .passenger1Destination.street_name !== false
                  ? this.props.App.search_passengersDestinations
                      .passenger1Destination.street_name
                  : 'Destination'
              }
              etaInfos={{
                eta: this.props.App.previewDestinationData
                  .originDestinationPreviewData.eta,
              }}
              showSuffix={true}
            />
          </MarkerView>

          <Animated.ShapeSource
            id={'shapeas'}
            shape={
              new Animated.Shape({
                type: 'LineString',
                coordinates: this.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints.coordinates,
              })
            }>
            <Animated.LineLayer
              id={'lineRoutePickupLine'}
              style={{
                lineCap: 'round',
                lineWidth: 4,
                lineOpacity: 1,
                lineColor: '#096ED4',
              }}
            />
          </Animated.ShapeSource>

          <PointAnnotation
            id={'originAnnotationPreview'}
            aboveLayerID={'lineRoutePickup'}
            coordinate={
              this.props.App.previewDestinationData.originDestinationPreviewData
                .routePoints.coordinates[
                this.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints.coordinates.length -
                  1
              ]
            }>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: '#096ED4',
              }}
            />
          </PointAnnotation>
          <MarkerView
            id="riderPickupLocation_tooltip"
            anchor={this.props.App.previewDestinationData.originAnchor}
            coordinate={
              this.props.App.previewDestinationData.originDestinationPreviewData
                .routePoints.coordinates[0]
            }>
            <AnnotationPickup
              title={
                this.props.App.search_pickupLocationInfos
                  .isBeingPickedupFromCurrentLocation === false &&
                this.props.App.search_pickupLocationInfos
                  .passenger0Destination !== false
                  ? this.props.App.search_pickupLocationInfos
                      .passenger0Destination.location_name !== undefined &&
                    this.props.App.search_pickupLocationInfos
                      .passenger0Destination.location_name !== false
                    ? this.props.App.search_pickupLocationInfos
                        .passenger0Destination.location_name
                    : this.props.App.search_pickupLocationInfos
                        .passenger0Destination.street !== undefined &&
                      this.props.App.search_pickupLocationInfos
                        .passenger0Destination.street !== false
                    ? this.props.App.search_pickupLocationInfos
                        .passenger0Destination.street
                    : 'Pickup location'
                  : 'My location'
              }
            />
          </MarkerView>
        </>
      );
    } else {
      return null;
    }
  }

  render() {
    return <>{this.previewRouteToDestinationSnapshot_render()}</>;
  }
}

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default React.memo(connect(mapStateToProps)(PreviewRoute));
