import { WebClient, UsergroupsListResponse as DefaultUsergroupsListResponse } from "@slack/web-api";
import type { Usergroup as DefaultUsergroup } from "@slack/web-api/dist/response/UsergroupsListResponse";
import { NextResponse } from "next/server";

const client = new WebClient(process.env.SLACK_TOKEN);

type Usergroup = DefaultUsergroup & {
  users?: string[]
}

export type UsergroupsListResponse = Omit<DefaultUsergroupsListResponse, 'usergroups'> & {
  usergroups?: Usergroup[]
}

export async function GET(): Promise<NextResponse<UsergroupsListResponse>> {
  const response: UsergroupsListResponse = await client.usergroups.list({
    token: process.env.SLACK_TOKEN,
    include_users: true
  });

  const data = response.usergroups
    ? {
      ...response,
      usergroups: response.usergroups?.map(({ 
        id,
        name,
        description,
        handle,
        date_create,
        date_update,
        created_by,
        updated_by,
        users
      }) => ({
        id,
        name,
        description,
        handle,
        date_create,
        date_update,
        created_by,
        updated_by,
        users
      }))
    }
    : response

  return NextResponse.json(data);
}
