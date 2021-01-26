import React from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  BackHandler,
  Linking,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import call from 'react-native-phone-call';

class SupportEntry extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  handleBackButton = () => {
    this.props.navigation.navigate('Home_drawer');
    return true;
  };

  componentDidMount() {
    let globalObject = this;
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    //Add home going back handler-----------------------------
    this.props.navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
      globalObject.props.navigation.navigate('Home_drawer');
      return;
    });
    //--------------------------------------------------------
  }

  render() {
    return (
      <ScrollView style={styles.mainContainer}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <View style={{width: 100, height: 100}}>
            <Image
              source={require('../../Media_assets/Images/supportIcon.png')}
              style={{width: 90, height: 90, resizeMode: 'cover'}}
            />
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
            }}>
            <Text style={{textAlign: 'center', fontSize: 16}}>
              If you <Text style={{fontWeight: 'bold'}}>left</Text> your
              belongings in the taxi or you need{' '}
              <Text style={{fontWeight: 'bold'}}>assistance</Text> on using the{' '}
              <Text style={{fontWeight: 'bold'}}>TaxiConnect platform</Text>.
            </Text>
            <Text style={{textAlign: 'center', fontSize: 16, marginBottom: 20}}>
              If there is an <Text style={{fontWeight: 'bold'}}>emergency</Text>{' '}
              and you need to contact the{' '}
              <Text style={{fontWeight: 'bold'}}>police</Text>.
            </Text>

            <TouchableOpacity
              style={[styles.buttonBasic, {marginBottom: 10}]}
              onPress={() => call({number: '+264814400089', prompt: true})}>
              <IconCommunity name="phone" color={'#fff'} />
              <Text style={{fontSize: 17, fontWeight: 'bold', color: '#fff'}}>
                Call TaxiConnect
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonBasic}
              onPress={() => call({number: '061302302', prompt: true})}>
              <IconCommunity name="shield" color={'#fff'} />
              <Text style={{fontSize: 17, fontWeight: 'bold', color: '#fff'}}>
                Call City Police
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
    padding: 30,
    backgroundColor: '#fff',
    paddingBottom: 200,
    flex: 1,
  },
  introContainer: {
    borderWidth: 1,
    borderColor: '#0e8491',
    padding: 15,
    backgroundColor: '#0e8491',
    borderRadius: 5,
  },
  nodeLogRides: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    height: 65,
    padding: 10,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 100,
    flexDirection: 'row',
  },
  basicInput: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#fafafa',
    marginBottom: 10,
    marginTop: 7,
    height: 50,
    width: 250,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 4,
  },
  buttonBasic: {
    borderWidth: 1,
    borderColor: '#0e8491',
    backgroundColor: '#0e8491',
    padding: 14,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    width: 250,
    flexDirection: 'row',
  },
});

export default SupportEntry;
