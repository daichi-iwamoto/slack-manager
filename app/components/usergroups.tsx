"use client"

import Image from 'next/image'
import styles from '@/app/styles/usergroups.module.scss'
import { UsersListResponse } from "@slack/web-api"
import { UsergroupsListResponse } from '@/app/api/usergroups/route'
import type { Usergroup as DefaultUsergroup } from "@slack/web-api/dist/response/UsergroupsListResponse";
import { Dispatch, SetStateAction } from 'react'

const TakashimaImage = () => (
  <div className={styles.icon}>
    <Image
      src={"/takashima_mini.jpg"}
      alt={"takashima"}
      fill={true}
    />
  </div>
)

export type UsergroupsUsers = DefaultUsergroup & {
  users?: UsersListResponse["members"]
}

export type UsergroupDetails = Omit<UsergroupsListResponse, 'usergroups'> & {
  usergroups: UsergroupsUsers[]
}

export type UsergroupsProps = {
  isSpecialMode: boolean
  usergroupDetails?: UsergroupDetails["usergroups"]
  createCsv: (data: UsergroupsUsers[]) => Promise<void>
  user?: string
  setSpecialMode: Dispatch<SetStateAction<boolean>>
}

export default function Usergroups({
  isSpecialMode,
  usergroupDetails,
  createCsv,
  user,
  setSpecialMode
}: UsergroupsProps) {
  return (
    <main className={styles.usergroups}>
      {
        isSpecialMode ? (
          <div className={styles.takashima} />
        ) : null
      }
      {
        usergroupDetails ? (
          <>
            <div className={styles.download}>
              <button onClick={() => createCsv(usergroupDetails)}>
                CSV形式でダウンロード
              </button>
            </div>
            {
              (
                (
                  user === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
                  user === process.env.NEXT_PUBLIC_T_EMAIL
                ) && !isSpecialMode
              ) ? (
                <div className={styles.special}>
                  <button onClick={() => setSpecialMode(true)}>
                    高島モード
                  </button>
                </div>
              ) : null
            }
            <table>
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>User Name</th>
                  <th>User Handle</th>
                  <th>User ID</th>
                </tr>
              </thead>
              <tbody>
                {usergroupDetails?.map(usergroup => 
                {
                  const { id, name, handle, description, users } = usergroup

                  return (
                    <>
                      <tr key={id}>
                        <td
                          className={styles.groupname}
                          rowSpan={users?.length}
                          onClick={() => {
                            navigator.clipboard.writeText(`@${handle}`)
                              .then(() => alert(`@${handle}をコピーしました`))
                              .catch(() => alert(`@${handle}のコピーに失敗しました`))
                          }}
                        >
                          <p className={styles.name}>{ name }</p>
                          <p className={styles.handle}>@{ handle }</p>
                          <p className={styles.description}>{ description }</p>
                        </td>
                        {
                          users && users[0] ? (
                            <>
                              <td>
                                <div className={styles.username}>
                                  {
                                    isSpecialMode ? (
                                      <TakashimaImage />
                                    ) : 
                                      users[0]?.profile?.image_72 ? (
                                        <div className={styles.icon}>
                                          <Image
                                            src={ users[0]?.profile?.image_72 }
                                            alt={ users[0]?.profile?.display_name || "" }
                                            fill={true}
                                          />
                                        </div>
                                      ) : null
                                  }
                                  { users[0]?.real_name }
                                </div>
                              </td>
                              <td
                                className={styles.userHandle}
                                onClick={() => {
                                  navigator.clipboard.writeText(`@${users[0]?.profile?.display_name}`)
                                    .then(() => alert(`@${users[0]?.profile?.display_name}をコピーしました`))
                                    .catch(() => alert(`@${users[0]?.profile?.display_name}のコピーに失敗しました`))
                                }}
                              >
                                @{ users[0]?.profile?.display_name }
                              </td>
                              <td
                                className={styles.userId}
                                onClick={() => {
                                  navigator.clipboard.writeText(users[0]?.id || "")
                                    .then(() => {
                                      alert(`@${users[0]?.id}をコピーしました`)
                                    })
                                    .catch(() => {
                                      alert(`@${users[0]?.id}のコピーに失敗しました`)
                                    })
                                }}
                              >
                                { users[0]?.id }
                              </td>
                            </>
                          ) : (
                            <>
                              <td></td>
                              <td></td>
                              <td></td>
                            </>
                          )
                        }
                      </tr>
                      {
                        users ? users.map((user, index) => {
                          const { id, real_name, profile } = user

                          const UserCell = () => (
                            <>
                              <td>
                                <div className={styles.username}>
                                {
                                    isSpecialMode ? (
                                      <TakashimaImage />
                                    ) : 
                                    profile?.image_72 ? (
                                      <div className={styles.icon}>
                                        <Image
                                          src={ profile?.image_72 }
                                          alt={ profile?.display_name || "" }
                                          fill={true}
                                        />
                                      </div>
                                    ) : null
                                  }
                                  { real_name }
                                </div>
                              </td>
                              <td
                                className={styles.userHandle}
                                onClick={() => {
                                  navigator.clipboard.writeText(`@${profile?.display_name}`)
                                    .then(() => alert(`@${profile?.display_name}をコピーしました`))
                                    .catch(() => alert(`@${profile?.display_name}のコピーに失敗しました`))
                                }}
                              >
                                @{ profile?.display_name }
                              </td>
                              <td
                                className={styles.userId}
                                onClick={() => {
                                  navigator.clipboard.writeText(id || "")
                                    .then(() => alert(`${id}をコピーしました`))
                                    .catch(() => alert(`${id}のコピーに失敗しました`))
                                }}
                              >
                                { id }
                              </td>
                            </>
                          )

                          return index > 0 ? (
                            <tr key={index}>
                              <UserCell />
                            </tr>
                          ) : null
                        }) : (
                          <>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </>
                        )
                      }
                    </>
                  )
                })}
              </tbody>
            </table>
          </>
        ) : (
          <p>loading</p>
        )
      }
    </main>
  )
}