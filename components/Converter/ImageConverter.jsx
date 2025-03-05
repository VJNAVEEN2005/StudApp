import { View, Text, Button, StyleSheet, Image, ActivityIndicator, Share, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import * as MediaLibrary from 'expo-media-library'
import * as Sharing from 'expo-sharing'
import { Picker } from '@react-native-picker/picker'

const ImageConverter = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [convertedImageUri, setConvertedImageUri] = useState(null)
  const [targetFormat, setTargetFormat] = useState('jpeg')
  const [quality, setQuality] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Request permissions when component mounts
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== 'granted') {
        setError('Sorry, we need media library permissions to save images!')
      }
    })()
  }, [])

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      })

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0])
        setConvertedImageUri(null)
        setError(null)
        console.log('Selected image:', result.assets[0].uri)
      }
    } catch (err) {
      setError('Error picking image')
      console.error(err)
    }
  }

  const convertImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const outputDir = `${FileSystem.documentDirectory}converted_images/`
      await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true })

      const timestamp = new Date().getTime()
      const outputPath = `${outputDir}converted_${timestamp}.${targetFormat}`

      // Add image transformations based on format
      const transformations = []
      
      // For HEIC, convert to JPEG first
      if (targetFormat === 'heic') {
        const jpegFirst = await ImageManipulator.manipulateAsync(
          selectedImage.uri,
          transformations,
          { format: 'jpeg', compress: quality }
        )
        // Additional HEIC conversion logic would go here
        // Note: Direct HEIC conversion might not be supported in all environments
        setError('HEIC conversion not fully supported yet')
        return
      }

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        selectedImage.uri,
        transformations,
        {
          format: targetFormat === 'jpg' ? 'jpeg' : targetFormat,
          compress: quality,
        }
      )

      await FileSystem.moveAsync({
        from: manipulatedImage.uri,
        to: outputPath
      })

      console.log('Conversion completed:', outputPath)
      setConvertedImageUri(outputPath)
      alert(`Successfully converted to ${targetFormat.toUpperCase()}`)
      setSelectedImage({ ...selectedImage, uri: outputPath })
    } catch (err) {
      setError('Error converting image')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const shareImage = async () => {
    if (!convertedImageUri) return

    try {
      if (!(await Sharing.isAvailableAsync())) {
        alert('Sharing is not available on this platform')
        return
      }

      await Sharing.shareAsync(convertedImageUri)
    } catch (err) {
      setError('Error sharing image')
      console.error(err)
    }
  }

  const saveToGallery = async () => {
    if (!convertedImageUri) return

    try {
      const asset = await MediaLibrary.createAssetAsync(convertedImageUri)
      const album = await MediaLibrary.getAlbumAsync('Converted Images')
      
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
      } else {
        await MediaLibrary.createAlbumAsync('Converted Images', asset, false)
      }

      alert('Image saved to gallery in "Converted Images" album!')
    } catch (err) {
      setError('Error saving image to gallery')
      console.error(err)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Format Converter</Text>
      
      <Button title="Pick Image" onPress={pickImage} />

      {selectedImage && (
        <>
          <Image
            source={{ uri: selectedImage.uri }}
            style={styles.imagePreview}
            resizeMode="contain"
          />
          <Text style={styles.fileName}>
            Selected: {selectedImage.uri.split('/').pop()}
          </Text>
        </>
      )}

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Convert to:</Text>
        <Picker
          selectedValue={targetFormat}
          onValueChange={(itemValue) => setTargetFormat(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="JPEG" value="jpg" />
          <Picker.Item label="PNG" value="png" />
          <Picker.Item label="WEBP" value="webp" />
          {/* <Picker.Item label="HEIC" value="heic" />
          <Picker.Item label="BMP" value="bmp" />
          <Picker.Item label="GIF" value="gif" /> */}
        </Picker>

        <Text style={styles.label}>Quality:</Text>
        <Picker
          selectedValue={quality}
          onValueChange={(itemValue) => setQuality(parseFloat(itemValue))}
          style={styles.picker}
        >
          <Picker.Item label="Maximum (100%)" value="1" />
          <Picker.Item label="High (75%)" value="0.75" />
          <Picker.Item label="Medium (50%)" value="0.5" />
          <Picker.Item label="Low (25%)" value="0.25" />
        </Picker>
      </View>

      <Button 
        title="Convert Image" 
        onPress={convertImage}
        disabled={!selectedImage || loading}
      />

      {convertedImageUri && (
        <View style={styles.actionButtons}>
          <Button 
            title="Share Image" 
            onPress={shareImage}
          />
          <View style={styles.buttonSpacer} />
          <Button 
            title="Save to Gallery" 
            onPress={saveToGallery}
          />
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Converting...</Text>
        </View>
      )}

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginVertical: 15,
    backgroundColor: '#f0f0f0',
  },
  fileName: {
    marginVertical: 10,
    fontSize: 16,
  },
  pickerContainer: {
    marginVertical: 15,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  picker: {
    backgroundColor: '#ffffff',
    marginBottom: 15,
    borderRadius: 4,
  },
  actionButtons: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonSpacer: {
    width: 10,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
})

export default ImageConverter