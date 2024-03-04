import { createClient } from "@supabase/supabase-js";
import { IMatch } from "@/types/wrestle";

const supabase = createClient(
  process.env["SUPABASE_URL"] ?? ``,
  process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? ``
);

export async function getChallenges(fid: number): Promise<IMatch[] | null> {
  try {
    const { data, error } = await supabase
      .from("match")
      .select("*")
      .eq("opponent_fid", fid);
    if (error) throw error;
    return data;
    // return data ? data as IMatch : null;
  } catch (error) {
    console.error("Error fetching match", error);
    throw new Error("Error fetching match");
  }
}

export async function getChallengeById(id: number): Promise<IMatch | null> {
  try {
    const { data, error } = await supabase
      .from("match")
      .select("*")
      .eq("id", id);
    if (error) throw error;
    return data ? (data[0] as IMatch) : null;
  } catch (error) {
    console.error("Error fetching match", error);
    throw new Error("Error fetching match");
  }
}

export async function createChallenge(
  challenger_fid: number,
  challenger_fname: string,
  opponent_fid: number,
  opponent_fname: string
): Promise<IMatch[] | null> {
  const { data, error } = await supabase
    .from("match")
    .insert([
      { challenger_fid, challenger_fname, opponent_fid, opponent_fname },
    ])
    .select();
  if (error) throw error;
  return data as unknown as IMatch[];
}

export async function updateChallenge(
  id: number,
  challenger_score: number,
  opponent_score: number
): Promise<IMatch | null> {
  const { data, error } = await supabase
    .from("match")
    .update({ challenger_score, opponent_score })
    .eq("id", id)
    .select();
  if (error) throw error;
  return data ? (data[0] as IMatch) : null;
}

export async function startOpponentWrestle(id: number): Promise<IMatch | null> {
  const { data, error } = await supabase
    .from("match")
    .update({ opponent_start_time: new Date() })
    .eq("id", id)
    .select();
  if (error) throw error;
  return data ? (data[0] as IMatch) : null;
}

export async function getCompletedMatches(): Promise<IMatch[] | null> {
  try {
    // where opponent_start_time is not null and opponent_score is not null and challenger_score is not null
    const { data, error } = await supabase
      .from("match")
      .select("*")
      .range(0, 4)
      .not("opponent_start_time", "is", null) // Filter out NULL values
      .order("opponent_start_time", { ascending: false });
    console.log(error);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching match", error);
    throw new Error("Error fetching match");
  }
}
