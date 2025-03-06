import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  StatusBar,
  ScrollView
} from 'react-native';
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Picker } from '@react-native-picker/picker';

const ImageConverter = () => {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [convertedImageUri, setConvertedImageUri] = useState(null);
  const [targetFormat, setTargetFormat] = useState('jpg');
  const [quality, setQuality] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Request permissions when component mounts
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Sorry, we need media library permissions to save images!');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setConvertedImageUri(null);
        setError(null);
        console.log('Selected image:', result.assets[0].uri);
      }
    } catch (err) {
      setError('Error picking image');
      console.error(err);
    }
  };

  const convertImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const outputDir = `${FileSystem.documentDirectory}converted_images/`;
      await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true });

      const timestamp = new Date().getTime();
      const outputPath = `${outputDir}converted_${timestamp}.${targetFormat}`;

      // Add image transformations based on format
      const transformations = [];
      
      // For HEIC, convert to JPEG first
      if (targetFormat === 'heic') {
        const jpegFirst = await ImageManipulator.manipulateAsync(
          selectedImage.uri,
          transformations,
          { format: 'jpeg', compress: quality }
        );
        // Additional HEIC conversion logic would go here
        setError('HEIC conversion not fully supported yet');
        return;
      }

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        selectedImage.uri,
        transformations,
        {
          format: targetFormat === 'jpg' ? 'jpeg' : targetFormat,
          compress: quality,
        }
      );

      await FileSystem.moveAsync({
        from: manipulatedImage.uri,
        to: outputPath
      });

      console.log('Conversion completed:', outputPath);
      setConvertedImageUri(outputPath);
      alert(`Successfully converted to ${targetFormat.toUpperCase()}`);
      setSelectedImage({ ...selectedImage, uri: outputPath });
    } catch (err) {
      setError('Error converting image');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const shareImage = async () => {
    if (!convertedImageUri) return;

    try {
      if (!(await Sharing.isAvailableAsync())) {
        alert('Sharing is not available on this platform');
        return;
      }

      await Sharing.shareAsync(convertedImageUri);
    } catch (err) {
      setError('Error sharing image');
      console.error(err);
    }
  };

  const saveToGallery = async () => {
    if (!convertedImageUri) return;

    try {
      const asset = await MediaLibrary.createAssetAsync(convertedImageUri);
      const album = await MediaLibrary.getAlbumAsync('Converted Images');
      
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('Converted Images', asset, false);
      }

      alert('Image saved to gallery in "Converted Images" album!');
    } catch (err) {
      setError('Error saving image to gallery');
      console.error(err);
    }
  };

  return (
    <LinearGradient
      colors={['#6200ee', '#3700b3']}
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
        <Text style={styles.headerTitle}>Image Converter</Text>
        <Text style={styles.headerSubtitle}>Convert between image formats</Text>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.uploadButton}
            activeOpacity={0.8}
            onPress={pickImage}
          >
            <View style={styles.uploadIconContainer}>
              <MaterialIcons name="add-photo-alternate" size={32} color="#6200ee" />
            </View>
            <Text style={styles.uploadText}>
              {selectedImage ? "Change Image" : "Select Image from Gallery"}
            </Text>
          </TouchableOpacity>

          {selectedImage && (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.imagePreview}
                resizeMode="contain"
              />
              <Text style={styles.fileName}>
                {selectedImage.uri.split('/').pop()}
              </Text>
            </View>
          )}

          <View style={styles.settingsContainer}>
            <Text style={styles.settingsTitle}>Conversion Settings</Text>
            
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Format:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={targetFormat}
                  onValueChange={(itemValue) => setTargetFormat(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#6200ee"
                >
                  <Picker.Item label="JPEG" value="jpg" />
                  <Picker.Item label="PNG" value="png" />
                  <Picker.Item label="WEBP" value="webp" />
                </Picker>
              </View>
            </View>
            
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Quality:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={quality}
                  onValueChange={(itemValue) => setQuality(parseFloat(itemValue))}
                  style={styles.picker}
                  dropdownIconColor="#6200ee"
                >
                  <Picker.Item label="Maximum (100%)" value="1" />
                  <Picker.Item label="High (75%)" value="0.75" />
                  <Picker.Item label="Medium (50%)" value="0.5" />
                  <Picker.Item label="Low (25%)" value="0.25" />
                </Picker>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton, 
              (!selectedImage || loading) && styles.disabledButton
            ]}
            activeOpacity={0.8}
            onPress={convertImage}
            disabled={!selectedImage || loading}
          >
            <MaterialIcons name="autorenew" size={20} color="white" />
            <Text style={styles.actionButtonText}>Convert Image</Text>
          </TouchableOpacity>

          {convertedImageUri && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.secondaryButton, styles.shareButton]}
                activeOpacity={0.8}
                onPress={shareImage}
              >
                <MaterialIcons name="share" size={20} color="white" />
                <Text style={styles.secondaryButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, styles.saveButton]}
                activeOpacity={0.8}
                onPress={saveToGallery}
              >
                <MaterialIcons name="save-alt" size={20} color="white" />
                <Text style={styles.secondaryButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>Converting image...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={20} color="#f44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  uploadIconContainer: {
    marginRight: 15,
  },
  uploadText: {
    fontSize: 16,
    color: '#6200ee',
    fontWeight: '500',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  fileName: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  settingsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingsLabel: {
    width: 60,
    fontSize: 14,
    color: '#555',
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
  },
  picker: {
    height: 45,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: 'rgba(98, 0, 238, 0.5)',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flex: 0.48,
  },
  shareButton: {
    backgroundColor: '#03dac6',
  },
  saveButton: {
    backgroundColor: '#ff9800',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  loadingText: {
    color: '#ffffff',
    marginLeft: 10,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  errorText: {
    color: '#f44336',
    marginLeft: 10,
    fontSize: 14,
  },
});

export default ImageConverter;