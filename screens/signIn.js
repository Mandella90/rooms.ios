import { Text, View, TextInput, TouchableOpacity, Modal, Platform, Image, Dimensions, SafeAreaView } from 'react-native'
import React, {useState, useEffect, Component } from 'react'
import * as Location from "expo-location"
import { globalStyles } from '../styles/global'
import { firebase } from '../firebase/firebase'
import { setStatusBarHidden } from "expo-status-bar"
import * as NavigationBar from "expo-navigation-bar"
import { I18n } from "i18n-js"
import languages from '../translations/languages'
import * as Localization from "expo-localization"
import { BannerAd, BannerAdSize, AdRequest} from 'react-native-google-mobile-ads'
import Orientation from 'react-native-orientation-locker'
import Toast from 'react-native-simple-toast'
import MMKVStorage from 'react-native-mmkv-storage'
import { requestTrackingPermission } from 'react-native-tracking-transparency';


const i18n = new I18n(languages)
i18n.locale = Localization.locale
i18n.enableFallback = true
const usersRef = firebase.firestore().collection("USERS")
const mmkv = new MMKVStorage.Loader().initialize();

export default function SignIn({ navigation }) { 
    const [latitude, setLatitude] = useState(null)
    const [longitude, setLongitude] = useState(null)
    const [userPerm, setUserPerm] = useState(false)
    const [uniqueId, setUniqueId] = useState(null)
    const [rando, setRando] = useState(null)
    const [userName, setUserName] = useState("")
    const [oUserName, setOUserName] = useState("")
    let roomName = ""
    const [globeModalVis, setGlobeModalVis] = useState(false)
    const [localModalVis, setLocalModalVis] = useState(false)
    const [usernameModalVis, setUsernameModalVis] = useState(false)
    const [alertMessage, setAlertMessage] = useState(i18n.t('LocationPermission'))
    let [custName, setCustName] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [suspendedDate, setSuspendedDate] = useState(null)

    const iEarth = require('../assets/images/iEarth.png')
    const iHouses = require('../assets/images/iHouses.png')
    const iAccount = require('../assets/images/account.png')
    const iRooms = require('../assets/images/title-rooms.png')
    const iInfo = require('../assets/images/info.png')

const getUserInfo = async (uID) => {
    const usersRef = firebase.firestore().collection('USERS')
    const query = usersRef.where("Unique_ID", "==", uID).get()
    const userDocs = (await query).docs
    if (userDocs.length > 0) {
        const data = userDocs[0].data()
        const username = data.Username
        const suspendedDate = data.hasOwnProperty('suspendedDate') ? data.suspendedDate : null;
        return { username, suspendedDate }
    } else {
        return null
    }
}
async function fetchData() {
    try {
        const uID = mmkv.getString('uID');
        setUniqueId(uID);
        const userInfo = await getUserInfo(uID);
        if (userInfo) {
            const { username, suspendedDate } = userInfo;
            setUserName(username);
            setSuspendedDate(suspendedDate); // Assuming you have a function to set suspendedDate
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    } catch (error) {
    }
}

const askLocationPerm = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission not granted.')
      return
    }
    try {
      const trackingStatus = await requestTrackingPermission();  
      if (trackingStatus === 'unavailable') {
        //fine
      } else if (trackingStatus === 'denied') {
        setAlertMessage('To use this app, please enable tracking in your device settings.\n\nThis is ONLY used to deliver personalized ads.')
        return
      } else if (trackingStatus === 'authorized') {
        //woohoo
      }
    } catch (error) {
    }
        setUserPerm(true)
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        setLatitude(location.coords.latitude)
        setLongitude(location.coords.longitude)
  }

if(Platform.OS === "android"){
    const visibility = NavigationBar.useVisibility();
    console.log(visibility)
    useEffect(() => {
        if (visibility === "visible") {
        const interval = setTimeout(() => {
            NavigationBar.setVisibilityAsync("hidden")
        },2000)
        return () => {
            clearTimeout(interval)
        }
        }
    }, [visibility])
}

function setNavBar(){
    NavigationBar.setPositionAsync("absolute")
    NavigationBar.setVisibilityAsync("hidden")
    NavigationBar.setBehaviorAsync("inset-swipe")
    NavigationBar.setBackgroundColorAsync("#00000080")
    setStatusBarHidden(true, "none")
}
//      USE EFFECTS     USE EFFECTS     USE EFFECTS   
useEffect(() => {
    (async () => {
        askLocationPerm()
        fetchData()
        setNavBar()
        Orientation.lockToPortrait()
        setRando(getRandomNumber())
    })()
}, [])

function findRoom(a){
    return a.toFixed(2)
}
function generateRandomString() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 15; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
const getRandomNumber = () => {
    return (Math.floor(Math.random() * 7))            
}
async function generateNewAsyncStorage(abc) {
    try {
      mmkv.setString('uID', abc)
      setUniqueId(abc)
    } catch (error) {
      console.log(error)
    }
}
//  CHANGEUSERNAME FUNCTIONS    CHANGEUSERNAME FUNCTIONS    CHANGEUSERNAME FUNCTIONS    
function createUsernameWithExistingUID(aaa, bbb){
        const timestamp = firebase.firestore.FieldValue.serverTimestamp()
        console.log("Creating username:", aaa, "with Unique_ID:", bbb)
        const data = {
            Unique_ID: bbb,
            Username: aaa,
            LastSignIn: timestamp               
            }
            usersRef.add(data)
}    
function createUsername(abc){
        const usDate = new Date().toLocaleDateString('en-US').replace(/\//g, '-')
        const idn = usDate + '-' + generateRandomString()
        generateNewAsyncStorage(idn)
        const timestamp = firebase.firestore.FieldValue.serverTimestamp()
        const data = {
        Unique_ID: idn,
        Username: abc,
        LastSignIn: timestamp,    
        }
        usersRef.add(data)
}
async function isOldAccount(abc) {
    try {
        const querySnapshot = await usersRef.where('Username', '==', abc).limit(1).get()
        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data()
            if (data.LastSignIn) {
                const timestamp = data.LastSignIn.toDate().getTime()
                const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).getTime()
                const isFiveDaysAgoOrEarlier = timestamp <= fiveDaysAgo
                console.log(isFiveDaysAgoOrEarlier)
                return isFiveDaysAgoOrEarlier
            } else {
                return false
            }
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}
async function deleteByUsername(abc) {
    const querySnapshot = await usersRef.where("Username", "==", abc).get();
    if (querySnapshot.size === 0) {
      console.log(`No record of username ` + abc + ` to delete`);
      return;
    } else {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
        console.log(`Deleted document with username: ${doc.id}`);
      });
    }
} 
async function deleteByID(abc){
const querySnapshot = await usersRef.where("Unique_ID","==",abc).get()
if (querySnapshot.size === 0) {
    console.log(`No record of UID `+abc+` to delete`);
    return
}else{
    querySnapshot.forEach((doc) => {
        doc.ref.delete()
        console.log(`Deleted document with UID ${doc.id} and ${doc.Unique_ID}`)
      })
    }
}

async function updateDateTime(abc) {
    const querySnapshot = await usersRef.where("Username", "==", abc).get()
    if (querySnapshot.empty) {
        return;
      }        
      const now = firebase.firestore.FieldValue.serverTimestamp()
      const promises = querySnapshot.docs.map((doc) => {
      return doc.ref.update({ LastSignIn: now });
    })
await Promise.all(promises);
console.log(`Updated LastSignIn for ${querySnapshot.size} documents`);
}

async function changeUsername(abc){
    try{
        let docUID
        const querySnapshot = await usersRef.where("Username", "==", abc).get()
        querySnapshot.forEach((doc) => {
            docUID = (doc.data().Unique_ID)
        })
          if(await querySnapshot.empty && uniqueId!==null){
            try {
            //delete firebase USER by Unique_ID
            await deleteByID(uniqueId)
            } catch (error) {
                console.log(error)
            }         
            //Create new user by uniqueId
            createUsernameWithExistingUID(abc, uniqueId)
            console.log("A")
            setUsernameModalVis(false)
          }
          else if(await isOldAccount(abc) && uniqueId!==null){
            try {
            //delete by account name
            await deleteByUsername(abc)
            //delete own old Unique_ID
            await deleteByID(uniqueId)    
            } catch (error) {
                console.log(error)
            }                
            //create new user by uniqueId
            createUsernameWithExistingUID(abc, uniqueId)
            console.log("B")
            setUsernameModalVis(false)
          }
          else if(await isOldAccount(abc) && uniqueId==null){
            try {
            //delete by account name
            await deleteByUsername(abc)
            } catch (error) {
                console.log(error)
            }                
            //create new user
            createUsername(abc)
            console.log("C")
            setUsernameModalVis(false)
          }
          else if(await querySnapshot.empty && uniqueId==null){
            //create new user
            createUsername(abc)
            console.log("D")
            setUsernameModalVis(false)
          }else if(docUID == uniqueId){
            setUsernameModalVis(false)
          }else{
            console.log(docUID)
            showToast(i18n.t("ErrNameTaken"))
          }
    }
    catch(error){
      console.log(error);
    }        
  }
function checkSuspension(abc) {
    if (!abc) {
        return false
    }
    const suspendedDateObj = abc instanceof firebase.firestore.Timestamp
        ? abc.toDate()
        : new Date(abc)
    const currentDate = new Date()
    if (suspendedDateObj > currentDate) {
        alert(`${i18n.t('SuspensionDate')} ${suspendedDateObj}`)
        return true
    } else {
        return false
    }
}
const pressHandler = () => {
    try {
        if (userName.length > 12 || userName.length < 3) {
            showToast(i18n.t("ErrNameLength"))
            setUsernameModalVis(true)
        } else {
            const isSuspended = checkSuspension(suspendedDate)
            if (isSuspended) {
                console.log("they're suspended")
                return
            } else if (latitude !== null && longitude !== null) {
                const latRoom = findRoom(latitude)
                const lonRoom = findRoom(longitude)
                const roomName = latRoom + lonRoom
                updateDateTime(userName)
                navigation.navigate("ChatRoom", { userName, roomName, rando, uniqueId })
            }
        }
    } catch (error) {
        console.error("Error in pressHandler:", error)
    }
}
const modalGlobe = () => {
    try {
        if(userName.length > 12 || userName.length < 3){
            showToast(i18n.t("ErrNameLength"))
            setGlobeModalVis(false)
            setUsernameModalVis(true)
        }
        else if(custName.length > 13 || custName.length < 3){
            showToast(i18n.t("ErrRoomLength"))
        }
        else if(checkSuspension(suspendedDate))
        {
            showToast(i18n.t("SuspensionDate") + suspendedDate)
        }
        else if (latitude && longitude != null){          
            roomName = ""
            roomName = custName
            roomName = roomName.toLocaleLowerCase()        
            updateDateTime(userName)
            navigation.navigate("ChatRoom", {userName, roomName, rando, uniqueId})
            setGlobeModalVis(false)
        }
    } catch (error) {
        console.error("Error in modalGlobe function:", error);
    }
}
const modalLocal = () => {
    try {
        if(userName.length > 12 || userName.length < 3){
            showToast(i18n.t("ErrNameLength"))
            setUsernameModalVis(true)
        }
        else if(custName.length > 13 || custName.length < 3){
            showToast(i18n.t("ErrRoomLength"))
        }
        else if(checkSuspension(suspendedDate))
        {
            showToast(i18n.t("SuspensionDate") + suspendedDate)
        }
        else if (latitude && longitude != null){         
            roomName = ""
            const latInt = Math.floor(latitude).toString()
            const lonInt = Math.floor(longitude).toString()
            roomName = latInt + lonInt
            roomName = roomName + "_" + custName.toLocaleLowerCase()        
            updateDateTime(userName)
            navigation.navigate("ChatRoom", {userName, roomName, rando, uniqueId})
            setLocalModalVis(false)
        }
    } catch (error) {
        console.error("Error in modalGlobe function:", error);
    }
}
const checkForUsername = () => {
    if(userName.length > 12 || userName.length < 3){
        showToast(i18n.t("ErrNameLength"))
    }else if (userName.includes(" ")) {
        showToast(i18n.t("ErrNameSpace"))
    }else {
        changeUsername(userName)
    }
}
const infoHandler = () => {
    Alert(i18n.t("InfoNameRules"))
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

return(
<>
{isLoading ? (
    
    <View style={globalStyles.signInCont}>
        <Image style={{flex:1, resizeMode: 'contain'}} source={require('../assets/images/splash.png')}/>
        <Text style={globalStyles.loadingFont}>{i18n.t('Loading')}</Text>
    </View>
) : (

userPerm == true ?
<View style={globalStyles.signInCont}>

<BannerAd
unitId={'ca-app-pub-4831537919211081/9284238358'}
style={globalStyles.bannerAd}
size={BannerAdSize.BANNER}
/>

    <View style={globalStyles.titleCont}>
        <Image source={iRooms} style={globalStyles.roomsTitle} resizeMode="contain"/>
    </View>

    <View style={globalStyles.usernameCont}>
        <Text style={[globalStyles.basicText, globalStyles.white]}>{i18n.t('JoinRoom')}</Text>           
        <TouchableOpacity style={globalStyles.signInBtn} onPress={pressHandler}>
            <Text style={globalStyles.inputText}>{i18n.t('Location')}</Text>
        </TouchableOpacity>            
    </View>

    <View style={globalStyles.modalView}>
        <TouchableOpacity onPress={()=>setGlobeModalVis(true)}>
            <Image source={iEarth} style={globalStyles.miniModalImage}/>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>setLocalModalVis(true)}>
            <Image source={iHouses} style={globalStyles.miniModalImage}/>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>[setOUserName(userName),setUsernameModalVis(true)]}>
            <Image source={iAccount} style={globalStyles.miniModalImage}/>
        </TouchableOpacity>
    </View>

{/* GLOBAL Modal    GLOBAL Modal    GLOBAL Modal    GLOBAL Modal */}
<Modal
animationType='slide'
transparent={false}
visible={globeModalVis}
onRequestClose={()=>
console.log("whatevs globe")
}
>
<View style={globalStyles.modalCont}>
    <Image source={iEarth} style={globalStyles.modalImage} />
    <Text style={[globalStyles.basicText, globalStyles.white, {marginTop:'30%'}]}>{i18n.t('GlobalRoom')}</Text>
    <TextInput
    style={[globalStyles.usernameInput, {marginBottom: '5%'}]}
    placeholder={i18n.t('RoomPlaceholder')}
    value={custName}
    onChangeText={text=>setCustName(text)}
    returnKeyType="send"
    onSubmitEditing={modalGlobe}
    />
    <View style={globalStyles.modalButtons}>
        <TouchableOpacity style={globalStyles.modalBtn} onPress={()=>[setGlobeModalVis(false),setCustName('')]}>
            <Text style={[globalStyles.inputText, globalStyles.red]}>{i18n.t('Cancel')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.modalBtn} onPress={modalGlobe}>
            <Text style={[globalStyles.inputText, globalStyles.green]}>{i18n.t('Submit')}</Text>
        </TouchableOpacity>
    </View>
</View>    
</Modal>

{/* LOCAL MODAL     LOCAL MODAL     LOCAL MODAL     LOCAL MODAL */}
<Modal
animationType='slide'
transparent={false}
visible={localModalVis}
onRequestClose={()=>
console.log("whatevs local")
}
>
<View style={globalStyles.modalCont}>
    <Image source={iHouses} style={globalStyles.modalImage}/>
    <Text style={[globalStyles.basicText, globalStyles.white, {marginTop:'30%'}]}>{i18n.t('LocalRoom')}</Text> 
    <TextInput
    style={[globalStyles.usernameInput, {marginBottom:'5%'}]}
    placeholder={i18n.t('RoomPlaceholder')}
    value={custName}
    onChangeText={text=>setCustName(text)}
    returnKeyType="send"
    onSubmitEditing={modalLocal}
    />
    {/* /////////////  BUTTONS    /////////////  BUTTONS    /////////////  BUTTONS     */}
    <View style={globalStyles.modalButtons}>
        <TouchableOpacity style={globalStyles.modalBtn} onPress={()=>[setLocalModalVis(false), setCustName('')]}>
            <Text style={[globalStyles.inputText, globalStyles.red]}>{i18n.t('Cancel')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.modalBtn} onPress={modalLocal}>
            <Text style={[globalStyles.inputText, globalStyles.green]}>{i18n.t('Submit')}</Text>
        </TouchableOpacity>
    </View>
</View>
</Modal>

{/*    USERNAME SELECTION    USERNAME SELECTION    USERNAME SELECTION */}
<Modal
animationType='slide'
transparent={false}
visible={usernameModalVis}
onRequestClose={()=>
console.log("username modal")
}
>
<View style={globalStyles.modalCont}>
    <Image source={iAccount} style={globalStyles.modalImage}/>
    <TouchableOpacity onPress={()=> {infoHandler(); setUsernameModalVis(false)}} style={globalStyles.infoIconOpacity}>
        <Image source={iInfo} style={globalStyles.infoIcon}/>
    </TouchableOpacity>
    <Text style={[globalStyles.basicText, globalStyles.white, {marginTop:'30%'}]}>{i18n.t('UserName')}</Text>
    
    <TextInput style={[globalStyles.usernameInput, {marginBottom:'5%'}]} placeholder={i18n.t('UserNamePlaceholder')} value={userName} onChangeText={(text) => setUserName(text)} 
    ></TextInput>


    {/* /////////////  BUTTONS    /////////////  BUTTONS    /////////////  BUTTONS     */}
    <View style={globalStyles.modalButtons}>
        <TouchableOpacity style={globalStyles.modalBtn} onPress={()=> [setUserName(oUserName),setUsernameModalVis(false)]}>
            <Text style={[globalStyles.inputText, globalStyles.red]}>{i18n.t('Cancel')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.modalBtn} onPress={checkForUsername}>
            <Text style={[globalStyles.inputText, globalStyles.green]}>{i18n.t('Submit')}</Text>
        </TouchableOpacity>
    </View>
</View>
</Modal>
</View>
    :
//  ASK FOR PERMISSIONS     ASK FOR PERMISSIONS     ASK FOR PERMISSIONS
<SafeAreaView style={[globalStyles.signInCont, {justifyContent: 'center'}]}>
<Text style={[globalStyles.basicText, globalStyles.pink,{textAlign: 'center', width: "90%"}]}>
    {alertMessage}
</Text>
</SafeAreaView> 
)}
</>

)    
}
