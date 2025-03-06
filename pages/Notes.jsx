import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { api } from "../api/backend";
import axios from "axios";

const Notes = () => {
  const navigation = useNavigation();
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <Text style={styles.headerTitle}>Notes</Text>
        <Text style={styles.headerSubtitle}>
          All your academic utilities in one place
        </Text>
      </View>

      {loading && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      <View style={styles.cardsContainer}>
        {Object.keys(groupedData).map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("Content", {
                category: item,
              })
            }
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="note" size={28} color="#6200ee" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
                <Text style={styles.cardDescription}>
                  {groupedData[item].length} notes
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

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0</Text>
      </View>
    </LinearGradient>
  );
};

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

export default Notes;
