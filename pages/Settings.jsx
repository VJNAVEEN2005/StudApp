import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  MaterialIcons,
  FontAwesome5,
  Ionicons,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const Setting = () => {
  const navigation = useNavigation();

  const menuItems = [
    {
      title: "Config Your Year / Semester",
      icon: <FontAwesome5 name="calendar-alt" size={24} color="#6200ee" />,
      screen: "UpdateYearSem",
    },
    {
      title: "Edit Grade",
      icon: <FontAwesome5 name="edit" size={24} color="#6200ee" />,
      screen: "EditGrade",
    },
    //  {
    //    title: "Theme",
    //    icon: (
    //      <MaterialCommunityIcons
    //        name="theme-light-dark"
    //        size={24}
    //        color="#6200ee"
    //      />
    //    ),
    //    screen: "ThemeSetting",
    //  },
  ];
  return (
    <LinearGradient
      colors={["#6200ee", "#3700b3"]}
      style={styles.gradientContainer}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Configure your preferences</Text>
      </View>

      <View style={styles.cardsContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>{item.icon}</View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
              <MaterialIcons
                name="arrow-forward-ios"
                size={18}
                color="#6200ee"
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
};

export default Setting;

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(98, 0, 238, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#757575",
  },

  quickActionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
});
