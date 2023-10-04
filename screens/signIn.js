import { Text, View, TextInput, TouchableOpacity, Modal, Platform, Image, ImageBackground, SafeAreaView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, {useState, useEffect, Component } from 'react'
import * as Location from "expo-location"
import { globalStyles } from '../styles/global'
import { firebase } from '../firebase/firebase'
import { setStatusBarHidden } from "expo-status-bar"
import * as NavigationBar from "expo-navigation-bar"
import { I18n } from "i18n-js"
import languages from '../translations/languages';
import * as Localization from "expo-localization";
import { AppOpenAd, InterstitialAd, RewardedAd, BannerAd, TestIds, BannerAdSize } from 'react-native-google-mobile-ads';

const i18n = new I18n(languages)
i18n.locale = Localization.locale
i18n.enableFallback = true
console.log(i18n.locale)


export default function SignIn({ navigation }) { 
    const [location, setLocation] = useState(null)
    const [errorMsg, setErrorMsg] = useState(null)
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
    const [alertModal, setAlertModal] = useState(false)
    const [alertMessage, setAlertMessage] = useState(null)
    let [custName, setCustName] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    const iEarth = require('../assets/images/iEarth.png')
    const iHouses = require('../assets/images/iHouses.png')
    const iAccount = require('../assets/images/account.png')
    const iRooms = require('../assets/images/title-rooms.png')
    const iInfo = require('../assets/images/info.png')

    const usersRef = firebase.firestore().collection("USERS")
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

//populate UID and Username 
const getUserInfo = async (uID) => {
    const usersRef = firebase.firestore().collection('USERS');
    const query = usersRef.where("Unique_ID", "==", uID).get();
    const userDocs = (await query).docs;
    if (userDocs.length > 0) {
    const data = userDocs[0].data();
    const username = data.Username;
    return username;
    } else {
    setUsernameModalVis(true)
    return null;
    }
}


async function fetchData() {
    const uID = await AsyncStorage.getItem('uID');
    setUniqueId(uID);
    const username = await getUserInfo(uID); // pass uID to getUserInfo
    if (username) {
    setUserName(username)
    }
}


useEffect(() => {
    (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied')
            return
        }        
    setUserPerm(true)
    let location = await Location.getCurrentPositionAsync({})
    console.log(Localization.getLocales())
    fetchData()
    setNavBar()
    setLatitude(location.coords.latitude)
    setLongitude(location.coords.longitude)
    setLocation(location.coords)
    setRando(getRandomNumber())
    setIsLoading(false)
    })()
}, [])

const askPerm = () => {Location.requestForegroundPermissionsAsync()} 
function findRoom(a, b, c){
    let nNum = a.toString()
    if (nNum.includes("-")) {
        while(nNum.length > b){
            nNum = nNum.slice(0, -1)         
        }
    } else {
        while(nNum.length > c){
            nNum = nNum.slice(0, -1)         
        }
    }
    roomName = roomName + nNum
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

async function generateNewAsyncStorage(abc){
    try{
        await AsyncStorage.setItem('uID',abc)
        setUniqueId(abc)
        console.log(abc)
    }catch(error){
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
        const usDate = new Date().toLocaleDateString('en-US')
        const idn = usDate + '-' + generateRandomString()
        generateNewAsyncStorage(idn)
        const timestamp = firebase.firestore.FieldValue.serverTimestamp()
        const data = {
        Unique_ID: idn,
        Username: abc,
        LastSignIn: timestamp    
        }
        usersRef.add(data)
}
async function isOldAccount(abc) {
    try {
        const querySnapshot = await usersRef.where('Username', '==', abc).limit(1).get();
        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            if (data.LastSignIn) {
                const timestamp = data.LastSignIn.toDate().getTime();
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime();
                const isThirtyDaysAgoOrEarlier = timestamp <= thirtyDaysAgo;
                console.log(isThirtyDaysAgoOrEarlier);
                return isThirtyDaysAgoOrEarlier;
            } else {
                console.log("LastSignIn field is missing");
                return false;
            }
        } else {
            console.log("No documents found for query");
            return false;
        }
    } catch (error) {
        console.log('Error:', error);
        return false;
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
            Alert(i18n.t("ErrNameTaken"))
          }
    }
    catch(error){
      console.log(error);
    }        
  }

const pressHandler = () =>{
    console.log(uniqueId)
    console.log(userName)
    if(userName.length > 12 || userName.length < 3){
        Alert(i18n.t("ErrNameLength"))
        setUsernameModalVis(true)
    }else {
        if (latitude && longitude != null) {
            roomName = ""
            findRoom(latitude,6,5)
            findRoom(longitude,6,5)
            updateDateTime(userName)
            navigation.navigate("ChatRoom", {userName, roomName, rando, uniqueId})
        }
    }
}
const modalGlobe = () => {
    if(userName.length > 12 || userName.length < 3){
        Alert(i18n.t("ErrNameLength"))
        setUsernameModalVis(true)
    }
    else if(custName.length > 13 || custName.length < 3){
        Alert(i18n.t("ErrRoomLength"))
    }
    else {
        if (latitude && longitude != null) {
            roomName = ""
            roomName = custName
            roomName = roomName.toLocaleLowerCase()
        }
        updateDateTime(userName)
        navigation.navigate("ChatRoom", {userName, roomName, rando, uniqueId})
        setGlobeModalVis(false)
    }
}
const modalLocal = () => {
    if(userName.length > 12 || userName.length < 3){
        Alert(i18n.t("ErrNameLength"))
        setUsernameModalVis(true)
    }
    else if(custName.length > 13 || custName.length < 3){
        Alert(i18n.t("ErrRoomLength"))
    }
    else {
        if (latitude && longitude != null) {
            roomName = ""
            findRoom(latitude,4,3)
            findRoom(longitude,4,3)
            roomName = roomName + "_" + custName.toLocaleLowerCase()
        }
        updateDateTime(userName)
        navigation.navigate("ChatRoom", {userName, roomName, rando, uniqueId})
        setLocalModalVis(false)
    }
}
const checkForUsername = () => {
    if(userName.length > 12 || userName.length < 3){
        Alert(i18n.t("ErrNameLength"))
    }else if (userName.includes(" ")) {
        Alert(i18n.t("ErrNameSpace"))
    }else {
        changeUsername(userName)

    }
}
const infoHandler = () => {
    Alert(i18n.t("InfoNameRules"))
}
//      alerts
function Alert(abc){
setAlertModal(true)
setAlertMessage(abc)
}

return(
<>
{isLoading ? (

    <View style={globalStyles.signInCont}>
        <Image style={{flex:1, resizeMode: 'contain'}}
            source={require('../assets/images/splash.png')}
        />
        <Text style={globalStyles.loadingFont}>{i18n.t('Loading')}</Text>
    </View>
) : (

userPerm == true ?
<View style={globalStyles.signInCont}>

        <BannerAd
        unitId={'ca-app-pub-4831537919211081/7973670195'}
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

{/*     ALERT       ALERT       ALERT       ALERT       ALERT       */}
<Modal
animationType='none'
transparent={true}
visible={alertModal}
>
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>

        <View style={globalStyles.modalAlert}>
            <Text style={[globalStyles.inputText, {marginHorizontal: '4%', textAlign: 'center'}]}>{alertMessage}</Text>
                        
            <TouchableOpacity style={globalStyles.alertBtn} onPress={()=> {setAlertModal(false); setUsernameModalVis(true)}}>
                <Text style={[globalStyles.inputText, globalStyles.green]}>{i18n.t('Okay')}</Text>
            </TouchableOpacity>
        </View>
    </View>
</Modal>

</View>

    :

//  ASK FOR PERMISSIONS     ASK FOR PERMISSIONS     ASK FOR PERMISSIONS
<SafeAreaView style={[globalStyles.signInCont, {justifyContent: 'center'}]}>
<Text style={[globalStyles.basicText, globalStyles.pink,{textAlign: 'center', paddingHorizontal: 20}]}>
    please turn your location permission 'on' for this app, and restart application
</Text>
<TouchableOpacity style={globalStyles.signInBtn} onPress={askPerm}>
    <Text style={globalStyles.inputText}>permission</Text>
</TouchableOpacity>
</SafeAreaView> 

)}
</>

)    
}
