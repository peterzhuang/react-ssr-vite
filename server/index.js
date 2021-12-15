import express from 'express';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createServer as createViteServer } from 'vite';
import { handleModifyAnswerVotes } from '../shared/utility';
import { data } from '../shared/data';

// export const data = {
//     questions: [{
//         questionId:"Q1",
//         content:"Which back end solution should we use for our application?"
//     },{
//         questionId:"Q2",
//         content:"What percentage of developer time should be devoted to end-to-end testing?"
//     }],
//     answers: [{

//         answerId:"A1",
//         questionId:"Q1",
//         upvotes:2,
//         content: "Apache"

//     },{

//         answerId:"A2",
//         questionId:"Q1",
//         upvotes:0,
//         content:"Java"

//     },{

//         answerId:"A3",
//         questionId:"Q1",
//         upvotes:4,
//         content:"Node.js"

//     },{

//         answerId:"A4",
//         questionId:"Q2",
//         upvotes:2,
//         content:"25%"

//     },{

//         answerId:"A5",
//         questionId:"Q2",
//         upvotes:1,
//         content:"50%"

//     },{

//         answerId:"A6",
//         questionId:"Q2",
//         upvotes:1,
//         content:"75%"

//     }]
// }

async function createServer() {

    const app = new express();

    const vite = await createViteServer({
        logLevel: 'error',
        server: { middlewareMode: 'ssr' }
    });

    app.use(vite.middlewares);

    // app.use(express.static("client"));
    app.use(express.static("dist"));

    app.get("/data", async (_req, res) => {

        res.json(data);
    });

    app.get("/vote/:answerId", (req, res) => {
        const { query, params } = req;
        data.answers = handleModifyAnswerVotes(data.answers, params.answerId, +query.increment);
        res.send("OK");
    });

    app.get('/', async (req, res) => {

        try {
        const url = req.originalUrl;
        let index = readFileSync(resolve(__dirname, '../public/index.html'), 'utf-8');
        index = await vite.transformIndexHtml(url, index);
        const { renderMe } = await vite.ssrLoadModule(resolve(__dirname, 'entry-server.jsx'));
        const rendered = renderMe();

        res.send(index.replace("{{rendered}}", rendered));

        } catch (e) {
            vite.ssrFixStacktrace(e)
            console.log(e.stack)
            res.status(500).end(e.stack)
        }

    });

    app.listen(7777);
    console.info("Server is listening on 7777");

}

createServer();