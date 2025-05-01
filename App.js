import { StyleSheet } from 'react-native';
import TrelloBoard from './component/TrelloBoard';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from '@react-navigation/native';
import { Portal } from 'react-native-paper';

const MenuStack = createStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Portal.Host>
          <MenuStack.Navigator initialRouteName='Board'>
            <MenuStack.Screen name="Board" component={TrelloBoard} options={{ headerShown: false }} />
          </MenuStack.Navigator>
        </Portal.Host>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
