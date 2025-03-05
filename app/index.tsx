import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from "../pages/Home"
import Converter from "../pages/Converter"
import Notes from "../pages/Notes"
import CGPA from "../pages/CGPA"
import PdfToImage from '../components/Converter/PdfToImage'
import ImageConverter from '../components/Converter/ImageConverter'

const Stack = createNativeStackNavigator();

export default function Index() {
  return (
    // <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} options={{title: 'Welcome'}} />
        <Stack.Screen name="Converter" component={Converter} options={{title: 'Converter'}} />
        <Stack.Screen name="Notes" component={Notes} options={{title: 'Notes'}} />
        <Stack.Screen name="CGPA" component={CGPA} options={{title: 'CGPA'}} />
        <Stack.Screen name="PdfToImage" component={PdfToImage} options={{title: 'PdfToImage'}} />
        <Stack.Screen name="ImageConverter" component={ImageConverter} options={{title: 'ImageConverter'}} />
      </Stack.Navigator>
   /* </NavigationContainer> */
  );
}

