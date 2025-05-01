export const authenticateApiKey = async (apiKey: string, baseUrl: string) => {
    try {
        console.log(`Authenticating api key: ${apiKey}`);
        const res = await fetch (`${baseUrl}/authenticate`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
            }
        });


        if (res.status === 200) {
            localStorage.setItem("apiKey", apiKey);
            return true;
        }
    } catch (error) {
        console.error(`Error authenticating api key:  ${error}`);
    }
}