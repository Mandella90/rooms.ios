import React, {useState, useEffect} from 'react'
import { Text, View, TextInput, TouchableOpacity, FlatList, Keyboard, Image, KeyboardAvoidingView, Alert} from 'react-native'
import { globalStyles } from '../styles/global'
import { firebase } from '../firebase/firebase'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
import { I18n } from "i18n-js"
import languages from '../translations/languages'
import * as Localization from "expo-localization"
import Toast from 'react-native-simple-toast'
import MMKVStorage from "react-native-mmkv-storage"
import badWords from '../components/badWords'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function ChatRoom({ navigation }) {  
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [blockedUsers, setBlockedUsers] = useState([]);
  const iSend = require('../assets/images/send.png')
  
  //  TRANSLATOR  TRANSLATOR  TRANSLATOR  TRANSLATOR  
  const i18n = new I18n(languages)
  i18n.locale = Localization.locale
  i18n.enableFallback = true
  console.log(i18n.locale)
  const usersRef = firebase.firestore().collection("USERS")
  const MMKV = new MMKVStorage.Loader().initialize()
  
  //  FOR KEEPING POSTS BELOW A UNDER A CERTAIN NUMBER
  async function deleteDocuments(collection) {
    const querySnapshot = await collection.orderBy("time", "desc").get();
    const documents = querySnapshot.docs;
    if (documents.length <= 100) {
      return;
    }
    for (let i = 100; i < documents.length; i++) {
      await documents[i].ref.delete();
    }
  }
  //This function is just needed to make sure 'async' doesnt crash when going back to login
  const unmount = () => {
        console.log(navigation.getParam("roomName"))
  }
  //      GETTING POSTS      GETTING POSTS      GETTING POSTS      GETTING POSTS
  const colRef = firebase.firestore().collection( navigation.getParam("roomName") )
useEffect(() => { (async () => unmount())()
  const unsubscribe = colRef
    .orderBy('time', 'asc')
    .onSnapshot(
      querySnapshot => {
        const messages = []
        querySnapshot.forEach((doc) => {
          const { message, time, userName, col, Unique_ID } = doc.data()
          messages.unshift({
            id: doc.id,
            message,
            userName,
            time, 
            col,
            Unique_ID
          })
        })
        setMessages(messages)
      }
    )
    return () => {
    unsubscribe()
  }
}, [])

//        CHECK SUSPENSION    CHECK SUSPENSION    CHECK SUSPENSION
const fetchAndCheckSuspension = async () => {
  try {
    const uniqueId = navigation.getParam("uniqueId")
    const query = usersRef.where("Unique_ID", "==", uniqueId).get()
    const userDocs = (await query).docs
    if (userDocs.length > 0) {
      const data = userDocs[0].data()
      const suspendedDate = data.suspendedDate || null
      const suspendedDateObj = suspendedDate instanceof firebase.firestore.Timestamp
        ? suspendedDate.toDate()
        : new Date(suspendedDate)
      const currentDate = new Date()
      if (suspendedDateObj > currentDate) {
        alert(`${i18n.t('SuspensionDate')} ${suspendedDateObj}`)
        return true
      }
      return false
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}




  // BLOCK USER USESTATE  BLOCK USER USESTATE  BLOCK USER USESTATE
  useEffect(() => {
    const blockedUsersFromMMKV = MMKV.getArray("blockedUsers") || [];
    setBlockedUsers(blockedUsersFromMMKV);
}, [])
//    UNBLOCK   UNBLOCK   UNBLOCK   
const UnblockUser = (userId) => {
  const blockedUsersFromMMKV = MMKV.getArray("blockedUsers") || []
  const updatedBlockedUsers = blockedUsersFromMMKV.filter((id) => id !== userId)
  MMKV.setArray("blockedUsers", updatedBlockedUsers)
  setBlockedUsers(updatedBlockedUsers)
}


  //     FOR KEEPING THE DOC COUNT <= 100        FOR KEEPING THE DOC COUNT <= 100   
  deleteDocuments(colRef)
  //    8 SECOND DELAY BETWEEN POSTS      8 SECOND DELAY BETWEEN POSTS  
const countDown = () => {
  if (isSending) {
    showToast(i18n.t("ErrPostSpeed"))
    return
  }
  setIsSending(true)
  setTimeLeft(8)
  setNewMessage('')
  const intervalId = setInterval(() => {
    setTimeLeft(timeLeft - 1)
  }, 1000)
  setTimeout(() => {
    clearInterval(intervalId)
    setIsSending(false)
  }, 8000) 
  addField()
}
  
  //  TOAST       TOAST       TOAST       TOAST       
  function showToast(message) {
    if (Platform.OS === 'android') {
        Toast.showWithGravity(message, Toast.LONG, Toast.CENTER)
    } else if (Platform.OS === 'ios') {
        Toast.showWithGravity(message, Toast.LONG, Toast.CENTER, {
            backgroundColor: '#FF4646',
            textColor: 'white',
        })
    } else {
        Toast.showWithGravity(message, Toast.LONG, Toast.CENTER)
    }
  }
  function censorWords(abc) {
    if (badWords.some(word => abc.toLowerCase().includes(word))) {
      return abc.replace(new RegExp(badWords.join('|'), 'gi'), match => match[0] + '*'.repeat(match.length - 1)) + ' ';
    }
    return abc;
  } 
      // Update the newMessage state using censorWords
  const handleNewMessageChange = (text) => {
        setNewMessage(censorWords(text))
  }  
      //      MAKING POSTS      MAKING POSTS      MAKING POSTS      MAKING POSTS
  const addField = async () => {
    try {
      if (newMessage.length > 120 || newMessage.length < 1) {
        showToast(i18n.t("ErrMessageLength"))
      } else {
        const isSuspended = await fetchAndCheckSuspension();
        if (isSuspended) {
          return;
        }
        const msgRef = firebase.firestore().collection(navigation.getParam("roomName"))
        const timestamp = firebase.firestore.FieldValue.serverTimestamp()
        const data = {
          userName: navigation.getParam("userName"),
          message: newMessage,
          time: timestamp,
          col: navigation.getParam("rando"),
          Unique_ID: navigation.getParam("uniqueId"),
        }
        msgRef
          .add(data)
          .then(() => {
            setNewMessage("")
            Keyboard.dismiss()
            console.log(navigation.getParam('uniqueId'))
            console.log(navigation.getParam("rando"))
          })
          .catch((error) => {
            showToast(error)
          })
      }
    } catch (error) {
      console.error("Error in addField:", error)
    }
  }

  const checkAndUpdateFlagCount = async () => {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const flagCountKey = `flagCount_${currentDate}`
            const storedDate = await AsyncStorage.getItem("flagDate")
      if (currentDate !== storedDate) {
        await AsyncStorage.removeItem(flagCountKey)
        await AsyncStorage.setItem("flagDate", currentDate)
      }
      const flagCount = parseInt(await AsyncStorage.getItem(flagCountKey), 10) || 0
      if (flagCount < 3) {
        await AsyncStorage.setItem(flagCountKey, (flagCount + 1).toString())
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }
  
  

  async function BlockUser(Blocked, currentUserUID, roomName, message) {
    try {
      const isSuspended = await fetchAndCheckSuspension()
      if (isSuspended) {
        return
      }
      const flagCol = firebase.firestore().collection("NATHANSFLAGGEDLIST")
      const confirmAction = async (action) => {
        return new Promise((resolve) => {
          Alert.alert(
            i18n.t('Confirmation'),
            `${i18n.t('AreYouSure')} ${action} ${i18n.t('UserQ')}`,
            [
              {
                text: i18n.t('No'),
                onPress: () => resolve(false),
                style: "cancel",
              },
              {
                text: i18n.t('Yes'),
                onPress: () => resolve(true),
              },
            ],
            { cancelable: false }
          )
        })
      }
      Alert.alert(
        i18n.t('UserActions'),
        i18n.t('ChooseAction'),
        [
          {
            text: i18n.t('Cancel'),
            onPress: () => console.log("User chose not to take action"),
            style: "cancel",
          },
          {
            text: i18n.t('Flag'),
            onPress: async () => {
              const confirmFlag = await confirmAction("flag")
              if (confirmFlag) {
                try {
                  const flagCountResult = await checkAndUpdateFlagCount()
                  if (flagCountResult) {
                    const currentTime = new Date()
                    await flagCol.add({
                      UIDaccuser: currentUserUID,
                      UIDdefender: Blocked,
                      message: message,
                      time: currentTime,
                      roomName: roomName,
                    })
                    alert(i18n.t('UserFlagged'))
                  } else {
                    alert(i18n.t('UserFlagged'))
                  }
                } catch (error) {
                  console.error("Error in flagging process:", error)
                }
              }
            },
          },
          {
            text: i18n.t('Block'),
            onPress: async () => {
              const confirmBlock = await confirmAction("block")
              if (confirmBlock) {
                const updatedBlockedUsers = [...blockedUsers, Blocked]
                MMKV.setArray("blockedUsers", updatedBlockedUsers)
                setBlockedUsers(updatedBlockedUsers)
                alert(i18n.t('UserBlocked'))
              }
            },
          },
        ],
        { cancelable: false }
      )
    } catch (error) {
      console.error("Error in BlockUser:", error);
    }
  }

function getStyleFromItemCol(item) {
  switch(item.col) {
      case 0: return globalStyles.green;
      case 1: return globalStyles.pink;
      case 2: return globalStyles.orange;
      case 3: return globalStyles.purple;
      case 4: return globalStyles.red;
      case 5: return globalStyles.blue;
      case 6: return globalStyles.yellow;
      default: return globalStyles.basicText;
  }
}
  function MessageItem({ item, navigation }) {
    const [showDate, setShowDate] = useState(false)
    const [formattedDate, setFormattedDate] = useState("")
    const [selectedItemId, setSelectedItemId] = useState(null)

    const handlePress = () => {
      const date = item.time.toDate()
      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")
      const day = date.getDate().toString().padStart(2, "0")
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const year = date.getFullYear()
      setSelectedItemId(item.Unique_ID)
      setFormattedDate(`${hours}:${minutes}  ${day}/${month}/${year}`)
      setShowDate(true)
      setTimeout(() => {
        setShowDate(false)
      }, 3000)
    }
    const isBlocked = blockedUsers.includes(item.Unique_ID)
    return (
      <View
        style={[
          item.Unique_ID === navigation.getParam("uniqueId")
            ? globalStyles.postGray
            : globalStyles.postBlack,
          globalStyles.postN,
        ]}
      >
        <TouchableOpacity onPress={handlePress}>
          <Text
            style={[globalStyles.basicText, getStyleFromItemCol(item)]}
          >
            {item.userName}:{" "}
            {isBlocked ? (
              <Text style={{ color: "gray", fontStyle: "italic" }}>
                {i18n.t('YouBlockedThisUser')}
              </Text>
            ) : (
              <Text style={globalStyles.post}>
                {item.message}
              </Text>
            )}
            {selectedItemId === item.Unique_ID && showDate && (
              <>
                {"\n"}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '90%', marginTop: '-1%' }}>
                  <Text style={[globalStyles.smallText, getStyleFromItemCol(item)]}>
                    {formattedDate}
                  </Text>
                  {!isBlocked && navigation.getParam("uniqueId") !== item.Unique_ID && (
                    <TouchableOpacity onPress={() => BlockUser(item.Unique_ID, navigation.getParam("uniqueId"), navigation.getParam("roomName"), item.message)}>
                      <Text style={[globalStyles.smallText, { color: "red", fontWeight: "bold" }]}>
                        {i18n.t('BlockUser')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {isBlocked && (
                    <TouchableOpacity onPress={() => UnblockUser(item.Unique_ID)}>
                      <Text style={[globalStyles.smallText, { color: "green", fontWeight: "bold" }]}>
                        {i18n.t('UnblockUser')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{flex:1}} enabled={true} behavior='padding'> 
      <SafeAreaView style={globalStyles.bigCont}>
        <BannerAd
          unitId={'ca-app-pub-4831537919211081/1252886852'}
          style={globalStyles.bannerAd}
          size={BannerAdSize.LARGE_BANNER}
        />
        <FlatList
          inverted
          style={globalStyles.flatList}
          data={messages}
          numColumns={1}
          renderItem={({ item }) => (
            <MessageItem item={item} navigation={navigation} />
          )}
        />
        <View style={globalStyles.messageCont}>  
          <TextInput
            onChangeText={handleNewMessageChange}
            style={[globalStyles.messageInput, globalStyles.inputText]}
            adjustsFontSizeToFit={true}
            value={newMessage}
            returnKeyType="send"
            onSubmitEditing={countDown}
          />  
          <TouchableOpacity style={globalStyles.messageBtn} onPress={countDown}>
            <Image source={iSend} style={globalStyles.specText}/>
          </TouchableOpacity>              
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}
