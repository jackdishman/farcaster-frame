export interface IMatch {
    id: number;
    created_at: string;
    challenger_fid: string;
    challenger_fname: string;
    challenger_score: number;
    opponent_fid: string;
    opponent_fname: string;
    opponent_score: number;
    opponent_start_time: string;
}