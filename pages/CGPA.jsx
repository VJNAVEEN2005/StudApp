import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CGPA = () => {
  const [years, setYears] = useState([]);
  const [cgpa, setCgpa] = useState(0);
  const [semesterGPAs, setSemesterGPAs] = useState({});
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [currentEditingSubject, setCurrentEditingSubject] = useState(null);
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

  const defaultConfig = [
    { year: 1, semesters: Array(2).fill([]) },
    { year: 2, semesters: Array(2).fill([]) },
    { year: 3, semesters: Array(2).fill([]) },
    { year: 4, semesters: Array(1).fill([]) }
  ];

  const gradeOptions = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];

  const navigation = useNavigation();

  useEffect(() => {
    loadYearConfig();
    loadGradeSettings();
  }, []);

  const loadGradeSettings = async () => {
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
      console.error('Error loading grade settings:', error);
    }
  };

  const loadYearConfig = async () => {
    try {
      // First load the year configuration
      const savedConfig = await AsyncStorage.getItem('yearSemesterConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setYears(config);
      } else {
        // Default configuration if none exists
        setYears(defaultConfig);
        await AsyncStorage.setItem('yearSemesterConfig', JSON.stringify(defaultConfig));
      }

      // Then load the saved CGPA data
      const savedData = await AsyncStorage.getItem('cgpaData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setYears(prevYears => {
          return prevYears.map(year => {
            const savedYear = parsedData.find(y => y.year === year.year);
            if (savedYear) {
              return {
                ...year,
                semesters: savedYear.semesters
              };
            }
            return year;
          });
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to default config if error occurs
      setYears(defaultConfig);
    }
  };

  const toggleSemester = (yearIndex, semesterIndex) => {
    const key = `${yearIndex}-${semesterIndex}`;
    setExpandedSemesters({
      ...expandedSemesters,
      [key]: !expandedSemesters[key]
    });
  };

  const openGradeModal = (yearIndex, semesterIndex, subjectIndex, currentGrade) => {
    setCurrentEditingSubject({ yearIndex, semesterIndex, subjectIndex });
    setSelectedGrade(currentGrade || '');
    setGradeModalVisible(true);
  };

  const applyGrade = () => {
    if (currentEditingSubject) {
      const { yearIndex, semesterIndex, subjectIndex } = currentEditingSubject;
      updateSubject(yearIndex, semesterIndex, subjectIndex, 'grade', selectedGrade);
    }
    setGradeModalVisible(false);
  };

  const addSubject = (yearIndex, semesterIndex) => {
    const newYears = [...years];
    newYears[yearIndex].semesters[semesterIndex].push({
      name: '',
      credit: '',
      grade: defaultGrade // Use the default grade from settings
    });
    setYears(newYears);
  };

  const removeSubject = (yearIndex, semesterIndex, subjectIndex) => {
    const newYears = [...years];
    newYears[yearIndex].semesters[semesterIndex].splice(subjectIndex, 1);
    setYears(newYears);
  };

  const updateSubject = (yearIndex, semesterIndex, subjectIndex, field, value) => {
    const newYears = [...years];
    newYears[yearIndex].semesters[semesterIndex][subjectIndex][field] = value;
    setYears(newYears);
  };

  const getGradePoint = (grade) => {
    return parseFloat(gradePoints[grade.toUpperCase()] || 0);
  };

  // Single Sem
  const calculateSemesterGPA = (semester) => {
    let totalCredits = 0;
    let totalGradePoints = 0;

    semester.forEach(subject => {
      if (subject.credit && subject.grade) {
        const credits = parseFloat(subject.credit);
        const gradePoint = getGradePoint(subject.grade);
        totalCredits += credits;
        totalGradePoints += credits * gradePoint;
      }
    });

    return totalCredits ? (totalGradePoints / totalCredits).toFixed(2) : 0;
  };

  // Calculate CGPA and update semester GPAs
  const calculateCGPA = () => {
    let totalCredits = 0;
    let totalGradePoints = 0;
    const newSemesterGPAs = {};

    years.forEach((year, yearIndex) => {
      year.semesters.forEach((semester, semIndex) => {
        const semesterGPA = calculateSemesterGPA(semester);
        newSemesterGPAs[`${yearIndex}-${semIndex}`] = semesterGPA;

        semester.forEach(subject => {
          if (subject.credit && subject.grade) {
            const credits = parseFloat(subject.credit);
            const gradePoint = getGradePoint(subject.grade);
            totalCredits += credits;
            totalGradePoints += credits * gradePoint;
          }
        });
      });
    });

    const calculatedCGPA = totalCredits ? (totalGradePoints / totalCredits).toFixed(2) : 0;
    setCgpa(calculatedCGPA);
    setSemesterGPAs(newSemesterGPAs);
    saveData();
  };

  // storage 
  const saveData = async () => {
    try {
      await AsyncStorage.setItem('cgpaData', JSON.stringify(years));
      Alert.alert('Success', 'Your grades have been saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save your data. Please try again.');
    }
  };

  const getGradeColor = (grade) => {
    const gradeColors = {
      'S': '#8e44ad', // Purple
      'A': '#27ae60', // Green
      'B': '#2980b9', // Blue
      'C': '#f39c12', // Orange
      'D': '#e67e22', // Dark Orange
      'E': '#d35400', // Burnt Orange
      'F': '#c0392b'  // Red
    };
    return gradeColors[grade.toUpperCase()] || '#7f8c8d';
  };

  // Get CGPA color based on value
  const getCgpaColor = (cgpaValue) => {
    const numCgpa = parseFloat(cgpaValue);
    if (numCgpa >= 9) return '#27ae60';  // Excellent - Green
    if (numCgpa >= 8) return '#2980b9';  // Very Good - Blue
    if (numCgpa >= 7) return '#f39c12';  // Good - Orange
    if (numCgpa >= 6) return '#e67e22';  // Average - Dark Orange
    if (numCgpa >= 5) return '#d35400';  // Below Average - Burnt Orange
    return '#c0392b';                    // Poor - Red
  };

  const generatePDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; line-height: 1.5; }
              h1 { color: #6200ee; text-align: center; margin-bottom: 30px; }
              h2 { color: #3700b3; margin-top: 30px; border-bottom: 2px solid #3700b3; padding-bottom: 8px; }
              h3 { color: #03dac6; }
              .year { margin-bottom: 30px; }
              .semester { margin-bottom: 25px; background-color: #f9f9f9; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
              table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 14px; }
              th { background-color: #6200ee; color: white; padding: 12px; text-align: left; font-weight: 500; border-radius: 4px 4px 0 0; }
              td { border-bottom: 1px solid #ddd; padding: 10px; }
              tr:nth-child(even) { background-color: #f5f5f5; }
              .result { text-align: center; margin-top: 40px; padding: 20px; background-color: #f3f3f3; border-radius: 8px; }
              .cgpa { font-size: 34px; font-weight: bold; margin: 10px 0; }
              .semester-gpa { font-size: 16px; font-weight: 500; text-align: right; margin-top: 10px; }
              .student-info { margin-bottom: 40px; text-align: center; }
              .grade-S { color: #8e44ad; }
              .grade-A { color: #27ae60; }
              .grade-B { color: #2980b9; }
              .grade-C { color: #f39c12; }
              .grade-D { color: #e67e22; }
              .grade-E { color: #d35400; }
              .grade-F { color: #c0392b; }
              .cgpa-excellent { color: #27ae60; }
              .cgpa-very-good { color: #2980b9; }
              .cgpa-good { color: #f39c12; }
              .cgpa-average { color: #e67e22; }
              .cgpa-below-average { color: #d35400; }
              .cgpa-poor { color: #c0392b; }
              footer { text-align: center; margin-top: 40px; font-size: 12px; color: #777; }
            </style>
          </head>
          <body>
            <h1>Academic Performance Report</h1>
            <div class="student-info">
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            ${years.map((year, yearIndex) => {
              // Only show years that have data
              const hasData = year.semesters.some(sem => sem.some(sub => sub.name || sub.credit || sub.grade));
              return hasData ? `
                <div class="year">
                  <h2>Year ${year.year}</h2>
                  ${year.semesters.map((semester, semIndex) => {
                    // Only show semesters that have data
                    const semesterData = semester.filter(sub => sub.name || sub.credit || sub.grade);
                    const semGPA = semesterGPAs[`${yearIndex}-${semIndex}`] || '0.00';
                    let gpaCssClass = 'cgpa-poor';
                    if (semGPA >= 9) gpaCssClass = 'cgpa-excellent';
                    else if (semGPA >= 8) gpaCssClass = 'cgpa-very-good';
                    else if (semGPA >= 7) gpaCssClass = 'cgpa-good';
                    else if (semGPA >= 6) gpaCssClass = 'cgpa-average';
                    else if (semGPA >= 5) gpaCssClass = 'cgpa-below-average';
                    
                    return semesterData.length > 0 ? `
                      <div class="semester">
                        <h3>Semester ${semIndex + 1}</h3>
                        <table>
                          <tr>
                            <th>Subject</th>
                            <th>Credits</th>
                            <th>Grade</th>
                          </tr>
                          ${semesterData.map(subject => {
                            const gradeClass = subject.grade ? `grade-${subject.grade.toUpperCase()}` : '';
                            return `
                              <tr>
                                <td>${subject.name || 'Untitled Subject'}</td>
                                <td>${subject.credit || '-'}</td>
                                <td class="${gradeClass}">${subject.grade.toUpperCase() || '-'}</td>
                              </tr>
                            `;
                          }).join('')}
                        </table>
                        <p class="semester-gpa ${gpaCssClass}">Semester GPA: ${semGPA}</p>
                      </div>
                    ` : '';
                  }).join('')}
                </div>
              ` : '';
            }).join('')}
            <div class="result">
              <h2>Academic Summary</h2>
              <p>Based on all completed courses across all semesters</p>
              <h1 class="cgpa ${
                cgpa >= 9 ? 'cgpa-excellent' : 
                cgpa >= 8 ? 'cgpa-very-good' : 
                cgpa >= 7 ? 'cgpa-good' : 
                cgpa >= 6 ? 'cgpa-average' : 
                cgpa >= 5 ? 'cgpa-below-average' : 
                'cgpa-poor'
              }">${cgpa}</h1>
              <p>Cumulative Grade Point Average</p>
            </div>
            <footer>
              <p>This report was generated using the CGPA Calculator App</p>
            </footer>
          </body>
        </html>
      `;

      // GPDF
      const file = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Academic Report',
        UTI: 'com.adobe.pdf'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF report. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#6200ee', '#3700b3']}
      style={styles.gradientContainer}
    >
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>CGPA Calculator</Text>
          <Text style={styles.subtitle}>Track your academic performance</Text>
        </View>

        <View style={styles.cgpaCardContainer}>
          <View style={styles.cgpaCard}>
            <Text style={styles.cgpaLabel}>Your Current CGPA</Text>
            <Text style={[styles.cgpaValue, { color: getCgpaColor(cgpa) }]}>
              {cgpa}
            </Text>
            <TouchableOpacity 
              style={styles.calculateButton} 
              onPress={calculateCGPA}
            >
              <Text style={styles.calculateButtonText}>
                Calculate CGPA
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {years.map((year, yearIndex) => (
          <View key={yearIndex} style={styles.yearContainer}>
            <View style={styles.yearHeader}>
              <Text style={styles.yearTitle}>Year {year.year}</Text>
            </View>

            {year.semesters.map((semester, semesterIndex) => {
              const semesterKey = `${yearIndex}-${semesterIndex}`;
              const isExpanded = expandedSemesters[semesterKey] !== false;
              
              return (
                <View key={semesterIndex} style={styles.semesterContainer}>
                  <TouchableOpacity 
                    style={styles.semesterHeader}
                    onPress={() => toggleSemester(yearIndex, semesterIndex)}
                  >
                    <Text style={styles.semesterTitle}>
                      Semester {semesterIndex + 1}
                    </Text>
                    <View style={styles.semesterHeaderRight}>
                      {semesterGPAs[semesterKey] > 0 && (
                        <View style={[
                          styles.gpaIndicator, 
                          { backgroundColor: getCgpaColor(semesterGPAs[semesterKey]) }
                        ]}>
                          <Text style={styles.gpaIndicatorText}>
                            {semesterGPAs[semesterKey]}
                          </Text>
                        </View>
                      )}
                      <MaterialIcons 
                        name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={24} 
                        color="#6200ee" 
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.semesterContent}>
                      {semester.map((subject, subjectIndex) => (
                        <View key={subjectIndex} style={styles.subjectContainer}>
                          <View style={styles.subjectInputs}>
                            <TextInput
                              style={styles.nameInput}
                              placeholder="Subject Name"
                              placeholderTextColor="#9e9e9e"
                              value={subject.name}
                              onChangeText={(text) => updateSubject(yearIndex, semesterIndex, subjectIndex, 'name', text)}
                            />
                            <View style={styles.subjectDetails}>
                              <TextInput
                                style={styles.creditInput}
                                placeholder="Credits"
                                placeholderTextColor="#9e9e9e"
                                keyboardType="numeric"
                                value={subject.credit}
                                onChangeText={(text) => updateSubject(yearIndex, semesterIndex, subjectIndex, 'credit', text)}
                              />
                              <TouchableOpacity
                                style={[
                                  styles.gradeButton,
                                  { backgroundColor: getGradeColor(subject.grade) }
                                ]}
                                onPress={() => openGradeModal(yearIndex, semesterIndex, subjectIndex, subject.grade)}
                              >
                                <Text style={styles.gradeButtonText}>
                                  {subject.grade || 'Grade'}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeSubject(yearIndex, semesterIndex, subjectIndex)}
                              >
                                <MaterialIcons name="delete-outline" size={20} color="#f44336" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))}

                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => addSubject(yearIndex, semesterIndex)}
                      >
                        <MaterialIcons name="add" size={20} color="white" />
                        <Text style={styles.addButtonText}>Add Subject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        {/* Grade Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={gradeModalVisible}
          onRequestClose={() => setGradeModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Grade</Text>
              <View style={styles.gradeOptionsContainer}>
                {gradeOptions.map((grade) => (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      styles.gradeOption,
                      selectedGrade === grade && styles.selectedGradeOption,
                      { backgroundColor: getGradeColor(grade) }
                    ]}
                    onPress={() => setSelectedGrade(grade)}
                  >
                    <Text style={styles.gradeOptionText}>{grade}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setGradeModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.applyButton]}
                  onPress={applyGrade}
                >
                  <Text style={styles.modalButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {parseFloat(cgpa) > 0 && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.shareButton} onPress={generatePDF}>
              <MaterialIcons name="picture-as-pdf" size={20} color="white" />
              <Text style={styles.shareButtonText}>Export as PDF</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.shareButton, { backgroundColor: '#03dac6', marginTop: 10 }]} 
              onPress={() => navigation.navigate('CGPAComparison')}
            >
              <MaterialIcons name="compare-arrows" size={20} color="white" />
              <Text style={styles.shareButtonText}>Compare with Friends</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Keep track of your academic progress</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  cgpaCardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cgpaCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cgpaLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  cgpaValue: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  calculateButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 2,
  },
  calculateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  yearContainer: {
    marginBottom: 20,
  },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  yearTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    paddingLeft: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#03dac6',
    paddingVertical: 5,
  },
  semesterContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  semesterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  semesterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  semesterHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpaIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 10,
  },
  gpaIndicatorText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  semesterContent: {
    padding: 15,
  },
  subjectContainer: {
    marginBottom: 12,
  },
  subjectInputs: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  nameInput: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  subjectDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  creditInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    color: '#333',
  },
  gradeButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  gradeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    backgroundColor: '#03dac6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  shareButton: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 25,
    marginVertical: 20,
  },
  shareButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  gradeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  gradeOption: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    margin: 5,
  },
  selectedGradeOption: {
    borderWidth: 3,
    borderColor: '#6200ee',
  },
  gradeOptionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  applyButton: {
    backgroundColor: '#6200ee',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    marginVertical: 20,
  },
});

export default CGPA;