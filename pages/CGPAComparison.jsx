import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const CGPAComparison = () => {
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState({ name: '', cgpa: '' });
  const [userCGPA, setUserCGPA] = useState('0.00');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedFriends = await AsyncStorage.getItem('friendsCGPA');
      const savedUserCGPA = await AsyncStorage.getItem('userCGPA');
      
      if (savedFriends) {
        setFriends(JSON.parse(savedFriends));
      }
      if (savedUserCGPA) {
        setUserCGPA(savedUserCGPA);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const validateCGPA = (value) => {
    const cgpa = parseFloat(value);
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      return false;
    }
    return true;
  };

  const formatCGPA = (value) => {
    const cgpa = parseFloat(value);
    if (!isNaN(cgpa)) {
      return cgpa.toFixed(2);
    }
    return '0.00';
  };

  const handleUserCGPAChange = (text) => {
    // Allow empty or partial decimal input
    if (text === '' || text === '.') {
      setUserCGPA(text);
      return;
    }

    // Remove any non-numeric characters except decimal point
    const sanitizedText = text.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitizedText.split('.');
    if (parts.length > 2) return;
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;
    
    setUserCGPA(sanitizedText);
  };

  const handleFriendCGPAChange = (text) => {
    // Allow empty or partial decimal input
    if (text === '' || text === '.') {
      setNewFriend({ ...newFriend, cgpa: text });
      return;
    }

    // Remove any non-numeric characters except decimal point
    const sanitizedText = text.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitizedText.split('.');
    if (parts.length > 2) return;
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;
    
    setNewFriend({ ...newFriend, cgpa: sanitizedText });
  };

  const addFriend = () => {
    if (!newFriend.name || !newFriend.cgpa) {
      Alert.alert('Error', 'Please enter both name and CGPA');
      return;
    }

    if (!validateCGPA(newFriend.cgpa)) {
      Alert.alert('Error', 'CGPA must be between 0 and 10');
      return;
    }

    const formattedCGPA = formatCGPA(newFriend.cgpa);
    setFriends([...friends, { ...newFriend, cgpa: parseFloat(formattedCGPA) }]);
    setNewFriend({ name: '', cgpa: '' });
    saveData();
  };

  const removeFriend = (index) => {
    const newFriends = friends.filter((_, i) => i !== index);
    setFriends(newFriends);
    saveData();
  };

  const getRankings = () => {
    const allEntries = [
      { name: 'You', cgpa: parseFloat(formatCGPA(userCGPA)) },
      ...friends
    ].sort((a, b) => b.cgpa - a.cgpa);

    return allEntries.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  };

  const BarChart = () => {
    const data = [
      { name: 'You', cgpa: parseFloat(formatCGPA(userCGPA)) }, 
      ...friends
    ];
    const maxCGPA = Math.max(...data.map(d => d.cgpa), 10);
    const width = Dimensions.get('window').width - 64;
    const height = 200;
    const barWidth = (width - (data.length - 1) * 10) / data.length;
    
    return (
      <Svg width={width} height={height}>
        {/* Y-axis line */}
        <Line
          x1="0"
          y1={height}
          x2="0"
          y2="0"
          stroke="#333"
          strokeWidth="1"
        />
        
        {/* X-axis line */}
        <Line
          x1="0"
          y1={height}
          x2={width}
          y2={height}
          stroke="#333"
          strokeWidth="1"
        />
        
        {data.map((item, index) => {
          const barHeight = (item.cgpa / maxCGPA) * (height - 30);
          const x = index * (barWidth + 10);
          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={height - barHeight}
                width={barWidth}
                height={barHeight}
                fill={item.name === 'You' ? '#6200ee' : '#03dac6'}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - barHeight - 10}
                fill="#333"
                fontSize="12"
                textAnchor="middle"
              >
                {item.cgpa.toFixed(2)}
              </SvgText>
              <SvgText
                x={x + barWidth / 2}
                y={height + 15}
                fill="#333"
                fontSize="10"
                textAnchor="middle"
              >
                {item.name}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    );
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('friendsCGPA', JSON.stringify(friends));
      // Save formatted CGPA
      const formattedCGPA = formatCGPA(userCGPA);
      await AsyncStorage.setItem('userCGPA', formattedCGPA);
      Alert.alert('Success', 'Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const generatePDF = async () => {
    try {
      const rankings = getRankings();
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; }
              h1 { color: #6200ee; text-align: center; margin-bottom: 30px; }
              .comparison-card {
                background-color: #fff;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .rankings {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              .rankings th, .rankings td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #eee;
              }
              .rankings th {
                background-color: #6200ee;
                color: white;
              }
              .rank-1 { color: #FFD700; font-weight: bold; }
              .rank-2 { color: #C0C0C0; font-weight: bold; }
              .rank-3 { color: #CD7F32; font-weight: bold; }
              .summary {
                margin-top: 30px;
                padding: 20px;
                background-color: #f5f5f5;
                border-radius: 8px;
              }
              .chart-container {
                margin: 20px 0;
                text-align: center;
              }
              .bar-chart {
                display: flex;
                align-items: flex-end;
                justify-content: center;
                height: 200px;
                gap: 10px;
                margin-top: 20px;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 8px;
              }
              .bar {
                width: 40px;
                background-color: #6200ee;
                display: flex;
                flex-direction: column;
                align-items: center;
                transition: height 0.3s;
              }
              .bar-label {
                margin-top: 8px;
                font-size: 12px;
                text-align: center;
                word-wrap: break-word;
                max-width: 60px;
              }
              .bar-value {
                color: white;
                font-size: 10px;
                padding: 4px;
              }
            </style>
          </head>
          <body>
            <h1>CGPA Comparison Report</h1>
            
            <div class="comparison-card">
              <h2>Rankings</h2>
              <table class="rankings">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  ${rankings.map((entry, index) => `
                    <tr>
                      <td class="rank-${entry.rank}">#${entry.rank}</td>
                      <td>${entry.name}</td>
                      <td>${entry.cgpa.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="comparison-card">
              <h2>Visual Comparison</h2>
              <div class="bar-chart">
                ${rankings.map(entry => {
                  const height = (entry.cgpa / 10) * 150;
                  return `
                    <div style="display: flex; flex-direction: column; align-items: center;">
                      <div class="bar" style="height: ${height}px; background-color: ${entry.name === 'You' ? '#6200ee' : '#03dac6'}">
                        <span class="bar-value">${entry.cgpa.toFixed(2)}</span>
                      </div>
                      <span class="bar-label">${entry.name}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="summary">
              <h2>Summary</h2>
              <p>Total Participants: ${rankings.length}</p>
              <p>Highest CGPA: ${Math.max(...rankings.map(r => r.cgpa)).toFixed(2)}</p>
              <p>Average CGPA: ${(rankings.reduce((sum, r) => sum + r.cgpa, 0) / rankings.length).toFixed(2)}</p>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Export CGPA Comparison',
        UTI: 'com.adobe.pdf'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF report');
    }
  };

  return (
    <LinearGradient
      colors={['#6200ee', '#3700b3']}
      style={styles.gradientContainer}
    >
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>CGPA Comparison</Text>
          <Text style={styles.subtitle}>Compare your CGPA with friends</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Your CGPA"
            placeholderTextColor="#9e9e9e"
            keyboardType="decimal-pad"
            value={userCGPA}
            onChangeText={handleUserCGPAChange}
            maxLength={5} // Limit to 5 characters (e.g., "10.00")
          />
        </View>

        <View style={styles.addFriendContainer}>
          <TextInput
            style={[styles.input, styles.nameInput]}
            placeholder="Friend's Name"
            placeholderTextColor="#9e9e9e"
            value={newFriend.name}
            onChangeText={(text) => setNewFriend({ ...newFriend, name: text })}
          />
          <TextInput
            style={[styles.input, styles.cgpaInput]}
            placeholder="CGPA"
            placeholderTextColor="#9e9e9e"
            keyboardType="decimal-pad"
            value={newFriend.cgpa}
            onChangeText={handleFriendCGPAChange}
            maxLength={5} // Limit to 5 characters (e.g., "10.00")
          />
          <TouchableOpacity style={styles.addButton} onPress={addFriend}>
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          <BarChart />
        </View>

        <View style={styles.rankingsContainer}>
          <Text style={styles.rankingsTitle}>Rankings</Text>
          {getRankings().map((entry, index) => (
            <View key={index} style={styles.rankingItem}>
              <View style={[
                styles.rankBadge,
                index < 3 ? styles[`rank${index + 1}Badge`] : null
              ]}>
                <Text style={styles.rankText}>{entry.rank}</Text>
              </View>
              <Text style={styles.rankName}>{entry.name}</Text>
              <Text style={styles.rankCGPA}>{entry.cgpa.toFixed(2)}</Text>
              {entry.name !== 'You' && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFriend(friends.findIndex(f => f.name === entry.name))}
                >
                  <MaterialIcons name="delete-outline" size={24} color="#f44336" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveData}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: '#f44336', marginTop: 10 }]} 
            onPress={generatePDF}
          >
            <View style={styles.buttonContent}>
              <MaterialIcons name="picture-as-pdf" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.saveButtonText}>Export as PDF</Text>
            </View>
          </TouchableOpacity>
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
  inputContainer: {
    marginBottom: 20,
  },
  addFriendContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  nameInput: {
    flex: 2,
    marginRight: 10,
  },
  cgpaInput: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#03dac6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  rankingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  rankingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rank1Badge: {
    backgroundColor: '#FFD700', // Gold
  },
  rank2Badge: {
    backgroundColor: '#C0C0C0', // Silver
  },
  rank3Badge: {
    backgroundColor: '#CD7F32', // Bronze
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rankName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  rankCGPA: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    marginRight: 12,
  },
  removeButton: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#03dac6',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    marginVertical: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default CGPAComparison; 