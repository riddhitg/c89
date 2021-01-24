import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, ScrollView, KeyboardAvoidingView, FlatList, SnapshotViewIOS} from 'react-native'
import {ListItem} from 'react-native-elements';
import firebase from 'firebase';
import db from '../config';
import MyHeader from '../components/MyHeader';

export default class SettingScreen extends React.Component{
    constructor(){
        super()
        this.state = {
            emailId:'',
            firstName:'',
            lastName:'',
            contact:'',
            address:'',
            docId:''
        }
    }
    
    getUserDetails = ()=>{
        var emailId = firebase.auth().currentUser.email;
        db.collection('users').where('email_id', '==', emailId).get()
        .then(SnapShot=>{
            SnapShot.forEach(doc=>{
                var data = doc.data()
                this.setState({
                    emailId:data.email_id,
                    firstName:data.first_name,
                    lastName:data.last_name,
                    address:data.address,
                    contact:data.contact,
                    docId:doc.id
                })
            })
        })
    }

    updateUserDetails = ()=>{
        db.collection('users').doc(this.state.docId).update({
            "first_name":this.state.firstName,
            "last_name":this.state.lastName,
            "address":this.state.address,
            "contact":this.state.contact
        })
        alert("profile update successfully")
    }
    componentDidMount(){
        this.getUserDetails()
    }
    render(){
        return(
        <View style = {styles.container}>
            <MyHeader title = "Settings" navigation = {this.props.navigation}/>
            <View style = {styles.formContainer}>
            <TextInput style = {styles.formTextInput}
                            placeholder = {"first name"}
                            maxLength = {8}
                            onChangeText = {(text)=>{
                                this.setState({
                                    firstName:text
                                })
                            }}
                            value = {this.state.firstName}
                            />
                            <TextInput style = {styles.formTextInput}
                            placeholder = {"last name"}
                            maxLength = {8}
                            onChangeText = {(text)=>{
                                this.setState({
                                    lastName:text
                                })
                            }}
                            value = {this.state.lastName}
                            />
                            <TextInput style = {styles.formTextInput}
                            placeholder = {"contact"}
                            maxLength = {10}
                            keyboardType = {'numeric'}
                            onChangeText = {(text)=>{
                                this.setState({
                                    contact:text
                                })
                            }}
                            value = {this.state.contact}
                            />
                            <TextInput style = {styles.formTextInput}
                            placeholder = {"address"}
                            multiline = {true}
                            onChangeText = {(text)=>{
                                this.setState({
                                    address:text
                                })
                            }}
                            
                            value = {this.state.address}/>
                            <TouchableOpacity style = {styles.button}
                            onPress = {()=>{
                                this.updateUserDetails()
                            }}>
                                <Text style = {styles.buttonText}>Save</Text>
                            </TouchableOpacity>
            </View>
        </View>
        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    formContainer:{
        flex:1,
        width:'100%',
        alignItems:'center'
    },
    formTextInput:{
        width:"75%",
        height:35,
        alignSelf:"center",
        borderColor:'#ffab91',
        borderRadius:10,
        borderWidth:1,
        marginTop:20,
        padding:10
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
    buttonText:{
        color:'#ffff',
        fontWeight:'200',
        fontSize:20
    },
})