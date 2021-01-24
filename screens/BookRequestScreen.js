import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, ScrollView, KeyboardAvoidingView, FlatList, Image} from 'react-native'
import {ListItem} from 'react-native-elements';
import firebase from 'firebase';
import db from '../config';
import MyHeader from '../components/MyHeader';
import  BookSearch from 'react-native-google-books';
import { TouchableHighlight } from 'react-native-gesture-handler';

export default class BookRequestScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            userId:firebase.auth().currentUser.email,
            bookName:"",
            reasonToRequest:"",
            isBookRequestActive:"",
            requestedBookName:"",
            bookStatus:"",
            requestId:"",
            userDocId:"",
            docId:"",
            Imagelink:'',
            dataSource:"",
            showFlatList:false
        }
    }
    createUniqueId(){
        return Math.random().toString(36).substring(7)
    }
    addRequest = async (bookName, reasonToRequest)=>{
        var userId = this.state.userId
        var randomRequestId = this.createUniqueId()
        var books = await BookSearch.BookSearch.searchbook(bookName, 'AIzaSyAbKCIhuNQjfGlLInqCZiP24sRuG7rIgys')
        db.collection('reqested_books').add({
            "user_id":userId,
            "book_name":bookName,
            "reason_to_request": reasonToRequest,
            "request_id":randomRequestId,
            "book_status":"requested",
            "date":firebase.firestore.FieldValue.serverTimestamp(),
            "image_link":books.data[0].volumeInfo.imageLinks.smallThumbnail
        })
        await this.getBookRequest()
        db.collection('users').where("email_id","==",userId).get().then()
        .then((snapshot)=>{
            snapshot.forEach((doc)=>{
                db.collection('users').doc(doc.id).update({
                    isBookRequestActive:true
                })
            })
        })
        this.setState({
            bookName:'',
            reasonToRequest:'',
            requestId:randomRequestId
        })
        return alert("book requested successfully")
    }
    recievedBooks = (bookName)=>{
        var userId = this.state.userId
        var requestId = this.state.requestId
        db.collection('recieved_books').add({
            "user_id":userId,
            "book_name":bookName,
            "request_id":requestId,
            "bookStatus":"recieved"
        })
    }
    getIsBookRequestActive(){
        db.collection('users').where('email_id','==',this.state.userId)
        .onSnapshot(querySnapshot=>{
            querySnapshot.forEach(doc=>{
                this.setState({
                    isBookRequestActive:doc.data().isBookRequestActive,
                    userDocId:doc.id
                })
            })
        })
    }
    getBookRequest = ()=>{
        var bookRequest = db.collection('requested_books').where('user_id','==',this.state.userId).get()
        .then((snapshot)=>{
            snapshot.forEach((doc)=>{
                if(doc.data().book_status !== "recieved"){
                    this.setState({
                        requestId:doc.data().request_id,
                        requestedBookName:doc.data().book_name,
                        bookStatus:doc.data().book_status,
                        docId:doc.id
                    })
                }
            })
        })
    }
    sendNotification = ()=>{
        db.collection('users').where('email_id','==',this.state.userId).get()
        .then((snapshot)=>{
            snapshot.forEach((doc)=>{
                var name = doc.data().first_name
                var lastName = doc.data().last_name
                
                db.collection('all_notifications').where('request_id','==',this.state.requestId).get()
        .then((snapshot)=>{
            snapshot.forEach((doc)=>{
                var donorId = doc.data().donor_id
                var bookName = doc.data().book_name

                db.collection('all_notifications').add({
                    "target_user_id":donorId,
                    "message":name + " " + lastName + " recieved the book " + bookName,
                    "notification_status":"unread",
                    "book_name":bookName
                }) 
            })
        })
            })
        })
    }
    componentDidMount(){
        this.getBookRequest()
        this.getIsBookRequestActive()
    }
    updateBookRequestStatus = ()=>{
        db.collection("requested_books").doc(this.state.docId).update({
            book_status:'recieved'
        })
        db.collection('users').where('email_id','==',this.state.userId).get()
        .then((snapshot)=>{
            snapshot.forEach((doc)=>{
                db.collection('users').doc(doc.id).update({
                    isBookRequestActive:false
                })
            })
        })
    }
    async getBooksFromAPI(bookName){
        this.setState({bookName:bookName})
        if(bookName.length>1){
            var books = await BookSearch.BookSearch.searchbook(bookName, 'AIzaSyAbKCIhuNQjfGlLInqCZiP24sRuG7rIgys')
            this.setState({
                dataSource:books.data,
                showFlatList:true
            }) 
        }
    }
    renderItem = ({item,i})=>{
        let object = {
            title:item.volumeInfo.title,
            selfLink:item.selfLink,
            buyLink:item.saleInfo.buyLink,
            imageLink:item.volumeInfo.imageLinks
        }
        return(
           <TouchableHighlight style = {{alignItems:'center', backgroundColor:'#dddd', padding:10, width:'90%'}}
           activeOpacity = {0.6}
           underlayColor = '#dddd'
           onPress = {()=>{
               this.setState({
                   showFlatList:false,
                   bookName:item.volumeInfo.title
               })
           }}
           bottomDivider>
               <Text>{item.volumeInfo.title}</Text>
           </TouchableHighlight>
        )
    }
    render(){
        if(this.state.isBookRequestActive === true){
            return(
                <View style = {{flex:1,justifyContent:'center'}}>
                    <View style = {{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
                        <Text>Book Name</Text>
            <Text>{this.state.requestedBookName}</Text>
                    </View>
                    <View style = {{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
                        <Text>Book Status</Text>
            <Text>{this.state.bookStatus}</Text>
                    </View>
                    <TouchableOpacity style = {{borderWidth:1,borderColor:'orange',backgroundColor:'orange',width:300,alignSelf:"center",alignItems:'center',height:30,marginTop:30}}
                    onPress = {()=>{
                        this.sendNotification()
                        this.updateBookRequestStatus()
                        this.recievedBooks(this.state.requestedBookName)
                    }}>
                        <Text>I recieved the book</Text>
                    </TouchableOpacity>
                </View>
            )
        }
        else{

        
        return(
            <View style = {{flex:1}}>
                <MyHeader title = "request book" navigation = {this.props.navigation}/>
                <KeyboardAvoidingView style = {styles.keyboardStyle}>
                <TextInput style = {styles.formTextInput}
                            placeholder = {"enter book name"}
                            onChangeText = {(text)=>{
                            this.getBooksFromAPI(text)
                            }}
                            value = {this.state.bookName}
                            />
                            {
                                this.state.showFlatList?(
                                    <FlatList
                                    data = {this.state.dataSource}
                                    renderItem = {this.renderItem}
                                    enableEmptySections = {true}
                                    style = {{marginTop:10}}
                                    keyExtractor = {(item,index)=>index.toString()}
                                    />

                                ):(
                                    <View style = {{alignItems:'center'}}>
                            <TextInput style = {[styles.formTextInput,{height:300}]}
                            multiline = {true}
                            numberOfLines = {8}
                            placeholder = {"why do you need the book"}
                            onChangeText = {(text)=>{
                                this.setState({
                                    reasonToRequest:text
                                })
                            }}
                            value = {this.state.reasonToRequest}
                            />
                            <TouchableOpacity style = {styles.button}
                                onPress = {()=>this.addRequest(this.state.bookName,this.state.reasonToRequest)}>
                                    <Text style = {styles.registerButtonText}>register</Text>
                                </TouchableOpacity>
                                </View>
                                )
        }
                </KeyboardAvoidingView>
            </View>
        )
                        }
    }
}
const styles = StyleSheet.create({
    keyboardStyle:{
        flex:1,
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
})