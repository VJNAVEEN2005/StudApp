import React from "react";
import { Text, View, StyleSheet, Settings } from "react-native";
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
import Setting from '../pages/Settings'
import UpdateYearSem from '../pages/Settings/UpdateYearSem'
import EditGrade from '../pages/Settings/EditGrade'
import CGPAComparison from '../pages/CGPAComparison'
import ThemeSetting from '../pages/Settings/ThemeSetting'

const Stack = createNativeStackNavigator();

export default function Index() {
  return (
    // <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        {/* <Stack.Screen name="Converter" component={Converter} /> */}
        <Stack.Screen name="Notes" component={Notes} />
        <Stack.Screen name="CGPA" component={CGPA} />
        {/* <Stack.Screen name="PdfToImage" component={PdfToImage} />
        <Stack.Screen name="ImageConverter" component={ImageConverter} /> */}
        <Stack.Screen name="Content" component={Content} />
        <Stack.Screen name="Article" component={Article} />
        <Stack.Screen name="Settings" component={Setting} />
        <Stack.Screen name="UpdateYearSem" component={UpdateYearSem} />
        <Stack.Screen name="EditGrade" component={EditGrade} />
        <Stack.Screen name="CGPAComparison" component={CGPAComparison} />
        <Stack.Screen name="ThemeSetting" component={ThemeSetting} />
      </Stack.Navigator>
    // </NavigationContainer>
  );
}