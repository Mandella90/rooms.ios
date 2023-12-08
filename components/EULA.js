import React, { useState } from 'react'
import { View, Text, Button, Dimensions, ScrollView, Modal } from 'react-native'
import MMKVStorage from 'react-native-mmkv'

const EulaMessage = () => {
  const [accepted, setAccepted] = useState(false)
  const mmkv = new MMKVStorage.Loader().initialize()
  const handleAccept = () => {
    setAccepted(true)
    mmkv.setString('EULA', 'yes')
    setAccepted(true)
  }
  const handleDisagree = () => {
    setAccepted(false)
    mmkv.setString('EULA', 'no')
  }

return (
<Modal visible={!accepted} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>End-User License Agreement</Text>
          <ScrollView style={styles.scrollableContent}>
            <Text style={styles.eulaText}>
              Your EULA Text Here:
              {'\n\n'}
              1. You agree to use this chat app respectfully and avoid offensive language or abusive behavior.
              {'\n\n'}
              2. More terms and conditions...
            </Text>
          </ScrollView>
          <View style={styles.actionButtons}>
            <Button title="AGREE" onPress={handleAccept} style={styles.agreeButton} />
            <Button title="DISAGREE" onPress={handleDisagree} style={styles.disagreeButton} />
          </View>
        </View>
      </View>
    </Modal>
  )

}

const window = Dimensions.get('window')
const modalWidth = window.width * 0.8
const modalHeight = window.height * 0.8

const styles = {
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: modalWidth,
    height: modalHeight,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    marginTop: 10,
  },
  scrollableContent: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  eulaText: {
    /* Your EULA Text Styling */
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  agreeButton: {
    backgroundColor: 'green',
  },
  disagreeButton: {
    backgroundColor: 'red',
  },
}

export default EulaMessage;