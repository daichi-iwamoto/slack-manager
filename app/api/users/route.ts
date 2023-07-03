import { WebClient, UsersListResponse } from "@slack/web-api";
import { NextResponse } from "next/server";

const client = new WebClient(process.env.SLACK_TOKEN);

export async function GET(): Promise<NextResponse<UsersListResponse>> {
  const response = await client.users.list({
    token: process.env.SLACK_TOKEN,
  });

  const data = response.members
  ? {
    ...response,
    members: response.members.map(({ id, real_name, profile }) => (
      {
        id,
        real_name,
        profile: {
          display_name: profile?.display_name || "",
          image_72: profile?.image_72 || ""
        }
      }
    ))
  }
  : response

  return NextResponse.json(data);
}