import { init, fetchQuery } from "@airstack/node";

init(process.env.AIRSTACK_API_KEY ?? ``);

export async function getFarcasterUsernames(fidList: (string | null)[]) {
    if(!fidList) {
        return [];
    }
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
  return usernames
}
