import React, { Component } from "react";
import {
    View,
    Text,
    Dimensions,
    ActivityIndicator,
    ToastAndroid,
    ScrollView,
    TouchableNativeFeedback,
    TouchableOpacity,
    Platform,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    ImageBackground,
    Animated,
    Easing
} from "react-native";
import { Header, Button } from "react-native-elements";
import EIcon from "react-native-vector-icons/Entypo";
import Global from "../src/Global";
import ClassTable from "../src/Class/ClassTable";
import AppStorage from "../src/AppStorage";
import Toast from "react-native-easy-toast";
import ClassInterface from "../src/FetchInterface/ClassInterface";
import WeekPicker from "../src/Class/WeekPicker";
import ClassAdditions from "../src/Class/ClassAdditions";

const { width, height } = Dimensions.get("window");

export default class TablePage extends Component {
    constructor(props) {
        super(props);
        this.openDrawer = this.openDrawer.bind(this);
        this.openPicker = this.openPicker.bind(this);
        this.changeWeek = this.changeWeek.bind(this);
        this.state = {
            getClassTable: false,
            classJson: [],
            currentWeek: " - ",
            pickerOpen: false,
            classAdditionsOpen: false,
            addButtonDeg: new Animated.Value(0),
            settings: { backgroundImage: "" }
        };
    }

    componentWillMount() {
        this.setState({
            settings: Global.settings.class
        });
    }

    componentDidMount() {
        if (Global.startDate != "") {
            this.setState({
                currentWeek: global.getCurrentWeek(Global.startDate)
            });
        }
        if (Global.isOnline && Global.classJson.length == 0) {
            ClassInterface(res => {
                if (res.message == "success") {
                    this.setState({
                        classJson: res.content,
                        getClassTable: true
                    });
                    Global.classJson = res.content;
                }
            });
        } else {
            if (Global.classJson.length != 0) {
                this.setState({
                    classJson: Global.classJson,
                    getClassTable: true
                });
            } else {
                AppStorage._load("classJson", res => {
                    if (res.message == "success") {
                        Global.classJson = res.content;
                        this.setState({
                            classJson: res.content,
                            getClassTable: true
                        });
                    } else if (
                        res.message == "error" &&
                        !Global.isOnline &&
                        !Global.checkingOnline
                    ) {
                        this.props.navigation.navigate("Login");
                    }
                });
            }
        }
    }

    componentWillReceiveProps() {
        this.setState({
            settings: Global.settings.class,
            classJson: Global.classJson,
            getClassTable: true
        });
    }

    openDrawer() {
        // 打开抽屉式导航
        this.props.navigation.openDrawer();
        this.setState({ pickerOpen: false });
        this.refs.weekPicker.closePicker();
        this.handleAddButton();
    }

    openPicker() {
        this.refs.weekPicker.handlePickerOpen();
        this.setState({ pickerOpen: !this.state.pickerOpen });
    }
    /**
     * 更换当前显示的周数
     * @param {String} _week 周数
     */
    changeWeek(_week) {
        this.setState({
            currentWeek: _week,
            pickerOpen: false
        });
    }

    /**
     * 返回本周
     */
    goBack() {
        var currentWeek = global.getCurrentWeek(Global.startDate);
        if (this.state.currentWeek != currentWeek) {
            this.setState({
                currentWeek: currentWeek,
                pickerOpen: false
            });
        }
        this.refs.weekPicker.changeWeek(currentWeek);
    }

    handleWeekPicker() {
        this.setState({ pickerOpen: false });
        this.refs.weekPicker.closePicker();
    }

    handleAddButton() {
        this.refs.classAdditions.handlePickerOpen();
        if (this.state.classAdditionsOpen) {
            Animated.timing(this.state.addButtonDeg, {
                toValue: 0,
                duration: 300,
                easing: Easing.linear
            }).start();
            this.setState({ classAdditionsOpen: false });
        } else {
            Animated.timing(this.state.addButtonDeg, {
                toValue: 1,
                duration: 300,
                easing: Easing.linear
            }).start();
            this.setState({ classAdditionsOpen: true });
        }
    }

    refreshClassTable() {
        if (!Global.isOnline) {
            Platform.OS === "ios"
                ? this.refs.toast.show("登录后才可以刷新课表~", 2000)
                : ToastAndroid.show(
                      "登录后才可以刷新课表~",
                      ToastAndroid.SHORT
                  );
        } else {
            ClassInterface(res => {
                if (res.message == "success") {
                    Global.classJson = res.content;
                    this.setState({
                        classJson: res.content,
                        getClassTable: true
                    });
                    Platform.OS === "ios"
                        ? this.refs.toast.show("课表已刷新~", 2000)
                        : ToastAndroid.show("课表已刷新~", ToastAndroid.SHORT);
                } else {
                    Platform.OS === "ios"
                        ? this.refs.toast.show("登录后才可以刷新课表~", 2000)
                        : ToastAndroid.show(
                              "登录后才可以刷新课表~",
                              ToastAndroid.SHORT
                          );
                }
            });
        }
        this.refs.classAdditions.handlePickerOpen();
        if (this.state.classAdditionsOpen) {
            Animated.timing(this.state.addButtonDeg, {
                toValue: 0,
                duration: 300,
                easing: Easing.linear
            }).start();
            this.setState({ classAdditionsOpen: false });
        }
    }

    handleDeleteClass() {
        this.setState({
            classJson: Global.classJson,
            getClassTable: true
        });
    }

    render() {
        const { navigate } = this.props.navigation;
        var headerStyle = {
            borderBottomColor: Global.settings.theme.backgroundColor
        };
        if (Platform.OS == "ios") {
            headerStyle.paddingTop = 0;
            headerStyle.height = 44;
        }

        var weekNotice =
            "第" +
            this.state.currentWeek +
            "周" +
            (this.state.currentWeek != global.getCurrentWeek(Global.startDate)
                ? "(非本周)"
                : "");
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: Global.settings.theme.backgroundColor
                }}
            >
                <StatusBar
                    backgroundColor={Global.settings.theme.backgroundColor}
                    barStyle="light-content"
                    translucent={false}
                />
                <Toast ref="toast" />
                <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
                    <Header
                        containerStyle={headerStyle}
                        backgroundColor={Global.settings.theme.backgroundColor}
                        placement="left"
                        leftComponent={
                            <Button
                                title=""
                                icon={
                                    <EIcon
                                        name="menu"
                                        size={28}
                                        color="white"
                                    />
                                }
                                clear
                                onPress={this.openDrawer}
                            />
                        }
                        centerComponent={
                            Platform.OS === "ios" ? (
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    onPress={this.goBack.bind(this)}
                                >
                                    <Text
                                        style={{
                                            color: "#fff",
                                            fontSize: 16
                                        }}
                                    >
                                        课程表 {weekNotice}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableNativeFeedback
                                    onPress={this.goBack.bind(this)}
                                >
                                    <Text
                                        style={{
                                            color: "#fff",
                                            fontSize: 16
                                        }}
                                    >
                                        课程表 {weekNotice}
                                    </Text>
                                </TouchableNativeFeedback>
                            )
                        }
                        rightComponent={
                            <View style={{ flexDirection: "row" }}>
                                <Animated.View
                                    style={{
                                        marginRight: 15,
                                        transform: [
                                            {
                                                rotateZ: this.state.addButtonDeg.interpolate(
                                                    {
                                                        inputRange: [0, 1],
                                                        outputRange: [
                                                            "0deg",
                                                            "45deg"
                                                        ]
                                                    }
                                                )
                                            }
                                        ]
                                    }}
                                >
                                    <Button
                                        title=""
                                        icon={
                                            <EIcon
                                                name="plus"
                                                size={28}
                                                color="white"
                                            />
                                        }
                                        clear
                                        onPress={this.handleAddButton.bind(
                                            this
                                        )}
                                    />
                                </Animated.View>
                                <View>
                                    <Button
                                        title=""
                                        icon={
                                            <EIcon
                                                name={
                                                    this.state.pickerOpen
                                                        ? "chevron-up"
                                                        : "chevron-down"
                                                }
                                                size={28}
                                                color="white"
                                            />
                                        }
                                        clear
                                        onPress={this.openPicker}
                                    />
                                </View>
                            </View>
                        }
                    />
                    <ImageBackground
                        source={{ uri: this.state.settings.backgroundImage }}
                        style={{ flex: 1 }}
                    >
                        <ClassAdditions
                            ref="classAdditions"
                            handleChange={this.handleAddButton.bind(this)}
                            navigation={this.props.navigation}
                            refreshClassTable={this.refreshClassTable.bind(
                                this
                            )}
                        />
                        <WeekPicker
                            currentWeek={global.getCurrentWeek(
                                Global.startDate
                            )}
                            ref="weekPicker"
                            changeWeek={this.changeWeek.bind(this)}
                        />
                        <View style={{ flex: 1 }}>
                            {this.state.getClassTable ? (
                                <ClassTable
                                    navigation={this.props.navigation}
                                    classList={this.state.classJson}
                                    week={this.state.currentWeek}
                                    settings={this.state.settings}
                                    onScroll={this.handleWeekPicker.bind(this)}
                                    handleDeleteClass={this.handleDeleteClass.bind(
                                        this
                                    )}
                                />
                            ) : (
                                <View
                                    style={{
                                        flex: 1,
                                        paddingVertical: height / 2 - 150
                                    }}
                                >
                                    {Global.isOnline ? (
                                        <ActivityIndicator
                                            size="large"
                                            color={
                                                Global.settings.theme
                                                    .backgroundColor
                                            }
                                        />
                                    ) : null}
                                </View>
                            )}
                        </View>
                    </ImageBackground>
                </View>
            </SafeAreaView>
        );
    }
}
