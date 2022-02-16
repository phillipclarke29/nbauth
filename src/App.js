import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react";

import { Auth, Hub } from 'aws-amplify';

const initialFormState = {
  username:'', password:'', authCode:'', formType:'signUp'
}


function App() {
  const [formState, updateFormState] = useState(initialFormState)
  const [user, updateUser] = useState(null);
  useEffect(() => {
    checkUser()
    setAuthListener()
  }, [])

  async function setAuthListener () {

    Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signOut':
          console.log('user signed out', data);
          updateFormState(() => ({... formState, formType: "signIn"}))
          break;
        default:
          break;

      }
    });

  }

  async function checkUser() {
    try {
      const user = await Auth.currentAuthenticatedUser()
      console.log('user:', user)
      updateUser(user)
      updateFormState(() => ({... formState, formType: "signedIn"}))
    } catch (err) {
      //updateUser
    }
  }
  function onChange(event) {
    event.persist()
    updateFormState(() => ({... formState, [event.target.name]: event.target.value }))
  }

  async function signUp(){
      const { username, password } = formState;
      await Auth.signUp({username, password, attributes:{  }})
      updateFormState(() => ({... formState, formType: "confirmSignUp"}))

  }
  async function confirmSignUp (){
    const { username, authCode } = formState;
    await Auth.confirmSignUp(username, authCode)
    updateFormState(() => ({... formState, formType: "signIn"}))
  }
  async function signIn() {
    const { username, password } = formState;
    await Auth.signIn(username, password)
    updateFormState(() => ({... formState, formType: "signedIn"}))
  }

  const {formType} = formState
  return (
    <div className="App">
      {
        formType === 'signUp' && (
            <div>
               <input name="username" onChange={onChange} placeholder="email"/>
               <input name="password" type="password" onChange={onChange} placeholder="password"/>
              <button onClick={signUp}>Sign Up</button>
              <button onClick={()=> updateFormState(()=>({
                ...formState, formType: 'signIn'
              }))}>Sign In</button>
            </div>
          )
      }
      {
          formType === 'confirmSignUp' && (
              <div>
                <input name="authCode" onChange={onChange} placeholder="Confirmation Code"/>
                <button onClick={confirmSignUp}>Confirm Sign Up</button>
              </div>
          )
      }
      {
          formType === 'signIn' && (
              <div>
                <input name="username" onChange={onChange} placeholder="email"/>
                <input name="password" type="password" onChange={onChange} placeholder="password"/>
                <button onClick={signIn}>Sign In</button>
                <button onClick={()=> updateFormState(()=>({
                  ...formState, formType: 'signUp'
                }))}>Sign Up</button>
              </div>
          )
      }
      {
          formType === 'signedIn' && (
              <div>
              <h1> Welcome to NBFire </h1>
                <h2>Automate your notebooks</h2>
                <button onClick={
                  ()=> Auth.signOut()
                }>Sign Out</button>
              </div>


          )
      }
    </div>
  );

}

export default App;
