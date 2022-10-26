import {Octokit} from "octokit";
import {Novu} from "@novu/node"

export default async function index(req, res) {
    const {send} = req.query,
        octokit = new Octokit(),
        q = "is:open is:issue label:good-first-issue",
        resp = await octokit.request("GET /search/issues", {q}),
        results = resp.data.items.map(item => ({
            name: item.title,
            author: item.user.login,
            labels: item.labels.map(label => label.name),
            url: item.html_url
        })),
        random = Math.floor(Math.random() * results.length + 1)
    if(send){
        const novu = new Novu(process.env.NOVU_TOKEN)
        novu.trigger('daily-first-issue', {
            to: {
                subscriberId: process.env.SUB_ID,
                email: process.env.MY_EMAIL
            },
            payload: {
                name: process.env.MY_NAME,
                title: results[random].name,
                author: results[random].author,
                labels: results[random].labels,
                url: results[random].url
            }
        });
    }
    res.status(200).json(results[random])
}
