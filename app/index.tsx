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
import Content from '../components/Notes/Content'
import Article from '../components/Notes/Article'

const Stack = createNativeStackNavigator();

export default function Index() {
  return (
    // <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Converter" component={Converter} />
        <Stack.Screen name="Notes" component={Notes} />
        <Stack.Screen name="CGPA" component={CGPA} />
        <Stack.Screen name="PdfToImage" component={PdfToImage} />
        <Stack.Screen name="ImageConverter" component={ImageConverter} />
        <Stack.Screen name="Content" component={Content} />
        <Stack.Screen name="Article" component={Article} />
      </Stack.Navigator>
    // </NavigationContainer>
  );
}