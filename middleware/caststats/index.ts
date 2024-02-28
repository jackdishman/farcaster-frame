import { init, fetchQueryWithPagination } from "@airstack/node";
import { IFollower } from "@/types/followers";

// Assuming the Airstack client is initialized elsewhere or here if needed
init(process.env.AIRSTACK_API_KEY ?? ``);

export async function getFollowersStats(fid: string): Promise<IFollower[]> {
  const query = `
    query MyQuery {
      SocialFollowers(
        input: {
          filter: {identity: {_eq: "fc_fid:${fid}"}},
          blockchain: ALL,
          limit: 100
        }
      ) {
        Follower {
          followerAddress {
            socials(input: {filter: {dappName: {_eq: farcaster}}}) {
              profileName
              followerCount
              userId
            }
          }
        }
        pageInfo {
          hasNextPage
          nextCursor
        }
      }
    }`;

  let response;
  const followers: IFollower[] = [];

  try {
    while (true) {
      if (!response) {
        // First page or initial request
        response = await fetchQueryWithPagination(query);
      } else {
        // Fetching subsequent pages
        const nextPage = await response.getNextPage();
        if (nextPage) response = nextPage;
        else break; // Exit the loop if there's no next page
      }

      const { data, error, hasNextPage } = response;
      if (error) {
        throw error;
      }
      data.SocialFollowers.Follower.forEach((follower: any) => {
        if (!follower.followerAddress.socials || follower.followerAddress.socials.length === 0) return;
        const followerInfo: IFollower = {
          profileName: follower.followerAddress.socials[0].profileName,
          followerCount: follower.followerAddress.socials[0].followerCount,
          userId: follower.followerAddress.socials[0].userId,
        };
        followers.push(followerInfo);
      });

      if (!hasNextPage) {
        break; // Exit the loop if there's no next page
      }
    }

    return followers;
  } catch (err) {
    console.error("Error:", err);
    throw new Error("Airstack - getFollowersStats failed");
  }
}
