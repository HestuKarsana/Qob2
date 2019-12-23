import React from 'react';
import { Provider } from 'react-redux'
import Router from './Router';
import store from './store';
// import { View, Text } from 'react-native';
// import { createAppContainer } from 'react-navigation';
// import { createStackNavigator } from 'react-navigation-stack';
// import Home from "./components/screens/Home";
// // import Register from "./components/screens/Register"; 
// // import RegistrasiGiro from "./components/screens/RegistrasiGiro";
// import IndexRegister from "./components/screens/registrasi/IndexRegister";
// import { ApplicationProvider, Layout } from '@ui-kitten/components';
// import { mapping, light as lightTheme } from '@eva-design/eva';
import { encode } from 'base-64';
import * as Font from "expo-font";
 
// const RootStack = createStackNavigator( 
//   {
//     Home:  {  
//       screen: Home
//     }, 
//     IndexRegister: { screen: IndexRegister },
//   },{ 
//     initialRouteName: 'Home',
//     headerTransitionPreset: 'uikit'
//   }
// );

// const AppContainer = createAppContainer(RootStack);
 

// export default class App extends React.Component{

//   render(){
//     return(
//       <ApplicationProvider mapping={mapping} theme={lightTheme}>
//         <AppContainer />
//       </ApplicationProvider>
//     );
//   }
// }

class App extends React.Component{
  async componentDidMount(){
    if (!global.btoa) { global.btoa = encode; }
    await Font.loadAsync({
      'open-sans-reg': require('./assets/fonts/OpenSans-Regular.ttf'),
      'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
    });
  }

  render(){
    return(
      <Provider store={store}>
        <Router />
      </Provider>
    );
  }
}

export default App;