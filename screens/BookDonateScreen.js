import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, ScrollView, KeyboardAvoidingView, FlatList, Image} from 'react-native'
import {ListItem} from 'react-native-elements';
import firebase from 'firebase';
import db from '../config';
import MyHeader from '../components/MyHeader';

export default class BookDonateScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            requestedBooksList:[]
        }
        this.requestRef = null
    }
    getRequestedBooksList = ()=>{
        this.requestRef = db.collection("reqested_books")
        .onSnapshot((snapshot)=>{
            var requestedBooksList = snapshot.docs.map(document => document.data())
            this.setState({
                requestedBooksList : requestedBooksList
            })
        })
    }
    componentDidMount(){
        this.getRequestedBooksList()
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
            subtitle = {item.reason_toRequest}
            titleStyle = {{color:'black', fontWeight:'bold'}}
            leftElement = {
                <Image style = {{height:50,width:50}}
                source = {{uri:item.image_link}}/>
            }
            rightElement = {
                <TouchableOpacity style = {styles.button}
                onPress = {()=>{
                    this.props.navigation.navigate("RecieverDetails",{"details":item})
                }}
                >
                    <Text style = {{color : '#ffff'}}>View</Text>
                </TouchableOpacity>
            }
            bottomDivider/>
        )
    }
    render(){
        return(
            <View style = {{flex:1}}>
                <MyHeader title = "Donate Books" navigation = {this.props.navigation}/>
                <View style = {{flex:1}}>
                    {
                        this.state.requestedBooksList.length === 0
                        ?(
                            <View style = {styles.subContainer}>
                                <Text style = {{fontSize:20}}>list of all requested books</Text>
                                </View>
                        )
                        :(
                            <FlatList
                            keyExtractor = {this.keyExtractor}
                            data = {this.state.requestedBooksList}
                            renderItem = {this.renderItem}
                            />
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