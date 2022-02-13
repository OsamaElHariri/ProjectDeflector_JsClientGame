/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const Section: React.FC<{
  title: string;
}> = ({ children, title }) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const dimensions = useWindowDimensions();

  const gridSize = Math.min(0.6 * dimensions.width, dimensions.height);

  const rows = 3;
  const cols = 3;

  const gridWidth = 100 / rows;
  const gridHeight = 100 / cols;
  const table = (Array(9).fill('').map((elem: undefined, idx) =>
    <View key={`cell_${idx}`} style={{ backgroundColor: 'black', width: `${gridWidth}%`, height: `${gridHeight}%` }}>
      <Text style={{ color: 'red' }}>1</Text>
    </View>
  ));

  return (
    <SafeAreaView style={{ backgroundColor: 'E5D4CE' }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'stretch', position: 'relative', height: '100%' }}>
        <View style={{ flex: 1 }}>
          <View style={{ backgroundColor: 'white', display: 'flex', height: '100%' }}>
            <View style={{ width: '100%', height: '100%', flex: 1, backgroundColor: 'blue' }}></View>
            <View style={{ backgroundColor: 'skyblue', height: 200 }}></View>
            <View style={{ backgroundColor: 'cyan', height: 150 }}></View>
          </View>
        </View>
        <View style={{ backgroundColor: 'green', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'relative', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: gridSize, height: gridSize, backgroundColor: 'yellow' }}>
            {table}
          </View>
        </View>
        <View style={{ flex: 1, backgroundColor: 'red' }}>
          <Text>123</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },

});

export default App;
