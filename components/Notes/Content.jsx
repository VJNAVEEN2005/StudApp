import React, { useState, useEffect } from "react";
import { api } from "../../api/backend";
import axios from "axios";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,

} from "react-native";
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";

const Content = ({ route }) => {
  const navigation = useNavigation();
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const category = route.params?.category || "Unknown";

  const formattedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  useEffect(() => {
    axios
      .get(`${api.primary}/api/topics`)
      .then((response) => {
        setGroupedData(response.data);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching topics:", err);
        setError("Failed to load topics.");
        setLoading(false);
      });
    console.log(api.primary);
  }, []);

  useEffect(() => {
    console.log(Object.keys(groupedData));
  }, [groupedData]);

  return (
    <LinearGradient
      colors={["#6200ee", "#3700b3"]}
      style={styles.gradientContainer}
    >
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{formattedCategory}</Text>
      </View>

      <View style={styles.cardsContainer}>
        {groupedData[category]?.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("Article", {
                category: item.category,
                topic: item.topic,
              })
            }
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="book" size={28} color="#6200ee" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>
                  {item.topic.charAt(0).toUpperCase() + item.topic.slice(1)}
                </Text>
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

export default Content;

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
    padding: 20,
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
