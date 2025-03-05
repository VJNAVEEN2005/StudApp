import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { useNavigation } from "expo-router";



const Home = () => {

    const navigation = useNavigation();

  return (
    <View>
      <View style={{ margin: 20 }}>
        {["Converter", "CGPA", "Notes"].map((item, index) => {
          return (
            <View
              onTouchStart={() => {
                // alert("You clicked on " + item);
                navigation.navigate(item);
              }}
              key={index}
              style={styles.container}
            >
              <Text>{item}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default Home;

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