import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const UpdateYearSem = () => {
  const [yearConfig, setYearConfig] = useState([]);
  const [newYear, setNewYear] = useState('');
  const [newSemesters, setNewSemesters] = useState('');

  const defaultConfig = [
    { year: 1, semesters: Array(2).fill([]) },
    { year: 2, semesters: Array(2).fill([]) },
    { year: 3, semesters: Array(2).fill([]) },
    { year: 4, semesters: Array(1).fill([]) }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem('yearSemesterConfig');
      
      if (savedConfig) {
        setYearConfig(JSON.parse(savedConfig));
      } else {
        setYearConfig(defaultConfig);
        await AsyncStorage.setItem('yearSemesterConfig', JSON.stringify(defaultConfig));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setYearConfig(defaultConfig);
    }
  };

  const saveYearConfig = async (config) => {
    try {
      await AsyncStorage.setItem('yearSemesterConfig', JSON.stringify(config));
      Alert.alert('Success', 'Year and semester configuration saved successfully!');
    } catch (error) {
      console.error('Error saving year config:', error);
      Alert.alert('Error', 'Failed to save configuration');
    }
  };

  const resetToDefault = async () => {
    Alert.alert(
      'Reset Configuration',
      'Are you sure you want to reset to default configuration?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              setYearConfig(defaultConfig);
              await AsyncStorage.setItem('yearSemesterConfig', JSON.stringify(defaultConfig));
              Alert.alert('Success', 'Reset to default configuration successfully!');
            } catch (error) {
              console.error('Error resetting config:', error);
              Alert.alert('Error', 'Failed to reset configuration');
            }
          },
        },
      ]
    );
  };

  const addYearConfig = () => {
    if (!newYear || !newSemesters) {
      Alert.alert('Error', 'Please enter both year and number of semesters');
      return;
    }

    const yearNum = parseInt(newYear);
    const semNum = parseInt(newSemesters);

    if (isNaN(yearNum) || isNaN(semNum) || yearNum <= 0 || semNum <= 0) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    // Check if year already exists
    if (yearConfig.some(y => y.year === yearNum)) {
      Alert.alert('Error', 'This year already exists in the configuration');
      return;
    }

    const newConfig = [...yearConfig];
    newConfig.push({
      year: yearNum,
      semesters: Array(semNum).fill([])
    });

    newConfig.sort((a, b) => a.year - b.year);
    
    setYearConfig(newConfig);
    saveYearConfig(newConfig);
    setNewYear('');
    setNewSemesters('');
  };

  const removeYear = (yearToRemove) => {
    Alert.alert(
      'Remove Year',
      `Are you sure you want to remove Year ${yearToRemove}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newConfig = yearConfig.filter(y => y.year !== yearToRemove);
            setYearConfig(newConfig);
            saveYearConfig(newConfig);
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#6200ee', '#3700b3']}
      style={styles.gradientContainer}
    >
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Years & Semesters</Text>
        <Text style={styles.headerSubtitle}>Configure your academic timeline</Text>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Add New Year</Text>
              <TouchableOpacity
                onPress={resetToDefault}
                style={styles.resetButton}
              >
                <Text style={styles.resetButtonText}>Reset to Default</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="calendar-alt" size={18} color="#6200ee" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Year (e.g., 1)"
                  value={newYear}
                  onChangeText={setNewYear}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="event-note" size={18} color="#6200ee" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Number of Semesters"
                  value={newSemesters}
                  onChangeText={setNewSemesters}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              
              <TouchableOpacity 
                style={styles.addButton} 
                activeOpacity={0.8} 
                onPress={addYearConfig}
              >
                <LinearGradient
                  colors={['#6200ee', '#3700b3']}
                  style={styles.addButtonGradient}
                >
                  <Text style={styles.buttonText}>Add Year</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Configuration</Text>
            
            {yearConfig.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome5 name="calendar-times" size={48} color="#cccccc" />
                <Text style={styles.emptyStateText}>No years configured</Text>
              </View>
            ) : (
              <View style={styles.configList}>
                {yearConfig.map((config, index) => (
                  <View key={index} style={styles.configCard}>
                    <View style={styles.configCardContent}>
                      <View style={styles.yearIconContainer}>
                        <FontAwesome5 name="calendar-alt" size={24} color="#6200ee" />
                      </View>
                      <View style={styles.configTextContainer}>
                        <Text style={styles.yearText}>Year {config.year}</Text>
                        <Text style={styles.semesterText}>
                          {config.semesters.length} {config.semesters.length === 1 ? 'Semester' : 'Semesters'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeYear(config.year)}
                        style={styles.removeButton}
                      >
                        <MaterialIcons name="delete-outline" size={24} color="#ff1744" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
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
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resetButton: {
    backgroundColor: 'rgba(3, 218, 198, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#03dac6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconContainer: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 5,
  },
  addButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  configList: {
    marginTop: 5,
  },
  configCard: {
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
  },
  configCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  yearIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  configTextContainer: {
    flex: 1,
  },
  yearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  semesterText: {
    fontSize: 14,
    color: '#757575',
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyStateText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  }
});

export default UpdateYearSem;