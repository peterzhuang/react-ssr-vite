import express from 'express';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createServer as createViteServer } from 'vite';
import { handleModifyAnswerVotes } from '../shared/utility';
import { data } from '../shared/data';

async function createServer() {

    const app = new express();

    const isProd = process.env.NODE_ENV === 'production';

    const indexProd = isProd
    ? readFileSync(resolve(__dirname, '../dist/client/public/index.html'), 'utf-8')
    : ''
    let vite;

    if (!isProd) {
        vite = await createViteServer({
            logLevel: 'error',
            server: { middlewareMode: 'ssr' }
        });

        app.use(vite.middlewares);
        app.use(express.static("client"));
    } else {
        // app.use(express.static("client"));
        app.use(express.static("dist/client", {
            index: false
        }));
    }

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
            let template, render;
            if (!isProd) {
                template = readFileSync(resolve(__dirname, '../public/index.html'), 'utf-8');
                template = await vite.transformIndexHtml(url, template);
                render = (await vite.ssrLoadModule(resolve(__dirname, 'entry-server.jsx'))).renderMe;
            } else {
                template = indexProd;
                render = require(resolve(__dirname,'../dist/server/myServer.js')).renderMe;
            }

        const rendered = render();
        res.send(template.replace("{{rendered}}", rendered));

        } catch (e) {
            !isProd && vite.ssrFixStacktrace(e)
            console.log(e.stack)
            res.status(500).end(e.stack)
        }

    });

    app.listen(7777);
    console.info("Server is listening on 7777");

}

createServer();