import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    TextInput,
    StatusBar,
  } from 'react-native';
  import React, { useState, useEffect } from 'react';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { LinearGradient } from 'expo-linear-gradient';
  import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
  
  const EditGrade = () => {
    const [defaultGrade, setDefaultGrade] = useState('S');
    const [gradePoints, setGradePoints] = useState({
      'S': '10',
      'A': '9',
      'B': '8',
      'C': '7',
      'D': '6',
      'E': '5',
      'F': '0'
    });
    const [editingGrade, setEditingGrade] = useState(null);
    const gradeOptions = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
  
    const gradeDescriptions = {
      'S': 'Outstanding',
      'A': 'Excellent',
      'B': 'Very Good',
      'C': 'Good',
      'D': 'Average',
      'E': 'Pass',
      'F': 'Fail'
    };
  
    useEffect(() => {
      loadSettings();
    }, []);
  
    const loadSettings = async () => {
      try {
        const savedGrade = await AsyncStorage.getItem('defaultGrade');
        const savedPoints = await AsyncStorage.getItem('gradePoints');
        
        if (savedGrade) {
          setDefaultGrade(savedGrade);
        }
        if (savedPoints) {
          setGradePoints(JSON.parse(savedPoints));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
  
    const saveDefaultGrade = async (grade) => {
      try {
        await AsyncStorage.setItem('defaultGrade', grade);
        setDefaultGrade(grade);
        Alert.alert('Success', 'Default grade updated successfully!');
      } catch (error) {
        console.error('Error saving default grade:', error);
        Alert.alert('Error', 'Failed to update default grade');
      }
    };
  
    const saveGradePoints = async (grade, points) => {
      try {
        const pointValue = parseFloat(points);
        if (isNaN(pointValue) || pointValue < 0 || pointValue > 10) {
          Alert.alert('Error', 'Please enter a valid number between 0 and 10');
          return;
        }
  
        const newGradePoints = { ...gradePoints, [grade]: points };
        await AsyncStorage.setItem('gradePoints', JSON.stringify(newGradePoints));
        setGradePoints(newGradePoints);
        setEditingGrade(null);
        Alert.alert('Success', `Grade points for ${grade} updated successfully!`);
      } catch (error) {
        console.error('Error saving grade points:', error);
        Alert.alert('Error', 'Failed to update grade points');
      }
    };
  
    const resetGradePoints = async () => {
      Alert.alert(
        'Reset Grade Points',
        'Are you sure you want to reset all grade points to default values?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Reset',
            onPress: async () => {
              const defaultPoints = {
                'S': '10',
                'A': '9',
                'B': '8',
                'C': '7',
                'D': '6',
                'E': '5',
                'F': '0'
              };
  
              try {
                await AsyncStorage.setItem('gradePoints', JSON.stringify(defaultPoints));
                setGradePoints(defaultPoints);
                Alert.alert('Success', 'Grade points reset to default values');
              } catch (error) {
                console.error('Error resetting grade points:', error);
                Alert.alert('Error', 'Failed to reset grade points');
              }
            }
          }
        ]
      );
    };
  
    const getGradeColor = (grade) => {
      const gradeColors = {
        'S': '#8e44ad',
        'A': '#27ae60',
        'B': '#2980b9',
        'C': '#f39c12',
        'D': '#e67e22',
        'E': '#d35400',
        'F': '#c0392b'
      };
      return gradeColors[grade] || '#7f8c8d';
    };
  
    return (
      <LinearGradient
        colors={['#6200ee', '#3700b3']}
        style={styles.gradientContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
        
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Grade Settings</Text>
          <Text style={styles.headerSubtitle}>Customize grades and point values</Text>
        </View>
  
        <View style={styles.contentContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Default Grade</Text>
              <Text style={styles.sectionDescription}>
                This grade will be automatically set when adding new subjects
              </Text>
              
              <View style={styles.gradeGrid}>
                {gradeOptions.map((grade) => (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      styles.gradeButton,
                      { backgroundColor: getGradeColor(grade) },
                      defaultGrade === grade && styles.selectedGrade
                    ]}
                    onPress={() => saveDefaultGrade(grade)}
                  >
                    <Text style={styles.gradeText}>{grade}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
  
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Grade Points</Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetGradePoints}
                >
                  <Text style={styles.resetButtonText}>Reset to Default</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionDescription}>
                Customize the point value for each grade
              </Text>
  
              <View style={styles.gradeCardList}>
                {gradeOptions.map((grade) => (
                  <View
                    key={grade}
                    style={styles.gradeCard}
                  >
                    <View style={styles.gradeCardContent}>
                      <View style={[styles.gradeIconContainer, { backgroundColor: getGradeColor(grade) }]}>
                        <Text style={styles.gradeBadgeText}>{grade}</Text>
                      </View>
                      
                      <View style={styles.gradeTextContainer}>
                        <Text style={styles.gradeDescription}>
                          {gradeDescriptions[grade]}
                        </Text>
                      </View>
                      
                      {editingGrade === grade ? (
                        <View style={styles.pointsEditContainer}>
                          <TextInput
                            style={styles.pointsInput}
                            value={gradePoints[grade]}
                            onChangeText={(text) => setGradePoints({ ...gradePoints, [grade]: text })}
                            keyboardType="numeric"
                            maxLength={4}
                            autoFocus
                          />
                          <TouchableOpacity
                            style={[styles.pointsButton, styles.saveButton]}
                            onPress={() => saveGradePoints(grade, gradePoints[grade])}
                          >
                            <MaterialIcons name="check" size={20} color="#fff" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.pointsButton, styles.cancelButton]}
                            onPress={() => setEditingGrade(null)}
                          >
                            <MaterialIcons name="close" size={20} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.pointsDisplay}
                          onPress={() => setEditingGrade(grade)}
                        >
                          <Text style={styles.pointsText}>{gradePoints[grade]}</Text>
                          <MaterialIcons name="edit" size={16} color="#6200ee" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
  
            <View style={styles.infoCardSection}>
              <LinearGradient
                colors={['rgba(98, 0, 238, 0.1)', 'rgba(98, 0, 238, 0.05)']}
                style={styles.infoCard}
              >
                <MaterialIcons name="info-outline" size={24} color="#6200ee" />
                <Text style={styles.infoText}>
                  Changes to grade points will affect CGPA calculations for all subjects.
                </Text>
              </LinearGradient>
            </View>
          </ScrollView>
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
      backgroundColor: '#f5f5f5',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingTop: 20,
      paddingHorizontal: 20,
    },
    section: {
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
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 14,
      color: '#666',
      marginBottom: 20,
    },
    gradeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 12,
    },
    gradeButton: {
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 30,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    selectedGrade: {
      borderWidth: 3,
      borderColor: '#fff',
    },
    gradeText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
    },
    resetButton: {
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    resetButtonText: {
      color: '#f44336',
      fontSize: 14,
      fontWeight: 'bold',
    },
    gradeCardList: {
      marginTop: 10,
    },
    gradeCard: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#eee',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      overflow: 'hidden',
    },
    gradeCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    gradeIconContainer: {
      width: 46,
      height: 46,
      borderRadius: 23,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    gradeBadgeText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    gradeTextContainer: {
      flex: 1,
    },
    gradeDescription: {
      fontSize: 16,
      color: '#333',
      fontWeight: '500',
    },
    pointsEditContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    pointsInput: {
      backgroundColor: '#f8f8f8',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      width: 60,
      marginRight: 8,
      fontSize: 16,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    pointsButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 4,
      elevation: 2,
    },
    saveButton: {
      backgroundColor: '#27ae60',
    },
    cancelButton: {
      backgroundColor: '#e74c3c',
    },
    pointsDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(98, 0, 238, 0.1)',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 8,
      minWidth: 60,
      justifyContent: 'center',
    },
    pointsText: {
      fontSize: 16,
      color: '#6200ee',
      fontWeight: 'bold',
      marginRight: 6,
    },
    infoCardSection: {
      marginBottom: 30,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
    },
    infoText: {
      flex: 1,
      marginLeft: 12,
      color: '#6200ee',
      fontSize: 14,
    }
  });
  
  export default EditGrade;