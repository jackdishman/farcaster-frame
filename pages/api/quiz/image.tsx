import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import {Poll} from "@/app/types";
import {kv} from "@vercel/kv";
import satori from "satori";
import { join } from 'path';
import * as fs from "fs";
import { IQuiz } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const fontPath = join(process.cwd(), 'Roboto-Regular.ttf')
let fontData = fs.readFileSync(fontPath)

const supabase = createClient(
    process.env["SUPABASE_URL"] ?? ``,
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? ``
  );

  async function getQuiz(quizId: string) {
    try {
      const { data, error } = await supabase.from("quiz").select("*").eq('id', quizId);
      if (error) throw error;
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching quizzes", error);
    }
  }
  

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const quizId = req.query['quiz_id']
        // const questionId = req.query['question_id']
        const fid = parseInt(req.query['fid']?.toString() || '')
        if (!quizId) {
            return res.status(400).send('Missing quiz ID');
        }

        let quiz: IQuiz | null = await getQuiz(quizId as string) as unknown as IQuiz;

        if (!quiz) {
            return res.status(400).send('Missing poll ID');
        }

        const quizData = {
            title: quiz.title,
            description: quiz.description,
        };

        const svg = await satori(
            <div style={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                display: 'flex',
                width: '100%',
                height: '100%',
                backgroundColor: 'f4f4f4',
                padding: 50,
                lineHeight: 1.2,
                fontSize: 24,
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 20,
                }}>
                    <h2 style={{textAlign: 'center', color: 'lightgray'}}>{quizData.title}</h2>
                    <h3 style={{color: "darkgray"}}>{quizData.description}</h3>
                </div>
            </div>
            ,
            {
                width: 600, height: 400, fonts: [{
                    data: fontData,
                    name: 'Roboto',
                    style: 'normal',
                    weight: 400
                }]
            })

        // Convert SVG to PNG using Sharp
        const pngBuffer = await sharp(Buffer.from(svg))
            .toFormat('png')
            .toBuffer();

        // Set the content type to PNG and send the response
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'max-age=10');
        res.send(pngBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating image');
    }
}
