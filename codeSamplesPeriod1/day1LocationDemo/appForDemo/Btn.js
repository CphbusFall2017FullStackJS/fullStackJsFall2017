import React, { Component } from 'react';
import {TouchableHighlight, Text} from "react-native";

export default class MyButton extends Component {
  /*_onPressButton() {
    console.log("You tapped the button!");
  }*/

  render() {
    return (
      <TouchableHighlight style={{backgroundColor: "#4682B4",margin:3    }} onPress={this.props.onPressButton}>
        <Text style={{fontSize:22,textAlign:"center",padding:5}}>{this.props.txt}</Text>
      </TouchableHighlight>
    );
  }

  
}