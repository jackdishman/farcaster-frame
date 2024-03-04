import { createClient } from "@supabase/supabase-js";
import type { IFollower } from "@/types/followers";

const supabase = createClient(
  process.env["SUPABASE_URL"] ?? ``,
  process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? ``
);

interface IGetFollowersResponse {
  updated: boolean;
  followers: IFollower[] | null;
}

export async function getFollowers(
  fid: string
): Promise<IGetFollowersResponse | null> {
  try {
    let { data, error } = await supabase
      .from("followers")
      .select("*")
      .eq("fid", fid)
      .single();
    console.log(`fetched data`, data);
    if (error) throw error;
    if (!data || data?.length === 0) return { updated: false, followers: null };
    // check if the followers are up to date
    const lastUpdated = new Date(data?.[`updated_at`]);
    const now = new Date();
    // check if last updated within 1 day
    const updated =
      lastUpdated &&
      now.getTime() - lastUpdated.getTime() < 1000 * 60 * 60 * 24;
    return { updated, followers: data?.followers ?? null };
  } catch (error) {
    console.error("Error fetching followers", error);
    return null;
  }
}

export async function addFollowersEntry(fid: string, followers: IFollower[]) {
  try {
    const { data, error } = await supabase
      .from("followers")
      .insert([{ fid, updated_at: new Date(), followers }]);
    if (error) throw error;
  } catch (error) {
    console.error("Error upserting followers", error);
  }
}

export async function updateFollowersEntry(
  fid: string,
  followers: IFollower[]
) {
  try {
    const { data, error } = await supabase
      .from("followers")
      .update({ updated_at: new Date(), followers })
      .eq("fid", fid);
    if (error) throw error;
  } catch (error) {
    console.error("Error upserting followers", error);
  }
}
