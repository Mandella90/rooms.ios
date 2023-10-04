import { StyleSheet, Text} from 'react-native'
import { Dimensions } from 'react-native';

const {height, width} = Dimensions.get('window')
const flatHeight = height * .85
const messagerHeight = height *.15

export const globalStyles = StyleSheet.create({
  
  green: {color: '#8FD359'},
  pink: {color: '#DD63DA'},
  orange: {color: '#D77340'},
  purple: {color: '#8E64BF'},
  red: {color: '#C33231'},
  blue: {color: '#75ADCE'},
  yellow: {color: '#D6D85B'},
  white: {color: '#BBB'},
  postGray: {backgroundColor: '#282828'},
  postBlack: {backgroundColor: 'black'},
  postN: {
    paddingVertical: 8,
    paddingHorizontal:10,
    borderRadius: 10,
    marginVertical: 2
  },
    basicText: {
    fontSize: height*.03,
  },
  inputText: {
    color: "#BBB",
    fontSize: height*.04,
  },
  specText: {
    height: messagerHeight*.4,
    width: messagerHeight*.4,
  },
    post: {
    color: "#BBB", 
  },
    messageInput: {
    backgroundColor: "#303030",
    width: "65%",
    height: "60%",
    marginVertical: height*.03,
    borderRadius: 5,
    paddingLeft: 10,
  },
    usernameInput: {
    backgroundColor: "#777",
    borderRadius: 5,
    padding: height*.01,
    marginTop: height*.03,
    width: width*.6,
    fontSize: height*.05,
    textAlign: "center",
  },
    loadingFont: {
      position: 'absolute', 
      bottom: '20%', 
      justifyContent: 'center', 
      alignItems: 'center', 
      color: '#BBB', 
      fontSize: height*.05
  },
  //   BUTTONS   BUTTONS   BUTTONS   BUTTONS   
    modalButtons: {
    flexDirection: "row",
    justifyContent: 'space-evenly',
    marginTop: 10,
  },
  modalBtn: {
    borderWidth: 3,
    borderColor: "#D60049",
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 10,
    marginTop: 5,
    marginHorizontal: 20
  },
    messageBtn:  {
    paddingVertical: messagerHeight*.1,
    paddingHorizontal: width*.04,
    marginLeft: '5%',
  },
    signInBtn: {
    borderWidth: 4,
    borderColor: "#D60049",
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingHorizontal: height*.04,
    paddingTop: height*.015,
    paddingBottom: height*.02,
    marginTop: height*.01
  },
  miniModalImage: {
    width: height*.05,
    height: height*.05,
    opacity: .8
  },
  modalImage: {
    position: 'absolute',
    top: height*.05,
    width: height*.35,
    height: height*.35,
    zIndex: -1,
    opacity: .9
  },
  infoIconOpacity:{
    position: 'absolute',
    top: height*.04,
    right: height*.04,
  },
  infoIcon:{    
    height: height*.04,
    width: height*.04,
  },
  alertBtn:{
    bottom: '1%',
    right: '2%',
    position: 'absolute',
    paddingHorizontal: '6%',
    paddingVertical: '3%',
  },
  //	SIGN IN   SIGN IN   SIGN IN   SIGN IN   CONT
  signInCont: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: "black",
    alignItems: "center",
    width: width,
    height: height
  },  
  titleCont: {
    position: 'absolute',
    top: height *.20,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomsTitle: {
    flex: 1,
    width: '100%',
    maxWidth: 800,
    height: undefined,
    aspectRatio: 3,
    opacity: 1,
  },
  usernameCont: {
    position: 'absolute',
    alignItems: 'center',
    bottom: height*.4,
    width: width,
  },
  modalView: {
    width: width,
    maxWidth: 800,
    flexDirection: "row",
    position: 'absolute',
    bottom: '10%',
    justifyContent: 'space-evenly',
  },
  modalCont: {
    flex: 1,
    height: height,
    width: width,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  modalAlert:{    
    height: height*.5,
    width: width*.9,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: '#5C5C5C',
    borderRadius: 45,
    backgroundColor: '#212121',
  },

  //  CHATROOM CONT   CHATROOM CONT   CHATROOM CONT   CHATROOM CONT
  bigCont: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: "black",
    alignItems: "center",
},
flatList: {
    flex: 9,  // this value can be adjusted as per your requirement
    width: "98%",
    maxWidth: 1000,
    backgroundColor: "black",
    overflow: 'scroll'
},
messageCont: {
    flex: 1,  // this value can be adjusted as per your requirement
    maxHeight: messagerHeight,
    flexDirection: "row",
    width: width,
    maxWidth: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 4,
    borderTopColor: "#DD63DA",
    marginTop: height*.03,
},
bannerAd: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'red'
}






  //  CHATROOM CONT   CHATROOM CONT   CHATROOM CONT   CHATROOM CONT
  /*bigCont: {
    flex: 1,
    height: height,
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: "black",
    alignItems: "center",
  },
  flatList: {
    height: flatHeight,
    width: "98%",
    maxWidth: 1000,
    backgroundColor: "black",
    overflow: 'scroll'
  },
  messageCont: {
    flex: 1,
    flexDirection: "row",
    width: width,
    maxWidth: 1000,
    height: messagerHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 4,
    borderTopColor: "#DD63DA",
    marginTop: height*.03,
  },
  //  ADS   ADS   ADS   ADS   
  bannerAd: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'red'
  }*/
})

