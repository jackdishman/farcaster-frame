import { init, fetchQuery } from "@airstack/node";

export async function getFarcasterUsernames(fidList: (string | null)[]) {

  init(process.env.AIRSTACK_API_KEY ?? ``);

  console.log("fidList:", fidList);
  if (!fidList) {
    return [];
  }

  try {
    const query = `
  query MyQuery {
    Socials(
      input: {filter: {userId: {_in: ${fidList}}, dappName: {_eq: farcaster}}, blockchain: ethereum}
    ) {
      Social {
        dappName
        profileName
      }
    }
  }`;

    const { data, error } = await fetchQuery(query);

    console.log("data:", data);
    console.log("error:", error);
    const usernames = data?.Socials.map((s: any) => s.Social.profileName);
    console.log("usernames:", usernames);
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