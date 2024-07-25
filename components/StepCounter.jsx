import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

const StepCounter = () => {
  const [steps, setSteps] = useState(0);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [lastPeakTime, setLastPeakTime] = useState(0);
  const [lastMagnitude, setLastMagnitude] = useState(0);
  const [debug, setDebug] = useState('');

  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, 100); // 10 Hz

    const subscription = accelerometer.subscribe(({ x, y, z }) => {
      setAccelerometerData({ x, y, z });
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const { x, y, z } = accelerometerData;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Low-pass filter to reduce noise
    const alpha = 0.8;
    const filteredMagnitude = alpha * lastMagnitude + (1 - alpha) * magnitude;
    setLastMagnitude(filteredMagnitude);

    const now = Date.now();
    const MAGNITUDE_THRESHOLD_HIGH = 12.0; // Higher threshold to detect peaks
    const MAGNITUDE_THRESHOLD_LOW = 9.0;  // Ensure it falls below this before detecting another peak
    const TIME_THRESHOLD = 500; // milliseconds

    if (filteredMagnitude > MAGNITUDE_THRESHOLD_HIGH && now - lastPeakTime > TIME_THRESHOLD) {
      setLastPeakTime(now);
      setSteps(prevSteps => prevSteps + 1);
      setDebug(`Step detected at ${now}, magnitude: ${filteredMagnitude}`);
    } else if (filteredMagnitude > MAGNITUDE_THRESHOLD_HIGH) {
      setDebug(`High magnitude detected but too soon: ${filteredMagnitude}`);
    } else {
      setDebug(`Current magnitude: ${filteredMagnitude}`);
    }

  }, [accelerometerData]);

  return (
    <View style={styles.container}>
      <Text style={styles.stepCounter}>Steps: {steps}</Text>
      <Text style={styles.accelerometerData}>
        X: {accelerometerData.x.toFixed(2)}, 
        Y: {accelerometerData.y.toFixed(2)}, 
        Z: {accelerometerData.z.toFixed(2)}
      </Text>
      <Text style={styles.debug}>{debug}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  stepCounter: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  accelerometerData: {
    fontSize: 16,
    marginTop: 20,
  },
  debug: {
    fontSize: 12,
    marginTop: 20,
    color: 'red',
  },
});

export default StepCounter;
