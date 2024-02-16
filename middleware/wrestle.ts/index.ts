import { createClient } from "@supabase/supabase-js";
import { IMatch } from "@/app/types/wrestle";

const supabase = createClient(
    process.env["SUPABASE_URL"] ?? ``,
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? ``
  );
  
export async function getChallenges(fid: number): Promise<IMatch | null> {
    try {
        const { data, error } = await supabase.from("match").select("*").eq("opponent", fid).single();
        if (error) throw error;
        return data ? data as IMatch : null;
    }
    catch (error) {
        console.error("Error fetching match", error);
        throw new Error("Error fetching match");
    }

}