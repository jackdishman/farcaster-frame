import { getFollowersStats } from '@/middleware/caststats'
import React from 'react'
import { IFollower } from '@/types/followers'
import GraphComponent from '../graph';
import { addFollowersEntry, getFollowers, updateFollowersEntry } from '@/middleware/caststats/supabase';

export default async function Page({ params }: { params: { fid: string } }) {
    const {fid} = params;
    const followers:IFollower[] = [];

    // check to see if already have followers
    const followerRes = await getFollowers(fid);
    if(followerRes?.updated && followerRes?.followers !== null) {
        console.log(`using followers from db`)
        followers.push(...followerRes.followers);
    } else {
        // fetch followers from Farcaster
        const stats = await getFollowersStats(fid);
        console.log(`fetch followers from farcaster`)
        followers.push(...stats);
        // update if already has followers
        if(followerRes?.followers !== null){
            console.log(`update if already has followers`)
            await updateFollowersEntry(fid, stats);
        } else {
            // add new entry
            console.log(`add new entry`)
            await addFollowersEntry(fid, stats);
        }
    }

    followers.sort((a, b) => b.followerCount - a.followerCount);

    return (
        <div>
            <GraphComponent followers={followers} />
            <div>
            {followers.map((follower) => (
                <div className='flex' key={follower.userId}>
                    <span>{follower.profileName}</span>
                    <span className='mx-3'>{follower.userId}</span>
                    <span>{follower.followerCount}</span>
                </div>
            ))}
            </div>
        </div>
    )
}
