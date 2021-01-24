import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, ScrollView, KeyboardAvoidingView, FlatList} from 'react-native'
import {ListItem, Icon} from 'react-native-elements';
import firebase from 'firebase';
import db from '../config';
import MyHeader from '../components/MyHeader';
import SwipeableFlatList from '../components/SwipeableFlatList';

export default class MyRecievedBooksScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            userId:firebase.auth().currentUser.email,
            recievedBooksList:[]
        }
        this.requestRef = null
    }
    getRecievedBooksList = ()=>{
        this.requestRef = db.collection("requested_books").where("user_id",'==',this.state.userId)
        .where("book_status",'==','recieved')
        .onSnapshot((snapshot)=>{
            var recievedBooksList = snapshot.docs.map((doc)=>doc.data())
            this.setState({
                recievedBooksList : recievedBooksList
            })
        })
    }
    componentDidMount(){
        this.getRecievedBooksList()
    }
    componentWillUnmount(){
        this.requestRef
    }
    keyExtractor = (item, index)=>index.toString()

    renderItem = ({item,i})=>{
        return(
            <ListItem
            key = {i}
            title = {item.book_name}
            subtitle = {item.message}
            titleStyle = {{color:'black', fontWeight:'bold'}}
            leftElement = {<Icon name = "book" type = "font-awesome" color = '#696969'/>}
            bottomDivider/>
        )
    }
    render(){
        return(
            <View style = {{flex:1}}>
                <MyHeader title = "Recieved Books" navigation = {this.props.navigation}/>
                <View style = {{flex:1}}>
                    {
                        this.state.recievedBooksList.length === 0
                        ?(
                            <View style = {styles.subContainer}>
                                <Text style = {{fontSize:20}}>list of all recieved books</Text>
                                </View>
                        )
                        :(
                            <FlatList
                            keyExtractor = {this.keyExtractor}
                            data = {this.state.recievedBooksList}
                            renderItem = {this.renderItem}/>
                        )
                    }
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    subContainer:{
        flex:1,
        fontSize:20,
        justifyContent:'center',
        alignItems:'center'
    },
    button:{
        width:300,
        height:50,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:25,
        backgroundColor:"#ff9800",
        shadowColor:"#000",
        shadowOffset:{
            widht:0,
            height:8,
        },
        shadowOpacity:0.30,
        shadowRadius:10.32,
        elevation:16
    },
})