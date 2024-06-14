
export const authenticateApiKey = async (apiKey, baseUrl) => {
    try {
        console.log(baseUrl);
        const res = await fetch (`${baseUrl}/authenticate`, {
            method: 'POST',
            body: apiKey,
            headers: {
                'x-api-key': apiKey,
            }
        });

        if (!res.ok) {
            throw new Error('Failed to authenticate api key');
        }

        localStorage.setItem("apiKey", apiKey);
        return true;
    } catch (error) {
        console.error(`Error authenticating api key:  ${error}`);
    }
}