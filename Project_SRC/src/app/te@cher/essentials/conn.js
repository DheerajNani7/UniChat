"use client"
import {auth, db, provider} from '../dbconnections/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider} from "firebase/auth"
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import {classifyUser} from '../dbconnections/getDetails'
async function userChecker(user){
    const userClassification = await classifyUser(user.email);
    console.log(userClassification.type)
    if (userClassification.type == "Not Verified"){
        alert("User not in DB")
    } else{
        alert("User in DB")
    }
}
export function Signuplogin(){
    const router = useRouter()
    const provider = new GoogleAuthProvider()
    function googleLogin(){
        signInWithPopup(auth,provider).then((result) =>{
            const credential = GoogleAuthProvider.credentialFromResult(result)
            const token = credential.accessToken
            const user = result.user
            userChecker(user)
            
        }).catch((error)=>{
            const errorCode = error.code
            const errorMessage = error.message
            const email = error.customData.email
            const credential  = GoogleAuthProvider.credentialFromError(error)
        })
    }
    function signupaccount(name, email, password) {
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user)
            try {
                const docRef =  addDoc(collection(db, "teacher"), {
                name:name,
                email:email,
                status:false
            });
            console.log("Document written with ID: ", docRef.id);
            } catch (e) {
                console.error("Error adding document: ", e);
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
        });
    }

    function loginaccount(email, password) {
    let statusVal

    const q =  query(collection(db, "teacher"), where("email", "==", email));
    getDocs(q).then((querySnapshot)=>{
        querySnapshot.forEach((doc)=>{
            console.log(doc.data().status)
            statusVal = doc.data().status
            console.log("statusval",statusVal)
            if (statusVal == true){
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("user",doc.data().name,user.email)

                router.push('/te@cher/prof')
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage)
            });
            }
            else{
                console.log("user not approved")
                window.alert("User is not approved yet!") 
            }
            })
        }).catch((error)=>{
        console.log("error",error)
    })
    }


    return{
        loginaccount:loginaccount,
        signupaccount:signupaccount,
        googleLogin: googleLogin
    }
}