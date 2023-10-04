import React, {useState, useEffect} from 'react'
import { Text, View, TextInput, TouchableOpacity, FlatList, Keyboard, Image, Modal, KeyboardAvoidingView} from 'react-native'
import { globalStyles } from '../styles/global'
import { firebase } from '../firebase/firebase'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppOpenAd, InterstitialAd, RewardedAd, BannerAd, TestIds, BannerAdSize } from 'react-native-google-mobile-ads';
import { I18n } from "i18n-js"
import languages from '../translations/languages';
import * as Localization from "expo-localization";

export default function ChatRoom({ navigation }) {  
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [alertModal, setAlertModal] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const badWords = [ "fuck", "faggot", "nigga", "nigger", "cocksuc", "cocksuk", "bitch", "cunt"]
  const iSend = require('../assets/images/send.png')
  
  //  TRANSLATOR  TRANSLATOR  TRANSLATOR  TRANSLATOR  
  const i18n = new I18n(languages)
  i18n.locale = Localization.locale
  i18n.enableFallback = true
  console.log(i18n.locale)
  
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
    colRef
    .orderBy('time', 'asc')
    .onSnapshot(
      querySnapshot => {
        const messages = [];
        querySnapshot.forEach((doc) => {
            const { message, time, userName, col, Unique_ID } = doc.data()
            messages.push({
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
  }, [])
  //     FOR KEEPING THE DOC COUNT <= 100        FOR KEEPING THE DOC COUNT <= 100   
  deleteDocuments(colRef)
  //    5 SECOND DELAY BETWEEN POSTS      5 SECOND DELAY BETWEEN POSTS  
  const countDown = () => {
    if (isSending) {
      Alert(i18n.t("ErrPostSpeed"))
      return
    }
    setIsSending(true)
    setTimeLeft(20)
    setNewMessage('')
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)
    setTimeout(() => {
      clearInterval(intervalId)
      setIsSending(false)
    }, 5000)
      addField()
  }
  //      alerts
  function Alert(abc){
    setAlertModal(true)
    setAlertMessage(abc)
  }
  
  function censorWords(abc) {
        if (badWords.some(word => abc.toLowerCase().includes(word))) {
          return abc.replace(new RegExp(badWords.join('|'), 'gi'), match => match[0] + '*'.repeat(match.length - 1)) + ' '
        }
        return abc
  } 
  
      // Update the newMessage state using censorWords
  const handleNewMessageChange = (text) => {
        setNewMessage(censorWords(text))
  }
  
      //      MAKING POSTS      MAKING POSTS      MAKING POSTS      MAKING POSTS
  const addField = () => {
        if (newMessage.length > 120 || newMessage.length <1){
          Alert(i18n.t("ErrMessageLength"))
        } else {
        const msgRef = firebase.firestore().collection(navigation.getParam("roomName"))
          const timestamp = firebase.firestore.FieldValue.serverTimestamp()
          const data = {
            userName: navigation.getParam("userName"),
            message: newMessage,
            time: timestamp,
            col: navigation.getParam("rando"),
            Unique_ID: navigation.getParam("uniqueId")
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
              Alert(error)
            })
        }
  }
  
  function MessageItem({ item, navigation }) {
    const [showDate, setShowDate] = useState(false);
    const [formattedDate, setFormattedDate] = useState("");
    const [selectedItemId, setSelectedItemId] = useState(null);
  
    const handlePress = () => {
      //const date = new Date(item.time * 1000);
      const date = item.time.toDate();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      setSelectedItemId(item.Unique_ID);
      setFormattedDate(`${hours}:${minutes}  ${day}/${month}/${year}`)
      setShowDate(true);
      setTimeout(() => {
        setShowDate(false);
      }, 3000);
    };
  
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
            style={[
              item.col == 0 ? globalStyles.green : globalStyles.basicText,
              item.col == 1 ? globalStyles.pink : globalStyles.basicText,
              item.col == 2 ? globalStyles.orange : globalStyles.basicText,
              item.col == 3 ? globalStyles.purple : globalStyles.basicText,
              item.col == 4 ? globalStyles.red : globalStyles.basicText,
              item.col == 5 ? globalStyles.blue : globalStyles.basicText,
              item.col == 6 ? globalStyles.yellow : globalStyles.basicText,
              globalStyles.basicText,
            ]}
          >
            {item.userName}:{" "}
            <Text
              style={[
                item.Unique_ID === navigation.getParam("uniqueId")
                  ? globalStyles.postGray
                  : globalStyles.postBlack,
                //globalStyles.basicText,
                globalStyles.post
              ]}
            >
              {item.message}
            </Text>
            {selectedItemId === item.Unique_ID && showDate && (            
              <Text style={{ fontSize: 14, marginLeft: 200, paddingTop: -30}}>
              {"\n"}  {formattedDate}
              </Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
      return (
<KeyboardAvoidingView style={{flex:1}} enabled={true} behavior='padding'> 
<SafeAreaView style={globalStyles.bigCont}>

 
        {/* <BannerAd
        unitId={TestIds.BANNER}
        style={globalStyles.bannerAd}
        size={BannerAdSize.LARGE_BANNER}
        />          */}

        <BannerAd
        unitId={'ca-app-pub-4831537919211081/3559767529'}
        style={globalStyles.bannerAd}
        size={BannerAdSize.LARGE_BANNER}
        /> 


          <FlatList
            inverted
            style={globalStyles.flatList}
            data={[...messages].reverse()}
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
          <Modal
          animationType='none'
          transparent={true}
          visible={alertModal}
          >
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center',}}>
              <View style={globalStyles.modalAlert}>
                  <Text style={[globalStyles.inputText, {marginLeft: '4%'}]}>{alertMessage}</Text>
                              
                  <TouchableOpacity style={globalStyles.alertBtn} onPress={()=> setAlertModal(false)}>
                      <Text style={globalStyles.inputText}>ok</Text>
                  </TouchableOpacity>
              </View>
          </View>
          </Modal>

</SafeAreaView>
</KeyboardAvoidingView>
  
      )
  }
