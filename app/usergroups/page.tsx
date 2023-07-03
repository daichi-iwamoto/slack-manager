"use client";

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from '@/src/aws-exports';

import { UsersListResponse } from "@slack/web-api"
import { UsergroupsListResponse } from '@/app/api/usergroups/route'
import type { Usergroup as DefaultUsergroup } from "@slack/web-api/dist/response/UsergroupsListResponse";
import { useCallback, useEffect, useState } from "react"


Amplify.configure(awsExports);

type UsergroupsUsers = DefaultUsergroup & {
  users?: UsersListResponse["members"]
}
type UsergroupDetails = Omit<UsergroupsListResponse, 'usergroups'> & {
  usergroups: UsergroupsUsers[]
}

export default function Usergroups() {
  // ユーザーグループ詳細
  const [usergroupDetails, setUsergroupDetails] = useState<UsergroupDetails["usergroups"]>()
  // 特殊コマンド格納用
  const [command, setCommand] = useState<string>("")
  // 特殊コマンド判定
  const [isSpecialMode, setIsSpecialMode] = useState<boolean>(false)

  // ユーザーグループ一覧取得
  const getUserGroups = useCallback(async (): Promise<UsergroupDetails> => {
    const data = await fetch('/api/usergroups', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then(response => response.json())
      .catch(error => console.error(error))

    return data
  }, [])

  // ユーザー一覧取得
  const getUsers = useCallback(async (): Promise<UsersListResponse> => {
    const data = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then(response => response.json())
      .catch(error => console.error(error))

    return data
  },[])

  // ページ表示時に取得実行
  useEffect(() => {
    // ユーザーグループ詳細
    const usergroupDataDetails: UsergroupDetails["usergroups"] = []

    getUserGroups().then(getUserGroupData => {
      console.log("getUserGroups")
      getUsers().then(getUsersData => {
        console.log("getUsers")

        getUserGroupData.usergroups?.map(usergroup => {
          // ユーザーグループのユーザー詳細
          const userDataDetails: UsergroupsUsers[] = []

          usergroup?.users?.map(usergroupUser => {
            const usergroupUserDetails = getUsersData.members?.find(({ id }) => id === usergroupUser)
            if (usergroupUserDetails) {
              userDataDetails.push(usergroupUserDetails);
            }
          })
          usergroupDataDetails.push(
            {
              ...usergroup,
              users: userDataDetails
            }
          )
        })
        setUsergroupDetails(usergroupDataDetails)
      })
    })
  },[getUserGroups, getUsers])

  return (
    <Authenticator hideSignUp>
      {({ signOut, user }) => (
        <main>
          usergroups page
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}