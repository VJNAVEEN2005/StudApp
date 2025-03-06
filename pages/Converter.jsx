import React from "react";
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

const Converter = () => {
  const navigation = useNavigation();

  // Define converter options with icons and descriptions
  const converterOptions = [
    {
      title: "Image To PDF",
      icon: <MaterialIcons name="image" size={28} color="#6200ee" />,
      description: "Convert your images to PDF format",
      link: "ImageToPdf",
    },
    {
      title: "PDF To Image",
      icon: <MaterialIcons name="picture-as-pdf" size={28} color="#6200ee" />,
      description: "Extract images from PDF documents",
      link: "PdfToImage",
    },
    {
      title: "Image Converter",
      icon: <MaterialIcons name="compare" size={28} color="#6200ee" />,
      description: "Convert between image formats",
      link: "ImageConverter",
    },
  ];

  return (
    <LinearGradient
      colors={["#6200ee", "#3700b3"]}
      style={styles.gradientContainer}
    >
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Converter</Text>
        <Text style={styles.headerSubtitle}>Transform your files easily</Text>
      </View>

      <View style={styles.cardsContainer}>
        {converterOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(item.link)}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>{item.icon}</View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
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
        <Text style={styles.footerText}>
          Tap any option to start converting
        </Text>
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
  backButton: {
    marginBottom: 15,
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
  recentConversionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    flex: 1,
  },
  recentConversionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  emptyStateText: {
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 10,
    fontSize: 16,
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

export default Converter;
