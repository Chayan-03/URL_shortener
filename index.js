import express from 'express';
import PocketBase from 'pocketbase';
import {nanoid} from 'nanoid';
const app = express();

const pb = new PocketBase('http://127.0.0.1:8090');
pb.autoCancellation(false);
await pb.admins.authWithPassword('Demouser', '12345678demo');

app.use(express.json());
const PORT = 3000;

app.post('/shorten', async (req, res) => {
    const {url, expirydate} = req.body;

    if (!url) {
        return res.status(400).json({error: 'URL is required'});
    }

    const shortcode = nanoid(6);
    try {
        const record = await pb.collection('urls').create({
            originalurl: url,
            shortcode,
            expirydate: expirydate || null,
            createdate: new Date().toISOString(), // Use ISO format for consistency
            visitcount: 0
        });
        res.status(201).json({shortcode});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Failed to create short URL'});
    }
});

app.get('/:shortcode', async (req, res) => {
    const { shortcode } = req.params;
    try {
        const record = await pb.collection('urls').getFirstListItem(`shortcode = "${shortcode}"`);
        if (!record || (record.expirydate && new Date(record.expirydate) <= new Date())) {
            return res.status(404).json({error: 'URL not found or expired'});
        }

        await pb.collection('urls').update(record.id, {
            visitcount: record.visitcount + 1,
        });

        res.redirect(record.originalurl);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Failed to redirect URL', details: error.message});
    }
});

app.get('/stats/active', async (req, res) => {
    try {
        const records = await pb.collection('urls').getFullList({
            filter: 'expirydate > @now || expirydate = null'
        });

        // Group by creation date
        const groupedByDate = {};
        records.forEach(record => {
            const date = new Date(record.createdate).toLocaleDateString();
            if (!groupedByDate[date]) {
                groupedByDate[date] = [];
            }
            groupedByDate[date].push(record);
        });

        // Format response
        const resultsByDay = Object.keys(groupedByDate).map(date => {
            return {
                date,
                count: groupedByDate[date].length,
                urls: groupedByDate[date].map(r => ({
                    shortcode: r.shortcode,
                    originalurl: r.originalurl
                }))
            };
        });

        res.json({
            totalActiveCount: records.length,
            urlsByDay: resultsByDay
        });
    } catch (error) {
        res.status(500).json({error: 'Failed to get stats from the server'});
    }
});

app.get('/urls/recent', async (req, res) => {
    try {
        const result = await pb.collection('urls').getList(1, 5, {
            sort: '-createdate'
        });

        const recentUrls = result.items.map(record => ({
            shortcode: record.shortcode,
            originalurl: record.originalurl,
            createdate: record.createdate
        }));

        res.json({recentUrls});
    } catch (error) {
        res.status(500).json({error: 'Failed to get URLs from the server'});
    }
});

app.post('/urls/batch', async (req, res) => {
    const {urls} = req.body;

    if (!Array.isArray(urls)) {
        return res.status(400).json({error: 'URLs should be an array'});
    }

    try {
        const results = await Promise.all(urls.map(async (url) => {
            const shortcode = nanoid(6);
            const record = await pb.collection('urls').create({
                originalurl: url,
                shortcode,
                createdate: new Date().toISOString(),
                visitcount: 0
            });
            return {originalurl: url, shortcode};
        }));

        res.status(201).json({results});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Failed to create batch short URLs'});
    }
});

app.listen(PORT, () => {
    console.log(`URL shortener service listening on port ${PORT}`);
});