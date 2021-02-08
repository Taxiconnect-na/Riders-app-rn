import React from 'react';
import {View, Animated, StyleSheet, Easing, Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;

class GenericLoader extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loaderPosition: new Animated.Value(0), //For animation loader
      loaderBasicWidth: new Animated.Value(1), //First with for the loader - scale
      showLocationSearch_loader: false,
    };
  }

  /**
   * ANIMATIONS' FUNCTIONS
   * ONLY USE ANIMATION WITH NATIVE DRIVER ENABLED. - Make a way.
   */
  /**
   * @func fire_search_animation
   * 1. Loader animation - init or during an operation
   */
  fire_search_animation() {
    if (this.state.showLocationSearch_loader) {
      let globalObject = this;
      Animated.timing(this.state.loaderPosition, {
        toValue: windowWidth,
        duration: 500,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
        useNativeDriver: true,
      }).start(() => {
        if (globalObject.state.loaderBasicWidth === 1) {
          //Resize the length at the same time
          Animated.parallel([
            Animated.timing(globalObject.state.loaderBasicWidth, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(globalObject.state.loaderPosition, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start(() => {
            globalObject.fire_search_animation();
          });
        } //Length fine, just go on
        else {
          Animated.timing(globalObject.state.loaderPosition, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            globalObject.fire_search_animation();
          });
        }
      });
    }
  }

  /**
   * @func resetAnimationLoader
   * Reset the line loader to the default values
   */
  resetAnimationLoader() {
    let globalObject = this;
    this.state.showLocationSearch_loader = false;
    Animated.timing(globalObject.state.loaderPosition, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(globalObject.state.loaderBasicWidth, {
        toValue: windowWidth,
        duration: 3000,
        useNativeDriver: true,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
      }).start(() => {
        globalObject.state.showLocationSearch_loader = false;
      });
    });
  }

  /**
   * @func checkAnimationState
   * @param state: the state prop received
   * Responsible for checking and updating the state of the loader component
   * based on the received props.
   */
  checkAnimationState(state) {
    if (state !== undefined && state !== null) {
      if (state && this.state.showLocationSearch_loader === false) {
        //Active
        this.state.showLocationSearch_loader = state;
        //..
        this.fire_search_animation();
      } else if (state === false) {
        //Deactivate
        if (this.state.showLocationSearch_loader !== false) {
          //Only deactivate if active
          this.state.showLocationSearch_loader = state;
          //..
          this.fire_search_animation();
        }
      }
    }
  }

  render() {
    return (
      <View style={{width: '100%'}}>
        <Animated.View
          style={[
            styles.loader,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              borderTopWidth:
                this.props.thickness !== undefined &&
                this.props.thickness !== null
                  ? this.props.thickness
                  : 6,
              borderTopColor:
                this.props.active !== undefined && this.props.active
                  ? this.props.color !== undefined && this.props.color !== null
                    ? this.props.color
                    : '#000'
                  : this.props.backgroundColor !== undefined &&
                    this.props.backgroundColor
                  ? this.props.backgroundColor
                  : '#fff',
              transform: [
                {
                  translateX: this.state.loaderPosition,
                },
                {
                  scaleX: this.state.loaderBasicWidth,
                },
              ],
            },
          ]}
        />
        {this.checkAnimationState(this.props.active)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loader: {
    borderTopWidth: 6,
    width: 20,
    marginBottom: 10,
  },
});

export default React.memo(GenericLoader);
