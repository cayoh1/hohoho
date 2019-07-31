import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ListView,
  TextInput,
  Button,
  ScrollView,
  RefreshControl,
  AsyncStorage
} from "react-native";
import ReactNative from "react-native";
import _ from "underscore";
import { createStackNavigator, createAppContainer } from "react-navigation";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import MapView from "react-native-maps";
import Swiper from 'react-native-swiper'

class HomePage extends Component {
  static navigationOptions = props => ({
    title: "Home Page"
  });
  constructor() {
    super();
    this.state = {};
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.headers}> Welcome to HoHoHo! </Text>
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate("LogIn");
          }}
          style={styles.buttonGreen}
        >
          <Text style={styles.buttonText}> Log In </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate("SignUp");
          }}
          style={styles.buttonBlue}
        >
          <Text style={styles.buttonText}> Sign Up </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class LogIn extends Component {
  static navigationOptions = props => ({
    title: "Log In"
  });
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      message: ""
    };
  }

  login(username, password) {
    if (!username || !password) {
      alert("Please enter username and password!");
      return;
    }
    fetch("https://hohoho-backend.herokuapp.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      redirect: "follow",
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
      .then(response => response.json())
      .then(responseJson => {
        /* do something with responseJson and go back to the Login view but
         * make sure to check for responseJson.success! */
        // console.log("json", responseJson);

        if (responseJson.success === true && responseJson.user) {
          AsyncStorage.setItem(
            "user",
            JSON.stringify({
              username: username,
              password: password
            })
          );
          this.props.navigation.navigate("Users");
        } else {
          this.setState({ message: "Incorrect credentials!!" }).bind(this);
          alert(`${this.state.message}`);
        }
      })
      .catch(err => {
        alert(err);
      });
  }

  componentDidMount() {
    AsyncStorage.getItem("user")
      .then(result => {
        if (result === null) {
          return;
        }
        var parsedResult = JSON.parse(result);
        var username = parsedResult.username;
        var password = parsedResult.password;
        if (username && password) {
          return this.login(username, password);
        }
        // Don't really need an else clause, we don't do anything in this case.
      })
      .catch(err => {
        alert(err);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          onChangeText={text => this.setState({ username: text })}
          value={this.state.username}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          onChangeText={text => this.setState({ password: text })}
          value={this.state.password}
          secureTextEntry={true}
        />

        <TouchableOpacity
          onPress={() => this.login(this.state.username, this.state.password)}
          style={styles.buttonRed}
        >
          <Text style={styles.buttonText}> Log In </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class SignUp extends Component {
  static navigationOptions = props => ({
    title: "Sign Up"
  });
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };
  }
  register() {
    if (!this.state.username || !this.state.password) {
      alert("Please enter username and password!");
      return;
    }
    fetch("https://hohoho-backend.herokuapp.com/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      redirect: "follow",
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
      .then(response => response.json())
      .then(responseJson => {
        /* do something with responseJson and go back to the Login view but
         * make sure to check for responseJson.success! */
        // console.log("json", responseJson);

        if (responseJson.success === true && responseJson.user) {
          this.props.navigation.navigate("LogIn");
        }
      })
      .catch(err => {
        alert(err);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          onChangeText={text => this.setState({ username: text })}
          value={this.state.username}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          onChangeText={text => this.setState({ password: text })}
          value={this.state.password}
          secureTextEntry={true}
        />
        <TouchableOpacity
          onPress={() => this.register()}
          style={styles.buttonRed}
        >
          <Text style={styles.buttonText}> Sign Up </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class Users extends Component {
  static navigationOptions = props => ({
    title: "Users",
    headerRight: (
      <Button
        title="View Messages"
        onPress={() => props.navigation.navigate("Messages")}
      />
    )
  });
  constructor(props) {
    super(props);
    this.state = {
      users: []
    };
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
  }

  componentDidMount() {
    fetch("https://hohoho-backend.herokuapp.com/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      redirect: "follow"
    })
      .then(response => response.json())
      .then(responseJson => {
        const users = responseJson.users;
        this.setState({
          users: users
        });
      })
      .catch(err => {
        alert(err);
      });
  }

  touchUser(user) {
    fetch("https://hohoho-backend.herokuapp.com/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      redirect: "follow",
      body: JSON.stringify({
        to: user._id
      })
    })
      .then(response => response.json())
      .then(responseJson => {
        // console.log(responseJson);
        if (responseJson.success === true) {
          alert(`Your Ho Ho Ho! to ${user.username} has been sent! :) `);
        } else {
          alert(`Your Ho Ho Ho! has not been sent! :(`);
        }
      });
  }

  sendLocation = async user => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      alert("Permission Denied!");
      return;
    }
    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true
    });
    // console.log(location)
    fetch("https://hohoho-backend.herokuapp.com/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      redirect: "follow",
      body: JSON.stringify({
        to: user._id,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      })
    })
      .then(response => response.json())
      .then(responseJson => {
        // console.log(responseJson);
        if (responseJson.success === true) {
          alert(`Your location has been sent to ${user.username}! :) `);
        } else {
          alert(`Your location has not been sent! :(`);
        }
      });
  };

  render() {
    return (
      <View>
        <View>
          <ListView
            dataSource={this.ds.cloneWithRows(this.state.users)}
            renderRow={rowData => (
              <TouchableOpacity
                style={styles.users}
                onPress={this.touchUser.bind(this, rowData)}
                onLongPress={this.sendLocation.bind(this, rowData)}
              >
                <Text>{rowData.username}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    );
  }
}

class Messages extends Component {
  static navigationOptions = props => ({
    title: "Messages"
  });
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
  }
  componentDidMount() {
    fetch("https://hohoho-backend.herokuapp.com/messages", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      redirect: "follow"
    })
      .then(response => response.json())
      .then(responseJson => {
        // console.log(responseJson);
        const messages = responseJson.messages;
        this.setState({
          messages: messages
        });
      })
      .catch(err => {
        alert(err);
      });
  }

  render() {
    return (
      <ScrollView>
        <View>
          {this.state.messages.map((message, i) => (
            <View key={i} style={styles.messages}>
              <Text> </Text>
              <Text> From: {message.from.username}</Text>
              <Text> To: {message.to.username} </Text>
              <Text> Message: {message.body} </Text>
              <Text>
                At: {new Date(message.timestamp).toString().substring(0, 25)}{" "}
              </Text>
              <Text> </Text>

            {message.location ? <MapView style={{height: 200}}
            region={{
              latitude: message.location.latitude,
              longitude: message.location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421}}>
              <MapView.Marker coordinate={{
                latitude: message.location.latitude,
                longitude:message.location.longitude}}
              title={`${message.from.username}'s location`}/>
              </MapView> : <Text></Text>}
              </View>
          ))}
        </View>
      </ScrollView>
    );
  }
}

class RefreshableList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false
    };
  }

  _onRefresh = () => {
    this.setState({ refreshing: true });
    fetchData().then(() => {
      this.setState({ refreshing: false });
    });
  };

  render() {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        }
      />
    );
  }
}

const Navigator = createStackNavigator({
  Home: { screen: HomePage },
  LogIn: { screen: LogIn },
  SignUp: { screen: SignUp },
  Users: { screen: Users },
  Messages: { screen: Messages }
});

export default createAppContainer(Navigator);

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },

  buttons: {
    fontSize: 40
  },

  headers: {
    fontSize: 50,
    textAlign: "center"
  },
  input: {
    fontSize: 15,
    width: 400,
    height: 40,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  users: {
    borderColor: "black",
    borderWidth: 0.5,
    borderStyle: "solid",
    padding: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  messages: {
    fontSize: 10,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#d6d7da",
    margin: 5
  },
  buttonGreen: {
    alignSelf: "stretch",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    backgroundColor: "#40D654"
  },
  buttonText: {
    textAlign: "center",
    fontSize: 30,
    color: "white"
  },
  buttonBlue: {
    alignSelf: "stretch",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    backgroundColor: "#368FD5"
  },
  buttonRed: {
    alignSelf: "stretch",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    backgroundColor: "red"
  }
});
