import { init, fetchQuery } from "@airstack/node";

export async function getFarcasterUsernames(fidList: (string | null)[]) {

  init(process.env.AIRSTACK_API_KEY ?? ``);

  if (!fidList) {
    return [];
  }

  try {
    const query = `
    query MyQuery($fidList: [String!]) {
      Socials(
        input: { filter: { userId: { _in: $fidList }, dappName: {_eq: farcaster}}, blockchain: ethereum}
      ) {
        Social {
          dappName
          profileName
        }
      }
    }
    `;

    const { data, error } = await fetchQuery(query, { fidList });

    if(error) {
      console.error("error:", error);
      throw new Error("Airstack - getFarcasterUsernames failed");
    }
    const usernames: string[] = data.Socials.Social.map((s: any) => s.profileName);
    return usernames;
  } catch (error) {
    console.error("error:", error);
    throw new Error("Airstack - getFarcasterUsernames failed");
  }
}


export async function getFidByFname(name: string) {
  const fname = name.replace("@", "").trim();

  init(process.env.AIRSTACK_API_KEY ?? ``);

  try {
    const query = `
    query MyQuery {
      Socials(
        input: {filter: {profileName: {_eq: "${fname}"}, dappName: {_eq: farcaster}}, blockchain: ethereum}
      ) {
        Social {
          dappName
          userId
        }
      }
    }`;

    const { data, error } = await fetchQuery(query);

    return data.Socials.Social[0].userId;
  } catch (error) {
    console.error("error:", error);
    throw new Error("Airstack - getFarcasterUsernames failed");
  }
}

export async function getFnameByFid(fid: string) {

  init(process.env.AIRSTACK_API_KEY ?? ``);

  try {
    const query = `
    query MyQuery {
      Socials(
        input: {filter: {userId: {_eq: "${fid}"}, dappName: {_eq: farcaster}}, blockchain: ethereum}
      ) {
        Social {
          dappName
          profileName
        }
      }
    }`;

    const { data, error } = await fetchQuery(query);

    return data.Socials.Social[0].profileName;
  } catch (error) {
    console.error("error:", error);
    throw new Error("Airstack - getFnameByFid failed");
  }
}