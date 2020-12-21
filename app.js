require('dotenv').config();
const express = require('express')
const app = express()
const port = 3000
const axios = require('axios');

app.use(express.json());

app.get('/vk/oauth', async (req, res) => {
    try {
        const accessTokenUri = 'https://oauth.vk.com/access_token';
        const vkApiUri = 'https://api.vk.com/method/friends.get';

        const code = req.query.code;

        const applicationId = configManager('VK_APPLICATION_ID');
        const clientSecret = configManager('VK_SECRET_KEY');
        const redirectUri = configManager('VK_REDIRECT_URI');
        const version = configManager('VK_VERSION');

        const result = await getRequest(accessTokenUri, {
            params: {
                client_id: applicationId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                code: code
            }
        });

        const friends = await getRequest(vkApiUri, {
            params: {
                fields: 'sex',
                access_token: result.access_token,
                v: version
            }
        });

        return res.status(200).json(friends).end();
    } catch (e) {
        return res.status(400).json({error: e.message}).end();
    }
});

const resolveResponse = (response) => {
    const isSuccessStatusCode = response.status >= 200 && response.status <= 299;
    if (!isSuccessStatusCode) throw new Error(response.statusText);
    return response.data;
}

const getRequest = async (uri, config) => {
    const response = await axios.get(uri, config);
    console.debug(uri, response);
    return resolveResponse(response);
}

const configManager = (key, defaultValue = null) => {
    return process.env[key] == null ? defaultValue : process.env[key];
}

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
