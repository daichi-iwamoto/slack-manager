"use client";

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from '@/src/aws-exports';
import { format } from "date-fns";

import { UsersListResponse } from "@slack/web-api"
import { useCallback, useEffect, useState } from "react"
import UsergroupsComponent, {
  UsergroupsProps,
  UsergroupsUsers,
  UsergroupDetails
} from '@/app/components/usergroups';

Amplify.configure(awsExports);

export default function Usergroups() {
  // ユーザーグループ詳細
  const [usergroupDetails, setUsergroupDetails] = useState<UsergroupDetails["usergroups"]>()
  // 特殊コマンド格納用
  const [command, setCommand] = useState<string>("")
  // 特殊コマンド判定
  const [isSpecialMode, setIsSpecialMode] = useState<boolean>(false)

  // CSV出力
async function createCsv(data: UsergroupDetails["usergroups"]) {
  const header = [
    "Group Name",
    "Group Handle",
    "User Name",
    "User Handle",
    "User ID"
  ].join(',')
  const rows = data.map(usergroup => (
    usergroup.users?.map(user => {
      const { profile, id } = user

      return [
        usergroup.name,
        `@${usergroup.handle}`,
        profile?.display_name,
        `@${profile?.display_name}`,
        id
      ].join(',')
    }).join('\n')
  ))

  const formattedCsvData = [header, ...rows].join('\n')

  const blob = new Blob([formattedCsvData], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `usergroup_${format(new Date(), 'yyyyMMddHHmmss')}.csv`
  a.click()
  
  URL.revokeObjectURL(url)
}

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
      {({ user }) => (
        <main>
          <UsergroupsComponent
            isSpecialMode={isSpecialMode}
            usergroupDetails={usergroupDetails}
            createCsv={createCsv}
            user={user?.attributes?.email}
            setSpecialMode={setIsSpecialMode}
          />
        </main>
      )}
    </Authenticator>
  );
}