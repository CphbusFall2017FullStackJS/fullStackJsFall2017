import React, { Component } from 'react';
import { Platform, Text, View, StyleSheet, TouchableHighlight, Alert } from 'react-native';
import { Constants, Location, MapView, Permissions } from 'expo';
import MyButton from "./Btn.js";
const SERVER_URL = "http://138.68.98.213";


export default class App extends Component {

  constructor() {
    super();

    fetch(`${SERVER_URL}/geoapi/allowedarea`)
      .then(res => res.json())
      .then(res => {
        this.setState({ allowedArea: res.coordinates, serverIsUp: true });
      }).catch(err => {
        this.setState({ serverIsUp: false });
      })

    console.ignoredYellowBox = ['Warning: View.propTypes'];
    
    this.state = {
      location: null,
      errorMessage: null,
      allowedArea: [],
      initialRegion: null,
      serverIsUp: false,
      statusBarHeight: Constants.statusBarHeight - 1
    };
  }

  componentWillMount() {
    //Hack to ensure the showsMyLocationButton is shown initially. Idea is to force a repaint
    setTimeout(() => this.setState({ statusBarHeight: Constants.statusBarHeight }), 500);
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }
    console.log("Fetching location")
    let location = await Location.getCurrentPositionAsync({});
    this.setState(
      {
        location,
        initialRegion: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }
      });
  };

  onPress = (event) => {
    const coordinate = event.nativeEvent.coordinate;
    const pos = { coordinates: [coordinate.longitude, coordinate.latitude] };

    console.log("Location for press: " + JSON.stringify(pos));
    fetch(`${SERVER_URL}/geoapi`, {
      method: "post",
      body: JSON.stringify(pos),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
      .then(res => res.json())
      .then(res => {
        console.log(JSON.stringify(res));
        this.setState({ status: res.msg });
        setTimeout(() => this.setState({ status: "- - - - - - - - - - - - - - - - - - - -" }), 2000);
      }).catch(err => {
        Alert.alert("Error", "Server could not be reached")
        this.setState({ serverIsUp: false });
      })
  }

  onCenterGameArea = () => {
    //Hardcoded, should be calculated as center of polygon received from server
    const latitude = 55.777055745928664;
    const longitude = 12.55897432565689;
    this.refs.map.animateToRegion({
      latitude,
      longitude,
      /* latitudeDelta: 0.0922,
       longitudeDelta: 0.0421,*/
      latitudeDelta: 0.002,
      longitudeDelta: 0.04,
    }, 1000);
  }

  onPressButton = (realData) => {
    console.log("You tapped the button! " + realData);
    let pos;
    if (realData) {
      pos = { coordinates: [this.state.location.coords.latitude, this.state.location.coords.longitude] };
    }
    console.log(JSON.stringify(pos));
    fetch(`${SERVER_URL}/geoapi`, {
      method: "post",
      body: JSON.stringify(pos),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
      .then(res => res.json())
      .then(res => {
        console.log(JSON.stringify(res));
        this.setState({ status: res.msg });
        setTimeout(() => this.setState({ status: "- - - - - - - - - - - - - - - - - - - -" }), 2000);
      }).catch(err => {
        Alert.alert("Error", "Server could not be reached")
        this.setState({ serverIsUp: false });
      })
  }

  render() {
    let text = 'Waiting..';
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      text = JSON.stringify(this.state.location);
    }
    if (!this.state.initialRegion) {
      return <View><Text>{text}</Text></View>
    }
    const content = this.state.serverIsUp ? (
      <View style={{flex:2}}>
        <Text style={{ flex: 1, textAlign: "center", color: "#154360" }}>{this.state.status}</Text>
        <Text style={{ flex: 1, fontSize: 9, fontStyle: "italic", color: "green", padding: 3 }}>
          Tap anywhere on the map to send that position to the server for a
            check whether it's inside the game-area. Note that game-area is fetched from the server</Text>
      </View>) : (<Text style={{color:"red",margin:5,textAlign:"center"}}>Server is not up</Text>);
    const latitude = this.state.location.coords.latitude;
    const longitude = this.state.location.coords.longitude;
    const paddingTop = this.state.statusBarHeight;
    return (
      <View style={{ flex: 1, paddingTop: this.state.statusBarHeight }}>
        <MapView
          ref="map"
          style={{ flex: 14 }}
          onPress={this.onPress}
          mapType="standard"
          showsScale={true}
          showsUserLocation={true}
          showsMyLocationButton={true}
          initialRegion={this.state.initialRegion}
        >

          {this.state.serverIsUp &&
            <MapView.Polygon coordinates={this.state.allowedArea}
              strokeWidth={1}
              onPress={this.onPress}
              fillColor="rgba(128, 153, 177, 0.5)" />
          }

          <MapView.Marker
            coordinate={{ longitude, latitude }}
          />

        </MapView>
        <Text style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>Your position (lat,long): {latitude}, {longitude}</Text>
       
        
        {content}
        <MyButton style={{ flex: 2 }} onPressButton={this.onPressButton.bind(this, true)}
          txt="Upload real Position" />
        <MyButton style={{ flex: 2 }} onPressButton={this.onCenterGameArea}
          txt="Show Game Area" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
});