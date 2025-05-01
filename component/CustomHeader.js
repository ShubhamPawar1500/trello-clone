import { View, Text, StyleSheet, Platform, SafeAreaView, StatusBar, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const CustomHeader = ({ title, showBackButton = true }) => {
    
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View style={styles.leftContainer}>
          </View>
          
          <Text style={styles.headerTitle}>{title}</Text>
          
          <View style={styles.rightContainer}>
            
          </View>
        </View>
      </SafeAreaView>
    );
};

// Styles
const styles = StyleSheet.create({
    safeArea: {
      backgroundColor: '#393E46',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 50,
      paddingHorizontal: 16,
    },
    leftContainer: {
      width: 40,
    },
    rightContainer: {
      // width: 40,
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
    },
    iconButton: {
      padding: 4,
    },
});

export default CustomHeader;