import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import * as FileSystem from 'expo-file-system'
import * as DocumentPicker from 'expo-document-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { Picker } from '@react-native-picker/picker'
import PDFLib from 'react-native-pdf-lib'

const PdfToImage = () => {
  const [selectedImageType, setSelectedImageType] = useState('png')
  const [pdfUri, setPdfUri] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const pickPdf = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true // This ensures we have a usable URI
      })
      
      // The new DocumentPicker returns result.assets[0] instead of direct properties
      if (!result.canceled && result.assets && result.assets[0]) {
        setPdfUri(result.assets[0].uri)
        setError(null)
        console.log('Selected PDF:', result.assets[0].uri) // For debugging
      } else {
        console.log('Document picking cancelled or failed')
      }
    } catch (err) {
      setError('Error picking PDF file')
      console.error(err)
    }
  }

  const convertPdfToImage = async () => {
    if (!pdfUri) {
      setError('Please select a PDF file first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create output directory if it doesn't exist
      const outputDir = `${FileSystem.documentDirectory}converted_images/`
      await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true })

      // Read the PDF file
      const page = await PDFLib.PDFPage.create()
      const pdf = await PDFLib.PDFDocument.open(pdfUri)
      
      // Convert each page to image
      const pages = await pdf.getPages()
      const outputImages = []

      for (let i = 0; i < pages.length; i++) {
        const pageImage = await pages[i].render({
          width: 800,  // You can adjust width as needed
          height: 1200, // You can adjust height as needed
          format: selectedImageType,
        })

        const outputPath = `${outputDir}page_${i + 1}.${selectedImageType}`
        await FileSystem.writeAsStringAsync(outputPath, pageImage, {
          encoding: FileSystem.EncodingType.Base64,
        })

        // Optimize the image if needed
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          outputPath,
          [{ resize: { width: 800 } }],
          { format: selectedImageType === 'jpg' ? 'jpeg' : selectedImageType }
        )

        outputImages.push(manipulatedImage.uri)
      }

      console.log('Conversion completed:', outputImages)
      alert(`Successfully converted ${outputImages.length} pages to ${selectedImageType.toUpperCase()}`)
    } catch (err) {
      setError('Error converting PDF to images')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PDF to Image Converter</Text>
      <Button title="Pick PDF" onPress={pickPdf} />
      
      {pdfUri && (
        <Text style={styles.fileName}>
          Selected: {pdfUri.split('/').pop()}
        </Text>
      )}

      <Picker
        selectedValue={selectedImageType}
        onValueChange={(itemValue) => setSelectedImageType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="PNG" value="png" />
        <Picker.Item label="JPEG" value="jpg" />
        <Picker.Item label="WEBP" value="webp" />
      </Picker>

      <Button 
        title="Convert to Image" 
        onPress={convertPdfToImage}
        disabled={!pdfUri || loading}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Converting PDF...</Text>
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
  fileName: {
    marginVertical: 10,
    fontSize: 16,
  },
  picker: {
    marginVertical: 20,
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

export default PdfToImage