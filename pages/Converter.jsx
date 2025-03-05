import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useNavigation } from "expo-router";

const Converter = () => {

  const navigation = useNavigation();

  const converter = [
    {
      title:"Image To Pdf",
      link:"ImageToPdf"
    },
    {
      title:"Pdf To Image",
      link:"PdfToImage"
    },
    {
      title:"ImageConverter",
      link:"ImageConverter"
    }
  ]

  return (
    <View>
      <Text style={{width:"100vw", textAlign:"center", fontWeight:"900", color:"blue"}}>Converter</Text>
      <View style={{ margin: 20 }}>
              {converter.map((item, index) => {
                return (
                  <View
                    onTouchStart={() => {
                      // alert("You clicked on " + item);
                      navigation.navigate(item.link);
                    }}
                    key={index}
                    style={styles.container}
                  >
                    <Text>{item.title}</Text>
                  </View>
                );
              })}
            </View>
    </View>
  )
}

export default Converter

const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: "lightblue",
      marginVertical: 8,
      borderRadius: 10,
      shadowColor: "black",
      shadowOffset: { width: -2, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
  });