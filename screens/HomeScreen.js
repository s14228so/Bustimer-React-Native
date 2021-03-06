import React, { useState, useEffect, useContext } from "react"
import { View, Text, StyleSheet, ImageBackground, AsyncStorage } from 'react-native'
import { NavigationEvents } from "react-navigation"
import NextBusList from "../components/NextBusList"
import Destination from "../components/Destination"
import Timer from "../components/Timer"
import makeDate from "../helpers/dateFormatter"
import timeTable from "../static/timeTable.json"
import { Button } from "react-native-paper"

const HomeScreen = () => {
  const [now, setNow] = useState(makeDate(new Date()));
  //現在時刻をstateに
  const [dest, setDest] = useState({ from: "sfc", to: "sho" })
  //行き先をstateに
  const [nextBuses, setNextBuses] = useState([])
  //これから来るバス配列をstateに(NextBusListコンポーネントに渡す用)
  const [timer, setTimer] = useState({ leftMinute: 0, leftSecond: 0 })
  //timerをstateに(Timerコンポーネントに渡す用)

  const change = () => { //目的地と現在地をを入れ替えるボタンをクリックした時に発火
    setDest({ from: dest.to, to: dest.from }) //目的地(to)と現在地(from)を入れ替えてる
  }


  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(makeDate(new Date()));
    }, 1000);
    //1秒ごとに現在時刻を更新してstateに入れる

    if (nextBuses.length) {
      const nextBus = nextBuses[0]
      let leftMinute, leftSecond;
      leftSecond = 60 - now.second - 1;
      const hour = parseInt(nextBus.h)
      const min = parseInt(nextBus.m)
      if (hour > now.hour) {
        leftMinute = ((hour - now.hour) * 60)
          - now.minute
          + min - 1;
      } else {
        leftMinute = min - now.minute - 1;
      }

      if (leftMinute === 0 && leftSecond === 0) {
        setTimer({ leftMinute: 0, leftSecond: 0 })
        setNextBuses(nextBuses.slice(1))
      } else {
        setTimer({ leftMinute, leftSecond })
      }
    }

    return () => { clearInterval(intervalId) };
  }, [now]);




  const fetchBus = () => {
    const todayData = timeTable[dest["from"]][dest["to"]]["weekday"]

    let nextBuses = todayData.filter(time => {
      return (
        (time.h > now.hour)
        ||
        (
          time.h === now.hour &&
          time.m > now.minute
        )
      )
    });

    setNextBuses(nextBuses)
  }

  useEffect(() => {
    fetchBus()
  }, [dest]);

  const _fetchStore = async () => {
    try {
      const value = await AsyncStorage.getItem('destination')
      if (value !== null) {
        const { to } = JSON.parse(value)
        setDest({ ...dest, to })
      }
    }
    catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    _fetchStore();
  }, []);




  return (<View >
    <ImageBackground source={require('../assets/images/sfc.png')} style={styles.timer}>
      <Timer now={now} timer={timer} nextBuses={nextBuses} />
    </ImageBackground>
    <NavigationEvents
      onWillFocus={() => _fetchStore()}
    />

    <Destination dest={dest} change={change} />
    <NextBusList nextBuses={nextBuses} />
  </View>)
}

const styles = StyleSheet.create({
  textCenter: {
    textAlign: "center"
  },
  wrapper: {
    marginTop: 0,
    flexDirection: 'column',
    justifyContent: "space-around",
    flex: 1,
  },
  backgroundImage: {
    height: 170,
    flex: 1,
  },
  timer: {
    height: 170,
    lineHeight: 100,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 45,
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  date: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 20,
    opacity: 0.8,
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  ListWrapper: {
    marginTop: 10
  },
  busItem: {
    height: 35,
    marginTop: 10,
    paddingLeft: 10,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  busItemText: {
    marginLeft: 10,
    marginRight: 10,
    lineHeight: 25,
    fontSize: 20,
  },
  busTypeText: {
    lineHeight: 28,
    fontSize: 15,
  },
  textLeft: {
    textAlign: "left"
  },
  scroll: {
    marginTop: 15,
  },
  distination: {
    padding: 8,
    alignItems: 'center',
    height: 170,
    justifyContent: "space-around"
  },
  distTitle: {
    fontSize: 40
  },
  preTitle: {
    fontSize: 15,
  },
  arrow: {
    position: "absolute",
    right: 15,
    top: 60
  }
});

HomeScreen.navigationOptions = ({ navigation }) => ({
  headerTitle: () => <Text>Bustimer</Text>,
  headerRight: () => {
    return (
      <Button icon="settings-outline"
        color="#000"
        onPress={() => navigation.navigate('Settings')}
      >
      </Button>
    )
  }
});

export default HomeScreen