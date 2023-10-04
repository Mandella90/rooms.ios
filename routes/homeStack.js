import { createStackNavigator } from 'react-navigation-stack'
import { createAppContainer } from 'react-navigation'
import SignIn from '../screens/signIn'
import ChatRoom from '../screens/chatRoom'

const HomeStack = createStackNavigator({
    SignIn: { 
        screen: SignIn,
        navigationOptions: {
            headerShown: false
        }
    },
    ChatRoom: { 
        screen: ChatRoom,
        navigationOptions: {
            title: `room`,
            headerTintColor: '#BBB',
            headerTitleAlign: 'center',
            headerTitleStyle: { fontSize: 20 },
            headerStyle: { backgroundColor:'black' }        
        }  
    },
})

export default createAppContainer(HomeStack)

/*
ChatRoom: { 
        screen: ChatRoom,
        navigationOptions: {
            title: `room`,
            headerTintColor: '#BBB',
            headerTitleAlign: 'center',
            headerTitleStyle: { fontSize: 20 },
            headerStyle: { backgroundColor:'black' }        
        }  
    },
ChatRoom: { 
        screen: ChatRoom,
        navigationOptions: {
            headerShown: false       
        }  
    },
*/