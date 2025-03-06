import React, { useState, useEffect } from "react";
import { api } from "../../api/backend";
import axios from "axios";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import { Light as SyntaxHighlighter } from "react-native-syntax-highlighter";
import { docco } from "react-syntax-highlighter/styles/hljs";

const Article = ({ route }) => {
  const [groupedData, setGroupedData] = useState("");
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const category = route.params?.category || "Unknown";
  const topic = route.params?.topic || "Unknown";

  const formattedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);

  useEffect(() => {
    axios
      .get(`${api.primary}/api/topic/${category}/${topic}`)
      .then((response) => {
        setGroupedData(response.data.content);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching topics:", err);
        setLoading(false);
      });
  });

  useEffect(() => {
    console.log(groupedData);
  }, []);

  return (
    <LinearGradient
      colors={["#6200ee", "#3700b3"]}
      style={styles.gradientContainer}
    >
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{formattedTopic}</Text>
      </View>

      <ScrollView style={styles.cardsContainer}>
        <View style={styles.cardsContainer}>
          <Markdown style={markdownStyles}>{groupedData}</Markdown>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default Article;

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
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
    padding: 5,
    backgroundColor: "white",
    margin: 10,
    borderRadius: 10,
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

const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: "900",
    marginVertical: 15,
    color: "#3700b3",
  },
  heading2: {
    fontSize: 20,
    fontWeight: "500",
    marginVertical: 8,
    color: "#32098f",
  },
  heading3: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 6,
  },
  heading4: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 4,
  },
  heading5: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 2,
  },
  heading6: {
    fontSize: 12,
    fontWeight: "bold",
    marginVertical: 1,
  },
  link: {
    color: "#bb86fc",
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
  },

  table: {
    marginVertical: 10,
    borderRadius: 3,
    backgroundColor: "#cfbceb",
  },

  td: {
    borderWidth: 1,
  },
  th: {
    borderWidth: 1,
  },
};
