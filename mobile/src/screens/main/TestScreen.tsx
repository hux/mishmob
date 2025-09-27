import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TestScreen() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const testLocalhost = async () => {
    addResult('Testing localhost:8080...');
    try {
      const response = await fetch('http://localhost:8080/api/docs');
      addResult(`localhost:8080 - Status: ${response.status}`);
    } catch (error) {
      addResult(`localhost:8080 - Error: ${error}`);
    }
  };

  const test10022 = async () => {
    addResult('Testing 10.0.2.2:8080...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://10.0.2.2:8080/api/docs', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      addResult(`10.0.2.2:8080 - Status: ${response.status}`);
    } catch (error: any) {
      addResult(`10.0.2.2:8080 - Error: ${error.name} - ${error.message}`);
    }
  };

  const testPublicAPI = async () => {
    addResult('Testing public API...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://api.github.com', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      addResult(`GitHub API - Status: ${response.status}`);
    } catch (error: any) {
      addResult(`GitHub API - Error: ${error.message || error}`);
    }
  };

  const testHostIP = async () => {
    addResult('Testing 192.168.1.170:8080...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://192.168.1.170:8080/api/docs', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      addResult(`192.168.1.170:8080 - Status: ${response.status}`);
    } catch (error: any) {
      addResult(`192.168.1.170:8080 - Error: ${error.name} - ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Network Test</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Test localhost:8080" onPress={testLocalhost} />
        <View style={styles.spacer} />
        <Button title="Test 10.0.2.2:8080" onPress={test10022} />
        <View style={styles.spacer} />
        <Button title="Test Host IP (192.168.1.170)" onPress={testHostIP} />
        <View style={styles.spacer} />
        <Button title="Test Public API" onPress={testPublicAPI} />
        <View style={styles.spacer} />
        <Button title="Clear" onPress={() => setResults([])} color="red" />
      </View>

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>{result}</Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  spacer: {
    height: 8,
  },
  results: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
});